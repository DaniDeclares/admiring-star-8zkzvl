// DANI DECLARES LLC — CANONICAL CATALOG SEED GATE
//
// Phase 0 intentionally seeds identity/capability structure only. It does not
// import historical prices, packages, solution bundles, provider payouts, or
// legacy channel models. Customer pricing is frozen until reconciliation.

import { createClient } from '@supabase/supabase-js';
import { COMPANY_WIDE_CATALOG } from '../src/config/canonicalCatalogRegistry.js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ajxezpczaemunlcmqlgl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedDatabase() {
  console.log('🌱 Seeding canonical Phase 0 catalog identities only...');

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Refusing to run without explicit credentials.');
  }

  for (const item of COMPANY_WIDE_CATALOG) {
    const { error } = await supabase.from('services').upsert({
      id: item.capabilityId,
      name: item.name,
      department: String(item.divisionId),
      pillar: item.serviceFamily,
      price_starting: null,
      price_fixed: null,
      status: item.lifecycleState,
    });

    if (error) {
      console.error(`Error seeding capability ${item.capabilityId}:`, error.message);
    }
  }

  console.log('✅ Canonical capability identities seeded without legacy pricing.');
  console.log('⛔ Solutions/packages are intentionally not seeded until commercial reconciliation.');
}

seedDatabase().catch((error) => {
  console.error('❌ Canonical seed gate failed:', error.message);
  process.exitCode = 1;
});
