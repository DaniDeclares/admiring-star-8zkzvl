// SKU-specific release-contract evaluators for DNI-01A-001 Resident Refresh.
import { calculate, validateQuoteLineContract } from './quoteBuilder2026.js';

export const DNI_01A_001 = 'DNI-01A-001';
export const GOVERNED_PRICE_CENTS = 14000;
export const CANONICAL_IN_SCOPE_ANSWERS = Object.freeze({
  bedroom_count: '1', bathroom_count: '1', layout_type: 'apartment', occupancy: 'vacant',
  mess_degree: 'standard', odor_level: 'none', pet_condition: 'none', square_footage: 1000,
  tax_rate_percent: 0,
});
const OUT_OF_SCOPE = [
  ['2 bedrooms', { bedroom_count: '2' }],
  ['2 bathrooms', { bathroom_count: '2' }],
  ['1,001 sq ft', { square_footage: 1001 }],
  ['missing square footage', { square_footage: undefined }],
];
const PRE_RUNTIME_GATES = new Set([
  'BLOCKED', 'CANONICAL_IDENTITY', 'COMMERCIAL_DEFINITION', 'ECONOMICS', 'PRICING_ENGINE',
  'QUOTE_PATH', 'CHANNEL_AUTHORIZATION', 'FULFILLMENT_MATRIX', 'PAYMENT_LEDGER',
]);
const lockedRules = (rules) => (rules || []).filter(
  (r) => r.channel_code === 'CH01' && r.status === 'ACTIVE' && r.lock_status === 'LOCKED',
);
const hasTs = (v, k) => Boolean(v && v[k]);

function runtimeLine(service, offer, answers) {
  const calcService = {
    ...service,
    commercial_intent_status: offer?.fulfillment_gate_status === 'READY'
      ? (offer?.commercial_offer_status === 'SELL_NOW' ? 'SELL_NOW' : offer?.commercial_offer_status)
      : offer?.fulfillment_gate_status,
  };
  const itemAnswers = { ...answers, apply_resident_discount: false, apartment_resident: false };
  const item = { serviceSku: service?.sku, answers: itemAnswers, componentRole: 'PRIMARY' };
  validateQuoteLineContract(calcService, itemAnswers, item, [item]);
  return calculate(calcService, null, itemAnswers);
}

export function evaluateRuntime({ sku, release, verification, offers, service, rules }) {
  const failures = [], notes = [], f = (m) => failures.push(`RUNTIME: ${m}`);
  if (sku !== DNI_01A_001) f('proof is bound to DNI-01A-001');
  if (!release) f('release contract row missing');
  if (!verification) f('verification row missing');
  if (!service) f('services row missing');
  const offer = (offers || [])[0];
  if (!offer) f('governed offer row missing');
  if ((offers || []).length !== 1) f('expected one governed offer');
  if (failures.length) return { failures, notes };

  if (service.sku !== sku) f('service sku mismatch');
  if (offer.runtime_service_id !== service.id) f('offer runtime_service_id mismatch');
  if (service.is_active !== true) f('service is not active');
  if (String(service.pricing_type).toUpperCase() !== 'FIXED') f('service pricing_type is not FIXED');
  if (Number(service.base_price_cents) !== GOVERNED_PRICE_CENTS) f('base_price_cents expected 14000');
  if (Number(service.starting_price) !== 140) f('starting_price expected 140');

  const lr = lockedRules(rules);
  if (lr.length !== 1) f('expected exactly one ACTIVE+LOCKED CH01 pricing rule');
  if (lr[0] && Number(lr[0].base_price_cents) !== GOVERNED_PRICE_CENTS) f('locked CH01 rule price drifted');
  if (lr[0] && String(lr[0].pricing_type).toUpperCase() !== 'FIXED') f('locked CH01 rule pricing_type drifted');
  if (lr[0] && String(lr[0].billing_cycle).toUpperCase() !== 'ONETIME') f('locked CH01 rule billing_cycle drifted');
  if (!verification.stripe_price_verified_at) f('stripe_price_verified_at missing');

  const schema = service.quote_input_schema || {}, b = schema.scope_boundary || {};
  if (!String(schema.ui_mode || '').startsWith('SPECIALIZED_')) f('ui_mode is not SPECIALIZED_');
  if (schema.pricing_model !== 'FIXED_SCOPE') f('pricing_model expected FIXED_SCOPE');
  if (Number(b?.bedroom_count?.max) !== 1 || Number(b?.bathroom_count?.max) !== 1 || Number(b?.square_footage?.max) !== 1000) f('scope boundary drifted');
  if (b.out_of_scope_action !== 'REQUIRE_DIFFERENT_SERVICE_OR_QUOTE') f('out_of_scope_action drifted');

  try {
    const c = runtimeLine(service, offer, CANONICAL_IN_SCOPE_ANSWERS);
    if (c.baseSubtotal !== 140 || c.estimatedTotal !== 140) f('in-scope estimate is not exactly $140');
    else notes.push('RUNTIME: in-scope estimate = $140');
  } catch (e) {
    f(`canonical in-scope request rejected: ${e.message}`);
  }
  for (const [label, patch] of OUT_OF_SCOPE) {
    const a = { ...CANONICAL_IN_SCOPE_ANSWERS, ...patch };
    if (patch.square_footage === undefined && 'square_footage' in patch) delete a.square_footage;
    try {
      runtimeLine(service, offer, a);
      f(`ACCEPTED out-of-scope request (${label})`);
    } catch {
      notes.push(`RUNTIME: out-of-scope (${label}) rejected`);
    }
  }
  return { failures, notes };
}

export function evaluateRegression({ sku, release, verification, service, rules, receipts }) {
  const failures = [], notes = [], f = (m) => failures.push(`REGRESSION: ${m}`);
  if (sku !== DNI_01A_001) f('proof is bound to DNI-01A-001');
  if (!release) f('release contract row missing');
  if (!verification) f('verification row missing');
  if (failures.length) return { failures, notes };

  const runtime = hasTs(verification, 'runtime_verified_at');
  const smoke = hasTs(verification, 'production_smoke_verified_at');
  const regression = hasTs(verification, 'regression_verified_at');
  if (release.runtime_verified !== runtime) f('runtime_verified does not match runtime_verified_at');
  if (release.production_smoke_verified !== smoke) f('production_smoke_verified does not match production_smoke_verified_at');
  if (release.regression_verified !== regression) f('regression_verified does not match regression_verified_at');
  if (release.runtime_accuracy_ok !== (runtime && smoke)) f('runtime_accuracy_ok is not runtime AND production smoke');
  if (release.release_state === 'LIVE_READY' && !(runtime && smoke && regression)) f('LIVE_READY while verification timestamps are incomplete');

  // Gate-order assertions apply only after all earlier release gates are clear.
  // An earlier legitimate blocker must not make the release-proof itself fail.
  const earlierGateBlocking = PRE_RUNTIME_GATES.has(release.blocking_gate);
  if (!earlierGateBlocking) {
    if (!(runtime && smoke) && release.blocking_gate !== 'RUNTIME_ACCURACY') f('expected blocking_gate RUNTIME_ACCURACY');
    if (runtime && smoke && !regression && release.blocking_gate !== 'REGRESSION_VERIFIED') f('expected blocking_gate REGRESSION_VERIFIED');
    if (runtime && smoke && regression && !['OFFER_ACTIVATION', 'NONE'].includes(release.blocking_gate)) f('expected OFFER_ACTIVATION or NONE after release proofs');
  } else {
    notes.push(`REGRESSION: earlier governed gate remains blocking (${release.blocking_gate})`);
  }

  const list = receipts || [], has = (k) => list.some((r) => r.proof_kind === k && r.proof_result === 'PASS');
  if (runtime && !has('RUNTIME')) f('runtime_verified_at present without a governed RUNTIME receipt');
  if (smoke && !has('PRODUCTION_SMOKE')) f('production_smoke_verified_at present without a governed PRODUCTION_SMOKE receipt');
  if (regression && !has('REGRESSION')) f('regression_verified_at present without a governed REGRESSION receipt');
  for (const r of list) {
    if (r.proof_result !== 'PASS') f(`non-PASS receipt ${r.id}`);
    if (r.proof_kind === 'PRODUCTION_SMOKE' && r.proof_environment !== 'PRODUCTION') f(`PRODUCTION_SMOKE receipt ${r.id} not from PRODUCTION`);
    if (!r.source_sha || !r.workflow_run_id || !r.receipt_uri) f(`receipt ${r.id} missing provenance`);
  }

  if (Number(service?.base_price_cents) !== GOVERNED_PRICE_CENTS) f('locked $140 service price drifted');
  const lr = lockedRules(rules);
  if (lr.length !== 1 || Number(lr[0]?.base_price_cents) !== GOVERNED_PRICE_CENTS) f('locked CH01 $140 rule drifted');
  const b = service?.quote_input_schema?.scope_boundary || {};
  if (Number(b?.bedroom_count?.max) !== 1 || Number(b?.bathroom_count?.max) !== 1 || Number(b?.square_footage?.max) !== 1000) f('scope boundary drifted');
  notes.push('REGRESSION: release contract remains fail-closed');
  return { failures, notes };
}

export const WRITER_NEGATIVE_PROBES = Object.freeze([
  { label: 'PRODUCTION_SMOKE from TESTER', args: { p_proof_kind: 'PRODUCTION_SMOKE', p_proof_environment: 'TESTER', p_proof_result: 'PASS' } },
  { label: 'non-PASS result', args: { p_proof_kind: 'RUNTIME', p_proof_environment: 'TESTER', p_proof_result: 'FAIL' } },
  { label: 'unsupported proof kind', args: { p_proof_kind: 'GENERIC_GREEN', p_proof_environment: 'TESTER', p_proof_result: 'PASS' } },
]);
