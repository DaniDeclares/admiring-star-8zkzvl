import { interpretLiveDiscoveryText } from './liveDiscoveryInterpreter2026.js';
import { composeScope, matchCandidates, validateCommercial, recognizeComposition } from './scopeComposer2026.js';

// Fixture catalog + commercial objects -- deliberately independent of live Supabase
// data so these tests exercise the pipeline's own logic, not catalog content.
const services = [
  { sku:'DNI-01B-004', name:'Bathroom Detail & Sanitization', service_family:'CLEANING', publicPrice:'$65/bath' },
  { sku:'DNI-01B-007', name:'Bedroom Light Clean', service_family:'CLEANING', publicPrice:'$45/room', intake_keywords:['vacuum','dust'] },
  { sku:'DNI-01A-010', name:'Standard Home Cleaning', service_family:'CLEANING', publicPrice:'Starting at $120' },
  { sku:'DNI-01A-011', name:'Deep Home Cleaning', service_family:'CLEANING', publicPrice:'Starting at $180' },
  { sku:'DNI-01A-020', name:'Fridge Interior Cleaning', service_family:'CLEANING', publicPrice:'$35' },
  { sku:'DNI-01A-021', name:'Oven Interior Cleaning', service_family:'CLEANING', publicPrice:'$35' },
  { sku:'DNI-01A-022', name:'Baseboard Detail', service_family:'CLEANING', publicPrice:'$25' },
  { sku:'DNI-01A-023', name:'Cabinet Interior Detail', service_family:'CLEANING', publicPrice:'$25' },
  { sku:'DNI-01A-024', name:'Interior Window Detail', service_family:'CLEANING', publicPrice:'$25' },
  { sku:'DNI-01A-030', name:'Garage Cleaning & Organization', service_family:'CLEANING', publicPrice:'Starting at $90' },
  { sku:'DNI-01A-031', name:'Junk & Clutter Removal', service_family:'HAULING', publicPrice:'Starting at $150' }
];

const addonRules = [
  { canonical_sku:'DNI-01A-020', addon_price_cents:2000, status:'SELL_NOW' },
  { canonical_sku:'DNI-01A-021', addon_price_cents:2000, status:'SELL_NOW' },
  { canonical_sku:'DNI-01A-022', addon_price_cents:1500, status:'SELL_NOW' },
  { canonical_sku:'DNI-01A-023', addon_price_cents:1500, status:'SELL_NOW' },
  { canonical_sku:'DNI-01A-024', addon_price_cents:1500, status:'SELL_NOW' }
];

const packages = [
  {
    id:'pkg1', package_code:'DEEP-TOTAL-RESET', package_name:'Deep Clean Total Reset',
    commercial_offer_status:'SELL_NOW', package_price_cents:30000, pricing_type:'FIXED_PACKAGE',
    components:[
      { canonical_sku:'DNI-01A-011', is_required:true },
      { canonical_sku:'DNI-01A-020', is_required:true },
      { canonical_sku:'DNI-01A-021', is_required:true },
      { canonical_sku:'DNI-01A-022', is_required:true },
      { canonical_sku:'DNI-01A-023', is_required:true },
      { canonical_sku:'DNI-01A-024', is_required:true }
    ]
  }
];

function run(text) {
  return composeScope(interpretLiveDiscoveryText(text), { services, addonRules, packages });
}

// 1. Krystal: "two bathrooms" then later "light vacuuming/dusting in one bedroom."
test('regression 1 -- Krystal: surfaces bathrooms and the bedroom light-clean add without a catalog search', () => {
  const result = run("She actually just needs two bathrooms. Could you also do some light vacuuming and dusting in one bedroom?");
  const skus = result.candidates.map(c => c.sku);
  expect(skus).toContain('DNI-01B-004');
  expect(skus).toContain('DNI-01B-007');
  expect(result.extractedFacts).toContainEqual(expect.objectContaining({ key:'bathroom_count', value:2 }));
});

// 2. 2BR/2BA standard cleaning, every two weeks -> recurring signal/package candidate.
test('regression 2 -- recurring signal surfaces as an unresolved question, never an invented subscription price', () => {
  const result = run('2BR/2BA standard cleaning, every two weeks');
  expect(result.candidates.map(c => c.sku)).toContain('DNI-01A-010');
  expect(result.extractedFacts).toContainEqual(expect.objectContaining({ key:'recurring_frequency', value:'BIWEEKLY' }));
  expect(result.unresolvedQuestions.some(q => /recurring/i.test(q))).toBe(true);
});

// 3. 2BR/2BA deep cleaning + fridge -> deep clean + add-on/package evaluation.
test('regression 3 -- fridge resolves as both a standalone and a distinctly priced add-on candidate', () => {
  const result = run("2BR/2BA deep cleaning, and she'd like the fridge done too");
  const fridge = result.candidates.find(c => c.sku === 'DNI-01A-020');
  expect(fridge).toBeTruthy();
  expect(fridge.roles).toContainEqual(expect.objectContaining({ role:'STANDALONE' }));
  expect(fridge.roles).toContainEqual(expect.objectContaining({ role:'ADD_ON', addonPriceCents:2000 }));
  expect(result.candidates.map(c => c.sku)).toContain('DNI-01A-011');
  expect(result.packageCandidate).toBeNull();
  expect(result.customCompositionCandidate).toBeTruthy();
});

// 4. 3BR/2BA deep + fridge + oven + baseboards + pet in home -> pet presence must NOT
//    automatically become a severe-pet condition.
test('regression 4 -- pet presence never auto-escalates to a severe-condition fact', () => {
  const result = run('3BR/2BA deep clean, fridge, oven and baseboards, and they do have a dog in the home');
  expect(result.extractedFacts).toContainEqual(expect.objectContaining({ key:'pet_present', value:true }));
  expect(result.extractedFacts.find(f => f.key === 'pet_condition_severity')).toBeUndefined();
  expect(result.candidates.map(c => c.sku)).toEqual(expect.arrayContaining(['DNI-01A-011','DNI-01A-020','DNI-01A-021','DNI-01A-022']));
});

// 5. Garage 500-750 sq ft + cleaning/organization + "I don't need junk or clutter
//    removed" -> explicit negative scope must suppress junk-removal inference.
test('regression 5 -- explicit negative scope suppresses the junk/clutter candidate but keeps garage organization', () => {
  const result = run('About a 500 to 750 sq ft garage, cleaning and organization, but I do not need junk or clutter removed');
  const skus = result.candidates.map(c => c.sku);
  expect(skus).toContain('DNI-01A-030');
  expect(skus).not.toContain('DNI-01A-031');
  expect(result.exclusions.some(e => e.sku === 'DNI-01A-031')).toBe(true);
});

// 6. 3BR/2BA deep + fridge + oven + baseboards + cabinet interiors + interior windows
//    -> package recognition/custom-composition test.
test('regression 6 -- full component set recognizes the governed package instead of pricing components separately', () => {
  const result = run('3BR/2BA deep cleaning with the fridge, oven, baseboards, cabinet interiors and interior windows all done');
  expect(result.packageCandidate).toBeTruthy();
  expect(result.packageCandidate.package_code).toBe('DEEP-TOTAL-RESET');
  expect(result.packageCandidate.satisfied).toBe(true);
  expect(result.customCompositionCandidate).toBeNull();
});

test('layer separation -- matchCandidates never sees packages/addons, recognizeComposition never re-reads raw text', () => {
  const evidence = interpretLiveDiscoveryText('deep cleaning, fridge and oven');
  const { candidates } = matchCandidates(evidence, services);
  const validated = validateCommercial(candidates, { addonRules });
  const { packageCandidate, customCompositionCandidate } = recognizeComposition(validated.map(c => c.sku), packages);
  expect(packageCandidate).toBeNull();
  expect(customCompositionCandidate.components.length).toBeGreaterThanOrEqual(2);
});
