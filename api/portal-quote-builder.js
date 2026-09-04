import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const CHANNELS = Object.freeze({
  regular_resident: 'CH01',
  apartment_resident: 'CH01',
  property_manager: 'CH02',
  realtor: 'CH03',
  business: 'CH04',
  government: 'CH05',
});

const json = (res, status, payload) => res.status(status).json(payload);
const money = (value) => Math.round(Number(value || 0) * 100) / 100;

async function loadServices(supabase) {
  const { data, error } = await supabase
    .from('services')
    .select('id,sku,name,division_id,service_family,pricing_type,billing_cycle,starting_price,base_price_cents,price_note,public_price_low,public_price_high,public_price_display,quote_input_schema,commercial_status,commercial_intent_status,resident_discount_eligible,is_active')
    .eq('is_active', true)
    .order('division_id', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function loadRules(supabase, serviceId, channelCode) {
  const { data, error } = await supabase
    .from('dd_service_pricing_rules')
    .select('id,channel_code,pricing_type,billing_cycle,base_price_cents,resident_discount_eligible,lock_status,status')
    .eq('service_id', serviceId)
    .eq('channel_code', channelCode)
    .eq('status', 'ACTIVE')
    .order('effective_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

function buildBase(service, rules) {
  const rule = rules.find(r => r.base_price_cents != null) || rules[0] || null;
  const base = rule?.base_price_cents != null ? Number(rule.base_price_cents) / 100 : Number(service.starting_price || service.base_price_cents || 0) / (service.base_price_cents ? 100 : 1);
  return { base: money(base), rule };
}

function calculate({ service, rule, answers }) {
  const a = answers || {};
  let base = Number(a.manual_base_price || 0);
  if (!base) base = rule?.base_price_cents != null ? Number(rule.base_price_cents) / 100 : Number(service.starting_price || 0);

  const quantity = Math.max(1, Number(a.quantity || 1));
  const hours = Math.max(0, Number(a.hours || 0));
  const pricingType = String(rule?.pricing_type || service.pricing_type || '').toUpperCase();

  if (pricingType.includes('HOURLY')) base *= Math.max(1, hours || 1);
  else if (pricingType.includes('PER_UNIT') || pricingType.includes('PER_BASKET') || pricingType.includes('PER_ITEM')) base *= quantity;

  const standardTravel = Boolean(a.apply_standard_travel);
  const miles = Math.max(0, Number(a.miles_one_way || 0));
  const travelFee = standardTravel ? Math.max(0, miles - 15) * 2.5 : 0;
  const materials = Math.max(0, Number(a.materials_cost || 0));
  const sourcingFee = materials > 0 ? materials * 0.10 : 0;
  const passThrough = Math.max(0, Number(a.pass_through_cost || 0));
  const rushFee = Boolean(a.rush) ? (base + travelFee) * 0.25 : 0;
  const residentDiscount = Boolean(a.apartment_resident) && Boolean(rule?.resident_discount_eligible ?? service.resident_discount_eligible);
  const discount = residentDiscount ? base * 0.15 : 0;
  const subtotalBeforeTax = Math.max(0, base - discount + travelFee + rushFee + sourcingFee + materials + passThrough);
  const taxRate = Math.max(0, Number(a.tax_rate_percent || 0));
  const tax = subtotalBeforeTax * (taxRate / 100);
  const total = subtotalBeforeTax + tax;
  const depositRate = Math.min(100, Math.max(0, Number(a.deposit_percent || 0)));
  const deposit = total * (depositRate / 100);

  const reviewFlags = [];
  if (service.commercial_intent_status && service.commercial_intent_status !== 'READY') reviewFlags.push('FULFILLMENT_OR_COMMERCIAL_GATE');
  if (['VARIABLE_QUOTE', 'BESPOKE_SOW', 'SOW', 'SOW_PROCUREMENT', 'QUOTE', 'STARTING_AT', 'CONFIGURED'].some(t => pricingType.includes(t))) reviewFlags.push('SCOPE_REVIEW');
  if (materials > 0) reviewFlags.push('MATERIALS_CONFIRMATION');
  if (passThrough > 0) reviewFlags.push('PASS_THROUGH_CONFIRMATION');
  if (taxRate === 0) reviewFlags.push('TAX_REVIEW');

  return {
    baseSubtotal: money(base),
    residentDiscount: money(discount),
    travelFee: money(travelFee),
    rushFee: money(rushFee),
    materials: money(materials),
    sourcingFee: money(sourcingFee),
    passThrough: money(passThrough),
    tax: money(tax),
    taxRate,
    estimatedTotal: money(total),
    depositDue: money(deposit),
    reviewFlags,
    needsReview: reviewFlags.length > 0,
  };
}

export default async function handler(req, res) {
  try {
    const context = await authenticatePortalRequest(req);
    if (context.error) return json(res, context.status, { error: context.error });
    const roleError = requireRole(context, ['owner', 'admin', 'staff_admin', 'staff', 'operations']);
    if (roleError) return json(res, roleError.status, { error: roleError.error });

    if (req.method === 'GET') {
      const services = await loadServices(context.supabase);
      return json(res, 200, {
        success: true,
        services: services.map(s => ({
          ...s,
          publicPrice: s.public_price_display || (s.starting_price != null ? `Starting at $${Number(s.starting_price).toFixed(2)}` : 'Quote required'),
          quoteQuestions: s.quote_input_schema?.fields || [],
        })),
      });
    }

    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
    const body = req.body || {};
    const serviceSku = String(body.serviceSku || '').trim();
    if (!serviceSku) return json(res, 400, { error: 'Choose a service.' });

    const { data: service, error: serviceError } = await context.supabase
      .from('services')
      .select('*')
      .eq('sku', serviceSku)
      .eq('is_active', true)
      .maybeSingle();
    if (serviceError) throw serviceError;
    if (!service) return json(res, 404, { error: 'That service is not in the active catalog.' });

    const clientType = String(body.clientType || 'business');
    const channelCode = CHANNELS[clientType] || 'CH04';
    const rules = await loadRules(context.supabase, service.id, channelCode);
    const { rule } = buildBase(service, rules);
    const answers = { ...(body.answers || {}) };
    answers.apartment_resident = clientType === 'apartment_resident';
    const calculation = calculate({ service, rule, answers });

    const publicReference = `EST-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    const status = calculation.needsReview ? 'needs_review' : 'estimated';
    const payload = {
      public_reference: publicReference,
      division_slug: String(service.division_id).padStart(2, '0'),
      source_slug: 'admin_quote_builder',
      client_name: String(body.clientName || '').trim() || null,
      client_phone: String(body.clientPhone || '').trim() || null,
      client_email: String(body.clientEmail || '').trim() || null,
      client_type: clientType,
      organization_name: String(body.organizationName || '').trim() || null,
      location_address: String(body.locationAddress || '').trim() || null,
      city: String(body.city || '').trim() || null,
      state: String(body.state || 'GA').trim().toUpperCase() || null,
      zip_code: String(body.zipCode || '').trim() || null,
      timeline: String(body.timeline || '').trim() || null,
      rush_requested: Boolean(answers.rush),
      requested_date: body.requestedDate || null,
      intake_answers: {
        serviceSku,
        serviceName: service.name,
        channelCode,
        answers,
        pricingSnapshot: { capturedAt: new Date().toISOString(), pricingRuleId: rule?.id || null, lockStatus: rule?.lock_status || null, ...calculation },
      },
      client_notes: String(body.clientNotes || '').trim() || null,
      internal_notes: String(body.internalNotes || '').trim() || null,
      estimate_status: status,
      priority: String(body.priority || 'normal'),
      base_subtotal: calculation.baseSubtotal,
      addon_subtotal: 0,
      travel_fee: calculation.travelFee,
      rush_fee: calculation.rushFee,
      supplies_fee: calculation.sourcingFee + calculation.materials,
      pass_through_fee: calculation.passThrough,
      tax_amount: calculation.tax,
      estimated_total: calculation.estimatedTotal,
      deposit_due: calculation.depositDue,
      quote_disclaimer: 'Estimate generated from the current DANI DECLARES commercial catalog and pricing rules. Final price remains subject to scope, location, materials/pass-throughs, fulfillment authorization, tax review and any applicable service-specific gate.',
    };

    const { data: estimate, error: estimateError } = await context.supabase.from('dd_estimates').insert(payload).select('id,public_reference,estimate_status,estimated_total,deposit_due,quote_disclaimer').single();
    if (estimateError) throw estimateError;

    return json(res, 200, { success: true, estimate, service: { sku: service.sku, name: service.name, publicPrice: service.public_price_display }, calculation });
  } catch (error) {
    console.error('Portal quote builder failed:', error);
    return json(res, 400, { error: 'We could not build the estimate. Check the service and customer details and try again.' });
  }
}
