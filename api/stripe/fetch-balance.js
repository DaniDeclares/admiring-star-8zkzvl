import Stripe from 'stripe';
import { authenticatePortalRequest } from '../_portalAuth.js';

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;
const rateBuckets = new Map();
const FINANCIAL_ROLES = new Set(['admin', 'owner', 'staff_admin']);

function requestId(req) {
  return req.headers['x-request-id'] || (globalThis.crypto?.randomUUID?.() || `bal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
}

function consumeRateLimit(key) {
  const now = Date.now();
  const existing = rateBuckets.get(key);
  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    rateBuckets.set(key, { windowStart: now, count: 1 });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfter: 60 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((WINDOW_MS - (now - existing.windowStart)) / 1000))
    };
  }

  existing.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - existing.count, retryAfter: 60 };
}

function hasMfaSession(req) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const aal = payload.aal;
    const amr = Array.isArray(payload.amr) ? payload.amr : [];
    return aal === 'aal2' || amr.some((method) => {
      const value = typeof method === 'string' ? method : method?.method;
      return value === 'mfa' || value === 'totp' || value === 'otp';
    });
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  const id = requestId(req);
  res.setHeader('X-Request-Id', id);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (req.method !== 'GET') {
    console.warn(JSON.stringify({ event: 'stripe_balance_access', requestId: id, outcome: 'method_not_allowed', method: req.method }));
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let context;
  try {
    context = await authenticatePortalRequest(req);
  } catch (error) {
    console.error(JSON.stringify({ event: 'stripe_balance_access', requestId: id, outcome: 'auth_error', error: error.message }));
    return res.status(500).json({ error: 'Authentication service unavailable.' });
  }

  if (context?.error) {
    console.warn(JSON.stringify({ event: 'stripe_balance_access', requestId: id, outcome: 'unauthorized', reason: context.error }));
    return res.status(context.status || 401).json({ error: context.error });
  }

  if (!FINANCIAL_ROLES.has(context.role)) {
    console.warn(JSON.stringify({ event: 'stripe_balance_access', requestId: id, outcome: 'forbidden', userId: context.user.id, role: context.role }));
    return res.status(403).json({ error: 'This financial reporting action is not authorized for the current account.' });
  }

  if (!hasMfaSession(req)) {
    console.warn(JSON.stringify({ event: 'stripe_balance_access', requestId: id, outcome: 'mfa_required', userId: context.user.id, role: context.role }));
    return res.status(403).json({ error: 'Multi-factor authentication is required for financial balance reporting.' });
  }

  const limit = consumeRateLimit(`user:${context.user.id}`);
  res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
  res.setHeader('X-RateLimit-Remaining', String(limit.remaining));

  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    console.warn(JSON.stringify({ event: 'stripe_balance_access', requestId: id, outcome: 'rate_limited', userId: context.user.id, role: context.role }));
    return res.status(429).json({ error: 'Too many balance requests. Try again later.' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error(JSON.stringify({ event: 'stripe_balance_access', requestId: id, outcome: 'stripe_config_missing', userId: context.user.id }));
    return res.status(500).json({ error: 'Stripe configuration missing.' });
  }

  const stripe = new Stripe(stripeSecretKey);
  const { account } = req.query || {};

  try {
    const options = account ? { stripeAccount: account } : {};
    const balance = await stripe.balance.retrieve(options);

    const available = balance.available && balance.available.length > 0 ? balance.available : [{ amount: 0, currency: 'usd' }];
    const pending = balance.pending && balance.pending.length > 0 ? balance.pending : [{ amount: 0, currency: 'usd' }];

    console.info(JSON.stringify({ event: 'stripe_balance_access', requestId: id, outcome: 'success', userId: context.user.id, role: context.role, connectedAccount: Boolean(account) }));

    return res.status(200).json({
      success: true,
      balance: { ...balance, available, pending, livemode: balance.livemode || false }
    });
  } catch (error) {
    console.error(JSON.stringify({ event: 'stripe_balance_access', requestId: id, outcome: 'stripe_error', userId: context.user.id, error: error.message }));
    return res.status(500).json({ success: false, error: 'Failed to retrieve balance data.' });
  }
}
