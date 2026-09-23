import crypto from 'crypto';

// Signed, stateless confirmation tokens for the customer-facing Confirm
// Appointment / Request a Change lifecycle. The token itself only carries an
// appointment id and an expiry -- no pricing, no internal SKUs, no other
// customer data -- so it is safe to put in a link. The token's hash (never
// the raw token) is stored on dd_job_appointments so a token can be looked up
// server-side without keeping the raw value anywhere.
function secret() {
  // Falls back to the service-role key only so this ships working without a
  // new required env var. Safe: HMAC output never reveals the underlying
  // secret. Set APPOINTMENT_CONFIRMATION_SECRET in Vercel for a dedicated key.
  const value = process.env.APPOINTMENT_CONFIRMATION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error('APPOINTMENT_TOKEN_SECRET_NOT_CONFIGURED');
  return value;
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function mintAppointmentToken(appointmentId, ttlDays = 45) {
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  const payload = Buffer.from(JSON.stringify({ aid: appointmentId, exp: expiresAt.getTime() })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  const rawToken = `${payload}.${signature}`;
  return { rawToken, tokenHash: hashToken(rawToken), expiresAt };
}

export function verifyAppointmentToken(rawToken) {
  if (!rawToken || typeof rawToken !== 'string' || !rawToken.includes('.')) return null;
  const [payload, signature] = rawToken.split('.');
  const expectedSignature = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!decoded?.aid || !decoded?.exp) return null;
  if (Date.now() > Number(decoded.exp)) return null;
  return { appointmentId: decoded.aid, tokenHash: hashToken(rawToken) };
}
