import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  let event;

  try {
    const buf = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => { resolve(Buffer.from(data)); });
      req.on('error', reject);
    });

    event = stripe.webhooks.constructEvent(
      buf,
      req.headers['stripe-signature'],
      endpointSecret
    );
  } catch (err) {
    console.error(`Webhook signature error:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle specific Stripe events here:
  switch (event.type) {
    case 'account.updated':
      console.log('✅ Stripe account updated:', event.data.object.id);
      break;
    case 'account.application.authorized':
      console.log('✅ Account authorized for platform:', event.data.object.id);
      break;
    case 'checkout.session.completed':
      console.log('✅ Checkout session completed:', event.data.object.id);
      break;
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}
