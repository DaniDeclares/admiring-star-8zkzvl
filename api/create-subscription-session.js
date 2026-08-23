// DANI DECLARES LLC — SUBSCRIPTION CHECKOUT GATE
// Customer pricing and recurring plans are frozen during catalog reconciliation.
// No legacy plan ID may create a Stripe Checkout Session.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  return res.status(409).json({
    error: 'Recurring plans are temporarily unavailable while the canonical catalog is being reconciled.',
    code: 'CATALOG_RECONCILIATION_REQUIRED',
    next_step: '/request-service',
  });
}
