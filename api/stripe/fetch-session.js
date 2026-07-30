import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query || {};
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing required query parameter: sessionId' });
  }

  try {
    // Retrieve the Checkout Session and expand common related objects for convenience.
    const session = await stripe.checkout.sessions.retrieve(String(sessionId), {
      expand: ['line_items', 'customer']
    });

    // Return a safe representation of the session. Do not expose secret keys.
    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error('api/stripe/fetch-session error:', err?.message || err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve session' });
  }
}
