// filename: scripts/generateStripeProducts.js
import Stripe from 'stripe';
import { catalog } from '../src/data/masterCatalog2026.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key');

async function buildProductionCatalog() {
  console.log('🏁 Initiating Live Stripe Product Catalog Construction...');

  for (const item of catalog) {
    if (item.status !== 'LOCKED_2026' || item.transactionType === 'CUSTOM_QUOTE') {
      console.log('⏩ Skipping custom or unverified item: ' + item.offerName);
      continue;
    }

    try {
      const product = await stripe.products.create({
        name: 'DANI DECLARES - ' + item.offerName,
        description: 'Department: ' + item.department + ' | Transaction: ' + item.transactionType,
        metadata: {
          department: item.department,
          transaction_type: item.transactionType,
          offer_id: item.offerId
        }
      });

      const baseAmount = item.transactionType === 'DEPOSIT' ? (item.workingBaselineRate * 0.5) : item.workingBaselineRate;
      
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(baseAmount * 100),
        currency: 'usd',
      });

      console.log('✅ Successfully provisioned: ' + item.offerName + ' -> Product ID: ' + product.id + ' | Price ID: ' + price.id);
    } catch (err) {
      console.error('❌ System failure provisioning item ' + item.offerName + ':', err.message);
    }
  }
}

buildProductionCatalog();
