import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const CHANNELS = Object.freeze({ regular_resident: 'CH01', apartment_resident: 'CH01', property_manager: 'CH02', realtor: 'CH03', business: 'CH04', government: 'CH05' });
const ESTIMATE_CLIENT_TYPES = Object.freeze({ regular_resident: 'other', apartment_resident: 'renter', property_manager: 'property_manager', realtor: 'realtor', business: 'business', government: 'other' });
const json = (res, status, payload) => res.status(status).json(payload);
const money = value => Math.round(Number(value || 0) * 100) / 100;

async function loadServices(supabase) {
  const { data, error } = await supabase.from('dd_governed_service_offers')
    .select('id,canonical_sku,service_name,division,commercial_object_type,commercial_offer_status,fulfillment_gate_status,runtime_service_id,pricing_rule_count,market_rule_count,channel_availability_count,priced_channel_count,ch01_a_priced,ch01_b_priced')
    .neq('commercial_offer_status', 'DO_NOT_SELL')
    .order('division', { ascending: true }).order('canonical_sku', { ascending: true });
  if (error) throw error;
  const runtimeIds = (data || []).map(row => row.runtime_service_id).filter(Boolean);
  const { data: services, error: serviceError } = runtimeIds.length ? await supabase.from('services').select('id,sku,name,service_family,pricing_type,billing_cycle,starting_price,base_price_cents,price_note,public_price_low,public_price_high,public_price_display,quote_input_schema,commercial_status,commercial_intent_status,resident_discount_eligible,is_active').in('id', runtimeIds) : { data: [], error: null };
  if (serviceError) throw serviceError;
  const byId = new Map((services || []).map(s => [s.id, s]));
  return (data || []).map(o => {
    const s = byId.get(o.runtime_service_id) || {};
    return { ...s, sku: o.canonical_sku, name: o.service_name, division_id: Number(o.division), service_family: s.service_family || null, commercial_status: s.commercial_status || o.commercial_offer_status, commercial_intent_status: s.commercial_intent_status || o.fulfillment_gate_status, governedOfferStatus: o.commercial_offer_status, fulfillmentGateStatus: o.fulfillment_gate_status, publicPrice: s.public_price_display || (s.starting_price != null ? `Starting at $${Number(s.starting_price).toFixed(2)}` : 'Quote required'), quoteQuestions: s.quote_input_schema?.fields || [] };
  });
}

async function loadRules(supabase, serviceId, channelCode) {
  const { data, error } = await supabase.from('dd_service_pricing_rules').select('id,channel_code,pricing_type,billing_cycle,base_price_cents,resident_discount_eligible,lock_status,status').eq('service_id', serviceId).eq('channel_code', channelCode).eq('status', 'ACTIVE').order('effective_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

function calculate({ service, rule, answers }) {
  const a = answers || {};
  let base = Number(a.manual_base_price || 0);
  if (!base) base = rule?.base_price_cents != null ? Number(rule.base_price_cents) / 100 : Number(service.starting_price || service.public_price_low || 0);
  const quantity = Math.max(1, Number(a.quantity || 1));
  const hours = Math.max(0, Number(a.hours || 0));
  const pricingType = String(rule?.pricing_type || service.pricing_type || '').toUpperCase();
  if (pricingType.includes('HOURLY')) base *= Math.max(1, hours || 1);
  else if (pricingType.includes('PER_UNIT') || pricingType.includes('PER_BASKET') || pricingType.includes('PER_ITEM')) base *= quantity;
  const miles = Math.max(0, Number(a.miles_one_way || 0));
  const travelFee = Boolean(a.apply_standard_travel) ? Math.max(0, miles - 15) * 2.5 : 0;
  const materials = Math.max(0, Number(a.materials_cost || 0));
  const sourcingFee = materials * 0.10;
  const passThrough = Math.max(0, Number(a.pass_through_cost || 0));
  const rushFee = Boolean(a.rush) ? (base + travelFee) * 0.25 : 0;
  const residentDiscount = Boolean(a.apartment_resident) && Boolean(rule?.resident_discount_eligible ?? service.resident_discount_eligible);
  const discount = residentDiscount ? base * 0.15 : 0;
  const subtotalBeforeTax = Math.max(0, base - discount + travelFee + rushFee + materials + sourcingFee + passThrough);
  const taxRate = Math.max(0, Number(a.tax_rate_percent || 0));
  const tax = subtotalBeforeTax * taxRate / 100;
  const total = subtotalBeforeTax + tax;
  const depositRate = Math.min(100, Math.max(0, Number(a.deposit_percent || 0)));
  const deposit = total * depositRate / 100;
  const reviewFlags = [];
  if (service.commercial_intent_status && service.commercial_intent_status !== 'SELL_NOW') reviewFlags.push('FULFILLMENT_OR_COMMERCIAL_GATE');
  if (['VARIABLE_QUOTE','BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED'].some(t => pricingType.includes(t))) reviewFlags.push('SCOPE_REVIEW');
  if (materials > 0) reviewFlags.push('MATERIALS_CONFIRMATION');
  if (passThrough > 0) reviewFlags.push('PASS_THROUGH_CONFIRMATION');
  if (taxRate === 0) reviewFlags.push('TAX_REVIEW');
  return { baseSubtotal: money(base), residentDiscount: money(discount), travelFee: money(travelFee), rushFee: money(rushFee), materials: money(materials), sourcingFee: money(sourcingFee), passThrough: money(passThrough), tax: money(tax), taxRate, estimatedTotal: money(total), depositDue: money(deposit), reviewFlags, needsReview: reviewFlags.length > 0 };
}

export default async function handler(req, res) {
  try {
    const context = await authenticatePortalRequest(req);
    if (context.error) return json(res, context.status, { error: context.error });
    const roleError = requireRole(context, ['owner','admin','staff_admin','staff','operations']);
    if (roleError) return json(res, roleError.status, { error: roleError.error });

    if (req.method === 'GET') return json(res, 200, { success: true, services: await loadServices(context.supabase) });
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });

    const body = req.body || {};
    const serviceSku = String(body.serviceSku || '').trim();
    if (!serviceSku) return json(res, 400, { error: 'Choose a service.' });

    const { data: offer, error: offerError } = await context.supabase.from('dd_governed_service_offers').select('canonical_sku,service_name,division,commercial_offer_status,fulfillment_gate_status,runtime_service_id').eq('canonical_sku', serviceSku).neq('commercial_offer_status','DO_NOT_SELL').order('commercial_offer_status',{ascending:true}).limit(1).maybeSingle();
    if (offerError) throw offerError;
    if (!offer?.runtime_service_id) return json(res, 404, { error: 'That service is not currently quoteable.' });

    const { data: service, error: serviceError } = await context.supabase.from('services').select('*').eq('id', offer.runtime_service_id).maybeSingle();
    if (serviceError) throw serviceError;
    if (!service) return json(res, 404, { error: 'The service record could not be resolved.' });

    const clientType = String(body.clientType || 'business');
    const channelCode = CHANNELS[clientType] || 'CH04';
    const rules = await loadRules(context.supabase, service.id, channelCode);
    const rule = rules.find(r => r.base_price_cents != null) || rules[0] || null;
    const answers = { ...(body.answers || {}), apartment_resident: clientType === 'apartment_resident' };
    const calculation = calculate({ service: { ...service, commercial_intent_status: offer.fulfillment_gate_status === 'READY' ? (offer.commercial_offer_status === 'SELL_NOW' ? 'SELL_NOW' : offer.commercial_offer_status) : offer.fulfillment_gate_status }, rule, answers });
    const publicReference = `EST-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    const payload = {
      public_reference: publicReference, division_slug: String(service.division_id).padStart(2,'0'), source_slug: 'admin_quote_builder',
      client_name: String(body.clientName || '').trim() || null, client_phone: String(body.clientPhone || '').trim() || null, client_email: String(body.clientEmail || '').trim() || null,
      client_type: ESTIMATE_CLIENT_TYPES[clientType] || 'other', organization_name: String(body.organizationName || '').trim() || null, location_address: String(body.locationAddress || '').trim() || null,
      city: String(body.city || '').trim() || null, state: String(body.state || 'GA').trim().toUpperCase() || null, zip_code: String(body.zipCode || '').trim() || null,
      timeline: String(body.timeline || '').trim() || null, rush_requested: Boolean(answers.rush), requested_date: body.requestedDate || null,
      intake_answers: { serviceSku, serviceName: offer.service_name, originalClientType: clientType, channelCode, answers, pricingSnapshot: { capturedAt: new Date().toISOString(), pricingRuleId: rule?.id || null, lockStatus: rule?.lock_status || null, ...calculation } },
      client_notes: String(body.clientNotes || '').trim() || null, internal_notes: String(body.internalNotes || '').trim() || null,
      estimate_status: calculation.needsReview ? 'needs_review' : 'estimated', priority: String(body.priority || 'normal'), base_subtotal: calculation.baseSubtotal, addon_subtotal: 0,
      travel_fee: calculation.travelFee, rush_fee: calculation.rushFee, supplies_fee: calculation.sourcingFee + calculation.materials, pass_through_fee: calculation.passThrough,
      tax_amount: calculation.tax, estimated_total: calculation.estimatedTotal, deposit_due: calculation.depositDue,
      quote_disclaimer: 'Estimate generated from the current DANI DECLARES commercial catalog and pricing rules. Final price remains subject to scope, location, materials/pass-throughs, fulfillment authorization, tax review and applicable service-specific gates.'
    };
    const { data: estimate, error: estimateError } = await context.supabase.from('dd_estimates').insert(payload).select('id,public_reference,estimate_status,estimated_total,deposit_due,quote_disclaimer').single();
    if (estimateError) throw estimateError;
    return json(res, 200, { success:true, estimate, service:{ sku:offer.canonical_sku, name:offer.service_name, publicPrice:service.public_price_display || service.price_note || (service.starting_price != null ? `Starting at $${Number(service.starting_price).toFixed(2)}` : 'Quote required') }, calculation });
  } catch (error) {
    console.error('Portal quote builder failed:', error);
    return json(res, 400, { error: 'We could not build the estimate. Check the service and customer details and try again.' });
  }
}
