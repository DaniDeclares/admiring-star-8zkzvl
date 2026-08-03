import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enforce Admin Secret Authorization Header
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_API_KEY;

  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ error: 'Unauthorized access to financial balance reporting.' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(500).json({ error: 'Stripe configuration missing.' });
  }

  const stripe = new Stripe(stripeSecretKey);
  const { account } = req.query || {};

  try {
    const options = account ? { stripeAccount: account } : {};
    const balance = await stripe.balance.retrieve(options);

    const available = balance.available && balance.available.length > 0 ? balance.available : [{ amount: 0, currency: 'usd' }];
    const pending = balance.pending && balance.pending.length > 0 ? balance.pending : [{ amount: 0, currency: 'usd' }];

    return res.status(200).json({
      success: true,
      balance: { ...balance, available, pending, livemode: balance.livemode || false }
    });
  } catch (error) {
    console.error('Fetch Stripe Balance Error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve balance data.' });
  }
}
