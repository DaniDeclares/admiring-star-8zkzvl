// filename: api/create-checkout-session.js
// Vercel Serverless Function — Dynamic Solution Checkout with Metadata String Truncation

import Stripe from 'stripe';
import { solutionsCatalog2026 } from '../src/data/solutionsData.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { publicId, solutionId, customerEmail, partnerCommunityCode } = req.body || {};
  const solution = solutionsCatalog2026[solutionId];

  if (!solution) return res.status(404).json({ error: 'Target solution package not found in 2026 catalog.' });

  if (solution.billingType === 'B2G_PROCUREMENT_ONLY') {
    return res.status(403).json({ error: 'B2G procurement pathways are restricted from open consumer digital checkouts.' });
  }

  let finalPrice = solution.basePrice;

  // Server-Side B2B Partner Resident Perk Calculation (15% Deduction)
  if (partnerCommunityCode && solutionId === 'sol-resident-movein') {
    finalPrice = finalPrice * 0.85; // 65.00 * 0.85 = 25.25
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: 'DANI DECLARES - ' + solution.name, 
            description: 'Tracking Ref: ' + publicId 
          },
          unit_amount: Math.round(finalPrice * 100) // Converted cleanly to cents
        },
        quantity: 1
      }],
      mode: 'payment',
      // CRITICAL STRIPE METADATA TRUNCATION: Truncates components to under 490 chars
      metadata: { 
        public_id: String(publicId || '').substring(0, 50),
        solution_id: String(solutionId || '').substring(0, 50),
        transaction_tier: String(solution.billingType || '').substring(0, 50),
        mapped_components: String(solution.components || []).join(', ').substring(0, 490),
        applied_partner_discount: partnerCommunityCode ? 'TRUE' : 'FALSE' 
      },
      success_url: 'https://www.danideclares.com/portal/photos?public_id=' + publicId + '&payment=success',
      cancel_url: 'https://www.danideclares.com/book?public_id=' + publicId + '&payment=cancelled'
    });

    return res.status(200).json({ success: true, sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe Session Initialization Failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
