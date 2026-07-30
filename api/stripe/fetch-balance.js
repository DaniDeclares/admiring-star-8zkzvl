import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { account } = req.query || {};
  if (!account) {
    return res.status(400).json({ error: 'Missing required query parameter: account' });
  }

  try {
    // Retrieve balance for a connected account (Stripe Connect)
    // Use the second argument to pass the connected account context.
    const balance = await stripe.balance.retrieve({}, { stripeAccount: String(account) });

    // Ensure arrays are present and return only the safe fields the frontend expects
    const available = Array.isArray(balance?.available) ? balance.available : [];
    const pending = Array.isArray(balance?.pending) ? balance.pending : [];

    return res.status(200).json({
      success: true,
      balance: {
        available,
        pending,
        livemode: !!balance?.livemode,
      },
    });
  } catch (err) {
    console.error('api/stripe/fetch-balance error:', err?.message || err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve balance' });
  }
}
