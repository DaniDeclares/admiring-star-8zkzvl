// Legacy travel-quote endpoint intentionally disabled.
// DANI DECLARES no longer uses a mileage/per-mile customer pricing engine.
// Geographic treatment must come from the current market/service-area and
// reconciled commercial architecture.

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(410).json({
    success: false,
    code: 'LEGACY_TRAVEL_PRICING_DISABLED',
    error: 'The legacy mileage travel-fee engine has been retired. Submit a governed service request for current market and scope treatment.',
  });
}
