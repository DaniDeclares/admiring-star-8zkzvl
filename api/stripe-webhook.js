import Stripe from 'stripe';
import prisma from '../lib/prisma.js';

const secretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = secretKey ? new Stripe(secretKey) : null;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe || !webhookSecret) {
    console.error('Stripe webhooks unconfigured: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.');
    return res.status(500).json({ error: 'Stripe webhook configuration missing' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe Webhook Signature Verification Failed:', err.message);
    return res.status(400).send('Webhook Signature Error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const publicId = session.metadata?.public_id;

    if (publicId) {
      try {
        await prisma.serviceRequest.update({
          where: { publicId },
          data: { status: 'PAID' },
        });
        console.log(`Successfully updated Request ID ${publicId} to PAID status.`);
      } catch (dbErr) {
        console.error('Failed to update ServiceRequest status on payment:', dbErr.message);
      }
    }
  }

  return res.status(200).json({ received: true });
}
