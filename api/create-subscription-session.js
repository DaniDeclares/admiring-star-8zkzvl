// filename: api/create-subscription-session.js
// Vercel Serverless Function — governed B2B recurring subscription initialization

import Stripe from 'stripe';
import { getB2BOffer } from '../src/data/b2bCommercialCatalog2026.js';
import { PRICING_STATUS } from '../src/data/canonicalPricing2026.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key');

const B2B_SUBSCRIPTION_OFFERS = {
  'B2B-APT-RETAINER-1500': { subchannel: 'B2B_APT' },
  'B2B-APT-RETAINER-3250': { subchannel: 'B2B2C' },
  'B2B-OPS-RETAINER-4500': { subchannel: 'B2B_RE' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { planId, customerEmail, organizationName } = req.body || {};
  const commercialPlan = B2B_SUBSCRIPTION_OFFERS[planId];
  const offer = commercialPlan ? getB2BOffer(planId) : null;

  // Legacy retainer IDs are intentionally not accepted here. They remain historical
  // data until a deliberate subscriber-migration decision is made.
  if (!offer || offer.status !== PRICING_STATUS.LOCKED || offer.pricingModel !== 'MONTHLY_RETAINER') {
    return res.status(409).json({
      error: 'This retainer plan is not an active canonical B2B subscription offer.',
      code: 'RETAINER_REQUIRES_MIGRATION',
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [{
        price_data: {
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: {
            name: `DANI DECLARES - ${offer.name}`,
            description: `Commercial subchannel: ${commercialPlan.subchannel}. Organization: ${organizationName || 'B2B Partner'}`,
          },
          unit_amount: Math.round(offer.baseRate * 100),
        },
        quantity: 1,
      }],
      mode: 'subscription',
      metadata: {
        plan_id: planId,
        offer_id: offer.offerId,
        commercial_subchannel: commercialPlan.subchannel,
        organization_name: organizationName || 'B2B Partner',
      },
      success_url: 'https://www.danideclares.com/portal/admin?subscription=success',
      cancel_url: 'https://www.danideclares.com/services/property?subscription=cancelled',
    });

    return res.status(200).json({ success: true, sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe Subscription Session Initialization Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
