import Stripe from 'stripe';
import prisma from '../lib/prisma.js';
import { nextStateAfterPayment, assertTransition } from '../src/lib/operations/workflowStateMachines2026.js';

const secretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = secretKey ? new Stripe(secretKey) : null;

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

function readChannel(propertyDetails) {
  return propertyDetails?.operationsRouting?.channelType || propertyDetails?.operationsRouting?.channel || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!stripe || !webhookSecret) {
    console.error('Stripe webhooks unconfigured: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.');
    return res.status(500).json({ error: 'Stripe webhook configuration missing' });
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], webhookSecret);
  } catch (err) {
    console.error('Stripe Webhook Signature Verification Failed:', err.message);
    return res.status(400).send('Webhook Signature Error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const requestId = session.metadata?.request_id;

    if (requestId) {
      try {
        const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
        if (!request) throw new Error(`ServiceRequest ${requestId} not found`);

        const channel = readChannel(request.property_details);
        if (channel !== 'B2C') {
          throw new Error(`Payment webhook cannot auto-create a job for channel ${channel || 'UNKNOWN'}`);
        }

        const currentState = String(request.status || 'new').toUpperCase();
        assertTransition('B2C', currentState, 'PAID');
        assertTransition('B2C', 'PAID', nextStateAfterPayment('B2C'));

        const existingJob = await prisma.dd_jobs.findFirst({
          where: { service_request_id: request.id },
          select: { id: true, public_reference: true },
        });

        let job = existingJob;
        if (!job) {
          const estimate = await prisma.dd_estimates.findFirst({
            where: { service_request_id: request.id },
            orderBy: { created_at: 'desc' },
            select: { id: true, division_slug: true },
          });

          job = await prisma.dd_jobs.create({
            data: {
              estimate_id: estimate?.id || null,
              lead_id: request.leadId || null,
              service_request_id: request.id,
              division_slug: estimate?.division_slug || 'concierge',
              job_title: request.service_needed || request.service_category || 'Dani Declares Service',
              job_status: 'new',
              location_address: request.location_address || null,
              scope_summary: request.request_details || null,
            },
            select: { id: true, public_reference: true },
          });
        }

        await prisma.serviceRequest.update({
          where: { id: request.id },
          data: { status: 'job_created' },
        });

        console.log(`B2C payment accepted; request ${request.id} -> job ${job.public_reference}.`);
      } catch (dbErr) {
        console.error('Failed to transition paid B2C request:', dbErr.message);
        return res.status(500).json({ error: 'Payment received but operational transition failed' });
      }
    }
  }

  return res.status(200).json({ received: true });
}
