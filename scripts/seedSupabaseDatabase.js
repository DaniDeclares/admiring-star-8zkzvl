// filename: scripts/seedSupabaseDatabase.js
// DANI DECLARES LLC — AUTOMATED SUPABASE DATABASE SEEDING SCRIPT

import { createClient } from '@supabase/supabase-js';
import { catalog } from '../src/data/masterCatalog2026.js';
import { solutionsCatalog2026 } from '../src/data/solutionsData.js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ajxezpczaemunlcmqlgl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedDatabase() {
  console.log('🌱 Initiating Automated Supabase Database Seeding...');

  try {
    // 1. Seed Master Catalog Services
    for (const item of catalog) {
      const { error } = await supabase.from('services').upsert({
        id: item.offerId,
        name: item.offerName,
        department: item.department,
        pillar: item.pillar,
        price_starting: item.startingPrice,
        price_fixed: item.fixedPrice,
        status: item.status
      });
      if (error) console.error('Error seeding service ' + item.offerId + ':', error.message);
    }
    console.log('✅ Services Table Seeded Successfully.');

    // 2. Seed Multi-Department Solutions
    for (const sol of Object.values(solutionsCatalog2026)) {
      const { error } = await supabase.from('solutions').upsert({
        id: sol.id,
        name: sol.name,
        base_price: sol.basePrice,
        billing_type: sol.billingType,
        components: sol.components
      });
      if (error) console.error('Error seeding solution ' + sol.id + ':', error.message);
    }
    console.log('✅ Solutions Table Seeded Successfully.');

  } catch (err) {
    console.error('❌ Database Seeding Exception:', err.message);
  }
}

seedDatabase();
