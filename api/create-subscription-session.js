// filename: api/create-subscription-session.js
// Vercel Serverless Function — Stripe Recurring Subscription Initialization

import Stripe from 'stripe';
import { RETAINER_PLANS_2026 } from '../src/data/retainerPlansData.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planId, customerEmail, organizationName } = req.body || {};
  const plan = RETAINER_PLANS_2026.find(p => p.planId === planId);

  if (!plan) {
    return res.status(404).json({ error: 'Selected retainer plan not found.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: {
              name: 'DANI DECLARES - ' + plan.name,
              description: 'Organization: ' + (organizationName || 'B2B Partner')
            },
            unit_amount: Math.round(plan.monthlyPrice * 100)
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      metadata: {
        plan_id: planId,
        organization_name: organizationName || 'B2B Partner'
      },
      success_url: 'https://www.danideclares.com/portal/admin?subscription=success',
      cancel_url: 'https://www.danideclares.com/services/property?subscription=cancelled'
    });

    return res.status(200).json({ success: true, sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe Subscription Session Initialization Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
