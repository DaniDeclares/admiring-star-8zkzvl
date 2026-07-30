// filename: api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId, offerName, priceAmount, customerEmail } = req.body || {};

  if (!publicId) {
    return res.status(400).json({ error: 'Missing required public_id for session metadata.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: offerName || 'DANI DECLARES Execution Service',
              description: 'Project Tracking ID: ' + publicId
            },
            unit_amount: Math.round((priceAmount || 50) * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      metadata: {
        public_id: publicId
      },
      success_url: 'https://www.danideclares.com/portal/photos?public_id=' + publicId + '&payment=success',
      cancel_url: 'https://www.danideclares.com/book?public_id=' + publicId + '&payment=cancelled'
    });

    return res.status(200).json({ success: true, sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe Session Initialization Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
