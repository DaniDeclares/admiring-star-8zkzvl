import { buffer } from 'micro';
import Stripe from 'stripe';
import { saveOrder } from '../../lib/db';               // <— implement this
import { sendConfirmationEmail } from '../../lib/mail'; // <— implement this

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  let event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(
      buf,
      req.headers['stripe-signature'],
      endpointSecret
    );
  } catch (err) {
    console.error('❌ Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'account.updated': {
        console.log('✅ Stripe account updated:', event.data.object.id);
        break;
      }
      case 'account.application.authorized': {
        console.log('✅ Account authorized for platform:', event.data.object.id);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object;

        // 1) Persist the order in your DB
        await saveOrder({
          sessionId: session.id,
          customerId: session.customer,
          amount: session.amount_total,
          currency: session.currency,
          accountId: session.payment_intent.transfer_data.destination,
        });

        // 2) Send a confirmation email
        await sendConfirmationEmail({
          to: session.customer_details.email,
          sessionId: session.id,
          amount: session.amount_total,
          billingCycle: session.metadata.billing_cycle, // if you set this
        });

        console.log('✅ Checkout session completed & fulfilled:', session.id);
        break;
      }
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('❌ Error handling webhook event:', err);
    return res.status(500).send('Internal Server Error');
  }

  res.json({ received: true });
}
