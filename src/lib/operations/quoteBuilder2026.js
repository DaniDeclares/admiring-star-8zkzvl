const CHANNELS = Object.freeze({ regular_resident: 'CH01', apartment_resident: 'CH01', property_manager: 'CH02', realtor: 'CH03', business: 'CH04', government: 'CH05' });
const ESTIMATE_CLIENT_TYPES = Object.freeze({ regular_resident: 'other', apartment_resident: 'renter', property_manager: 'property_manager', realtor: 'realtor', business: 'business', government: 'other' });
const money = value => Math.round(Number(value || 0) * 100) / 100;
const specialDivision = family => family === 'REAL ESTATE' ? '03' : ['BUSINESS ADMIN','BUSINESS FIELD','OFFICE'].includes(family) ? '04' : family === 'EVENT' ? '10' : '01';

function normalizeSpecialCanonicalSku(serviceId) {
  const raw = String(serviceId || '').trim();
  const token = raw.replace(/^DSS-CAN-/, '');
  const match = token.match(/^(DNI)(\d{2})([A-Z])(\d{3})$/);
  return match ? `DNI-${match[2]}${match[3]}-${match[4]}` : null;
}

function buildSpecialRow(s) {
  return {
    sku:s.service_id,
    canonicalSku:normalizeSpecialCanonicalSku(s.service_id),
    name:s.service_name,
    division_id:Number(specialDivision(s.family)),
    service_family:s.family,
    pricing_type:'SPECIALS_OWNER_EXECUTABLE',
    billing_cycle:'ONETIME',
    starting_price:Number(s.price),
    base_price_cents:Math.round(Number(s.price)*100),
    public_price_display:String.fromCharCode(36)+Number(s.price).toFixed(2)+(s.unit && !['visit','project','service','flat','treatment','job','load','cycle','package','area','tree','wreath','section','mantel','rug','chair','sofa','mattress','mirror','bath','event','dispatch','audit log','delivery','run','walk','coordination','document','plan','minimum'].includes(s.unit) ? '/'+s.unit : ''),
    commercial_status:'CANONICAL_ACTIVE',
    commercial_intent_status:'SELL_NOW',
    governedOfferStatus:'SELL_NOW',
    fulfillmentGateStatus:'READY',
    quoteQuestions:[],
    sourceType:'DANI_SPECIALS',
    specialUnit:s.unit,
    specialPrice:Number(s.price),
    specialFamily:s.family
  };
}

/**
 * Resolve the two catalog populations into one operator-facing offer graph.
 * Exact canonical overlaps collapse; price conflicts remain attached as explicit
 * special variants; special-only rows remain standalone. No pricing authority is
 * silently overwritten here.
 */
export function resolveCanonicalOffers(governed, specials, governedStatusBySku = new Map()) {
  const governedBySku = new Map(governed.map(row => [row.sku, row]));
  const resolved = [];

  for (const special of specials) {
    const canonicalSku = special.canonicalSku;
    if (!canonicalSku) {
      resolved.push(special);
      continue;
    }

    const statusRows = governedStatusBySku.get(canonicalSku) || [];
    const hasSellNowGoverned = statusRows.some(row => row.commercial_offer_status === 'SELL_NOW');
    const hasAnyGoverned = statusRows.length > 0;
    const base = governedBySku.get(canonicalSku);

    // A special cannot resurrect a canonical service that governance has locked
    // away. If there is no governed row at all, it remains a special-only offer.
    if (hasAnyGoverned && !hasSellNowGoverned) {
      continue;
    }

    if (!base) {
      resolved.push({ ...special, canonicalOnlySpecial:true });
      continue;
    }

    const exactCommercialMatch = Number(base.base_price_cents || 0) === Number(special.base_price_cents || 0)
      && String(base.name || '').trim().toLowerCase() === String(special.name || '').trim().toLowerCase();

    if (exactCommercialMatch) {
      // Exact duplicate/alias: preserve provenance for diagnostics but do not
      // expose a second operator selection.
      base.aliasSources = [...(base.aliasSources || []), special.sku];
      continue;
    }

    base.offerVariants = [
      ...(base.offerVariants || []),
      {
        ...special,
        variantType:'DANI_SPECIAL',
        commercialResolution:'UNRESOLVED_PRICE_CONFLICT',
        canonicalSku,
        displayLabel:`DANI SPECIAL CAMPAIGN — ${Number(special.specialPrice).toFixed(2)}`
      }
    ];
    base.hasCommercialConflict = true;
  }

  // Preserve governed rows that did not have a canonical special.
  for (const base of governed) {
    if (!resolved.includes(base)) resolved.push(base);
  }

  return resolved;
}

export async function getQuoteCatalog(supabase) {
  const { data: offers, error } = await supabase.from('dd_governed_service_offers')
    .select('id,canonical_sku,service_name,division,commercial_object_type,commercial_offer_status,fulfillment_gate_status,runtime_service_id,pricing_rule_count,market_rule_count,channel_availability_count,priced_channel_count,ch01_a_priced,ch01_b_priced')
    .neq('commercial_offer_status', 'DO_NOT_SELL').order('division').order('canonical_sku');
  if (error) throw error;

  const ids = (offers || []).map(o => o.runtime_service_id).filter(Boolean);
  const { data: servicesById, error: serviceIdError } = ids.length ? await supabase.from('services').select('id,sku,name,service_family,pricing_type,billing_cycle,starting_price,base_price_cents,price_note,public_price_low,public_price_high,public_price_display,quote_input_schema,commercial_status,commercial_intent_status,resident_discount_eligible,is_active').in('id', ids) : { data: [], error: null };
  if (serviceIdError) throw serviceIdError;
  const resolvedIds = new Set((servicesById || []).map(s => s.id));
  const missingSkus = (offers || []).filter(o => o.runtime_service_id && !resolvedIds.has(o.runtime_service_id)).map(o => o.canonical_sku).concat((offers || []).filter(o => !o.runtime_service_id).map(o => o.canonical_sku)).filter(Boolean);
  const { data: servicesBySku, error: skuError } = missingSkus.length ? await supabase.from('services').select('id,sku,name,service_family,pricing_type,billing_cycle,starting_price,base_price_cents,price_note,public_price_low,public_price_high,public_price_display,quote_input_schema,commercial_status,commercial_intent_status,resident_discount_eligible,is_active').in('sku', [...new Set(missingSkus)]) : { data: [], error: null };
  if (skuError) throw skuError;
  const byId = new Map((servicesById || []).map(s => [s.id, s]));
  const bySku = new Map((servicesBySku || []).map(s => [s.sku, s]));
  const governed = (offers || []).map(o => { const s = byId.get(o.runtime_service_id) || bySku.get(o.canonical_sku) || {}; return { ...s, sku:o.canonical_sku, canonicalSku:o.canonical_sku, name:o.service_name, division_id:Number(o.division), service_family:s.service_family || null, governedOfferStatus:o.commercial_offer_status, fulfillmentGateStatus:o.fulfillment_gate_status, commercial_status:s.commercial_status || o.commercial_offer_status, commercial_intent_status:s.commercial_intent_status || o.fulfillment_gate_status, publicPrice:s.public_price_display || (s.starting_price != null ? `Starting at ${Number(s.starting_price).toFixed(2)}` : 'Quote required'), quoteQuestions:s.quote_input_schema?.fields || [], sourceType:'GOVERNED' }; });

  // Load all active specials, but separately load governance state for their
  // canonical counterparts so a special cannot bypass a DO_NOT_SELL lock.
  const { data: specials, error: specialsError } = await supabase.from('danis_specials_offers').select('service_id,family,service_name,unit,price,active,market').eq('active', true).eq('market','GA').order('service_id');
  if (specialsError) throw specialsError;
  const specialRows = (specials || []).map(buildSpecialRow);
  const canonicalSkus = [...new Set(specialRows.map(s => s.canonicalSku).filter(Boolean))];
  const { data: governanceRows, error: governanceError } = canonicalSkus.length
    ? await supabase.from('dd_governed_service_offers').select('canonical_sku,commercial_offer_status,fulfillment_gate_status').in('canonical_sku', canonicalSkus)
    : { data: [], error: null };
  if (governanceError) throw governanceError;
  const governedStatusBySku = new Map();
  for (const row of governanceRows || []) {
    const list = governedStatusBySku.get(row.canonical_sku) || [];
    list.push(row);
    governedStatusBySku.set(row.canonical_sku, list);
  }

  return resolveCanonicalOffers(governed, specialRows, governedStatusBySku);
}

async function loadRules(supabase, serviceId, channelCode) {
  const { data, error } = await supabase.from('dd_service_pricing_rules').select('id,channel_code,pricing_type,billing_cycle,base_price_cents,resident_discount_eligible,lock_status,status').eq('service_id', serviceId).eq('channel_code', channelCode).eq('status', 'ACTIVE').order('effective_date',{ascending:false});
  if (error) throw error;
  return data || [];
}

export function isHourlyBilled(service, rule) {
  const pricingType = String(rule?.pricing_type || service?.pricing_type || '').toUpperCase();
  const billingCycle = String(rule?.billing_cycle || service?.billing_cycle || '').toUpperCase();
  return billingCycle === 'HOURLY' || pricingType === 'PER_HOUR' || pricingType.includes('HOURLY');
}

// DESIGN INVARIANT (Engine E -- Quote/Underwritten, locked 2026-09-19): `condition` and
// `scope_summary`, where a service's quote_input_schema collects them, are informational by
// design and must never independently modify the calculated price below. They exist to support
// staff scope review (see the SCOPE_REVIEW flag), not to drive an unapproved condition-based
// multiplier. Introducing condition-based pricing automation is a deliberate future commercial-
// policy decision requiring documented tiers/formulas/testing/re-audit -- do not add it here as
// an implicit fix.
function configuredBasePrice(service, rule, answers) {
  const model = service?.quote_input_schema?.pricing_model;
  if (model !== 'BEDROOM_TIER') return { base: rule?.base_price_cents != null ? Number(rule.base_price_cents) / 100 : Number(service.starting_price || service.public_price_low || 0), flags: [] };

  const fields = service.quote_input_schema || {};
  const bedroom = String(answers?.bedroom_count ?? '').trim();
  const tier = (fields.tiers || []).find(t => String(t.value) === bedroom);
  if (!tier) return { base: 0, flags: ['LAYOUT_REVIEW'] };
  return { base: Number(tier.price || 0), flags: [] };
}

export function calculate(service, rule, answers) {
  const a = answers || {};
  const pricingType = String(rule?.pricing_type || service.pricing_type || '').toUpperCase();
  const configured = configuredBasePrice(service, rule, a);
  const ruleBase = configured.base;
  let base = ruleBase;
  const reviewFlags = [...configured.flags];
  const model = service?.quote_input_schema?.pricing_model;
  if (model === 'BEDROOM_TIER' && Boolean(a.severe_pet_mess)) {
    const modifier = (service.quote_input_schema?.modifiers || []).find(m => m.key === 'severe_pet_mess');
    if (modifier) base += Number(modifier.amount || 0);
  }
  const quantity = Math.max(1, Number(a.quantity || 1));
  const hours = Math.max(0, Number(a.hours || 0));
  const hourly = isHourlyBilled(service, rule);
  if (hourly) base *= Math.max(1,hours || 1);
  else if (pricingType.includes('PER_UNIT') || pricingType.includes('PER_BASKET') || pricingType.includes('PER_ITEM')) base *= quantity;
  else if (service.sourceType === 'DANI_SPECIALS' && ['basket','bed','window','chair','tree','room','bath','hour','document'].includes(String(service.specialUnit||'').toLowerCase())) base *= quantity;
  const travelFee = Boolean(a.apply_standard_travel) ? Math.max(0,Number(a.miles_one_way||0)-15)*2.5 : 0;
  const materials = Math.max(0,Number(a.materials_cost||0));
  const sourcingFee = materials*0.10;
  const passThrough = Math.max(0,Number(a.pass_through_cost||0));
  const rushFee = Boolean(a.rush) ? (base+travelFee)*0.25 : 0;
  const residentDiscount = Boolean(a.apply_resident_discount) && Boolean(rule?.resident_discount_eligible ?? false);
  const discount = residentDiscount ? base*0.15 : 0;
  const subtotal = Math.max(0,base-discount+travelFee+rushFee+materials+sourcingFee+passThrough);
  const taxRate = Math.max(0,Number(a.tax_rate_percent||0));
  const tax = subtotal*taxRate/100;
  const total = subtotal+tax;
  const deposit = total*Math.min(100,Math.max(0,Number(a.deposit_percent||0)))/100;
  if (model === 'BEDROOM_TIER' && Boolean(a.specialized_carpet_extraction)) reviewFlags.push('SPECIALTY_CARPET_SCOPE');
  if (model === 'BEDROOM_TIER' && Boolean(a.abandoned_property_or_furniture)) reviewFlags.push('DEBRIS_FURNITURE_SCOPE');
  if (service.sourceType !== 'DANI_SPECIALS' && service.commercial_intent_status && service.commercial_intent_status !== 'SELL_NOW') reviewFlags.push('FULFILLMENT_OR_COMMERCIAL_GATE');
  if (service.sourceType !== 'DANI_SPECIALS' && ['VARIABLE_QUOTE','BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED'].some(t=>pricingType.includes(t))) reviewFlags.push('SCOPE_REVIEW');
  if (travelFee>0) reviewFlags.push('TRAVEL_CONFIRMATION');
  if (materials>0) reviewFlags.push('MATERIALS_CONFIRMATION');
  if (passThrough>0) reviewFlags.push('PASS_THROUGH_CONFIRMATION');
  if (taxRate===0) reviewFlags.push('TAX_REVIEW');
  if (Number(a.manual_base_price||0)>0) reviewFlags.push('MANUAL_BASE_IGNORED_GOVERNED_PRICING');
  return { baseSubtotal:money(base), residentDiscount:money(discount), travelFee:money(travelFee), rushFee:money(rushFee), materials:money(materials), sourcingFee:money(sourcingFee), passThrough:money(passThrough), tax:money(tax), taxRate, estimatedTotal:money(total), depositDue:money(deposit), reviewFlags, needsReview:reviewFlags.length>0, isHourly:hourly, ratePerUnit:money(ruleBase) };
}

export async function createEstimate(supabase, body) {
  const updateEstimateId=String(body.updateEstimateId||'').trim()||null;
  let existingEstimate=null;
  if(updateEstimateId){
    const {data,error}=await supabase.from('dd_estimates').select('id,public_reference,estimate_status').eq('id',updateEstimateId).maybeSingle();
    if(error) throw error;
    if(!data) throw new Error('Saved estimate not found.');
    existingEstimate=data;
  }
  const requestId=String(body.requestId||'').trim()||null;
  let sourceRequest=null;
  let sourceLeadId=null;
  if(requestId){
    const {data:req,error:reqError}=await supabase.from('service_requests').select('id,lead_id').eq('id',requestId).maybeSingle();
    if(reqError) throw reqError;
    if(!req) throw new Error('The originating website request could not be found. Refresh the request and try again.');
    sourceRequest=req;
    sourceLeadId=req.lead_id||null;
  }
  const serviceSku=String(body.serviceSku||'').trim();
  if(!serviceSku) throw new Error('Choose a service.');
  const clientType=String(body.clientType||'business');
  const channelCode=CHANNELS[clientType]||'CH04';
  let offer=null, service=null, rule=null;
  if(serviceSku.startsWith('DSS-')){
    const canonicalSku=normalizeSpecialCanonicalSku(serviceSku);
    if(!canonicalSku) throw new Error('That DANI SPECIALS identifier is not a canonical quote SKU.');

    const {data:special,error:specialError}=await supabase
      .from('danis_specials_offers')
      .select('service_id,family,service_name,unit,price,active,market')
      .eq('service_id',serviceSku)
      .eq('active',true)
      .eq('market','GA')
      .maybeSingle();
    if(specialError) throw specialError;
    if(!special) throw new Error('That DANI SPECIALS service could not be resolved.');

    const {data:governanceRows,error:governanceError}=await supabase
      .from('dd_governed_service_offers')
      .select('canonical_sku,service_name,division,commercial_offer_status,fulfillment_gate_status,runtime_service_id')
      .eq('canonical_sku',canonicalSku);
    if(governanceError) throw governanceError;

    const sellNowOffer=(governanceRows||[]).find(row=>row.commercial_offer_status==='SELL_NOW');
    if((governanceRows||[]).length && !sellNowOffer){
      throw new Error('That DANI SPECIALS offer is blocked by canonical commercial governance.');
    }
    if(!sellNowOffer?.runtime_service_id){
      throw new Error('That DANI SPECIALS offer has no governed quoteable counterpart.');
    }

    const {data:governedService,error:serviceError}=await supabase
      .from('services')
      .select('*')
      .eq('id',sellNowOffer.runtime_service_id)
      .maybeSingle();
    if(serviceError) throw serviceError;
    if(!governedService) throw new Error('The canonical service record could not be resolved.');

    const namesMatch=String(governedService.name||sellNowOffer.service_name||'').trim().toLowerCase()===String(special.service_name||'').trim().toLowerCase();
    const priceMatches=Number(governedService.base_price_cents||0)===Math.round(Number(special.price)*100);
    if(!namesMatch || !priceMatches){
      throw new Error('DANI SPECIALS price conflict requires commercial adjudication before quoting.');
    }

    offer=sellNowOffer;
    service=governedService;
    const rules=await loadRules(supabase,service.id,channelCode);
    rule=rules.find(r=>r.base_price_cents!=null)||rules[0]||null;
  } else {
    const { data: governedOffers, error: offerError } = await supabase
      .from('dd_governed_service_offers')
      .select('canonical_sku,service_name,division,commercial_offer_status,fulfillment_gate_status,runtime_service_id')
      .eq('canonical_sku',serviceSku)
      .neq('commercial_offer_status','DO_NOT_SELL')
      .order('commercial_offer_status',{ascending:true});
    if(offerError) throw offerError;
    const governedOffer=(governedOffers||[]).find(row=>row.commercial_offer_status==='SELL_NOW') || governedOffers?.[0];
    if(!governedOffer?.runtime_service_id) throw new Error('That service is not currently quoteable.');
    const { data: governedService, error: serviceError } = await supabase.from('services').select('*').eq('id',governedOffer.runtime_service_id).maybeSingle();
    if(serviceError) throw serviceError;
    if(!governedService) throw new Error('The service record could not be resolved.');
    offer=governedOffer; service=governedService;
    const rules=await loadRules(supabase,service.id,channelCode); rule=rules.find(r=>r.base_price_cents!=null)||rules[0]||null;
  }
  const answers={...(body.answers||{}),apply_resident_discount:false,apartment_resident:clientType==='apartment_resident'};
  const calcService={...service,commercial_intent_status:offer.fulfillment_gate_status==='READY'?(offer.commercial_offer_status==='SELL_NOW'?'SELL_NOW':offer.commercial_offer_status):offer.fulfillment_gate_status};
  const calculation=calculate(calcService,rule,answers);
  const publicReference=existingEstimate?.public_reference||`EST-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const payload={public_reference:publicReference,division_slug:String(service.division_id||offer.division||'01').padStart(2,'0'),source_slug:service.sourceType==='DANI_SPECIALS'?'danis_specials_owner_quote':'admin_quote_builder',lead_id:sourceLeadId,service_request_id:sourceRequest?.id||null,client_name:String(body.clientName||'').trim()||null,client_phone:String(body.clientPhone||'').trim()||null,client_email:String(body.clientEmail||'').trim()||null,client_type:ESTIMATE_CLIENT_TYPES[clientType]||'other',organization_name:String(body.organizationName||'').trim()||null,location_address:String(body.locationAddress||'').trim()||null,city:String(body.city||'').trim()||null,state:String(body.state||'GA').trim().toUpperCase()||null,zip_code:String(body.zipCode||'').trim()||null,timeline:String(body.timeline||'').trim()||null,rush_requested:Boolean(answers.rush),requested_date:body.requestedDate||null,intake_answers:{serviceSku,serviceName:offer.service_name,originalClientType:clientType,channelCode,sourceType:service.sourceType||'GOVERNED',answers,pricingSnapshot:{capturedAt:new Date().toISOString(),pricingRuleId:rule?.id||null,lockStatus:rule?.lock_status||null,...calculation}},client_notes:String(body.clientNotes||'').trim()||null,internal_notes:String(body.internalNotes||'').trim()||null,estimate_status:body.preserveEstimateStatus && existingEstimate ? existingEstimate.estimate_status : (calculation.needsReview?'needs_review':'estimated'),priority:String(body.priority||'normal'),base_subtotal:calculation.baseSubtotal,addon_subtotal:0,travel_fee:calculation.travelFee,rush_fee:calculation.rushFee,supplies_fee:calculation.sourcingFee+calculation.materials,pass_through_fee:calculation.passThrough,tax_amount:calculation.tax,estimated_total:calculation.estimatedTotal,deposit_due:calculation.depositDue,quote_disclaimer:'Estimate generated from the current DANI DECLARES commercial catalog. Final price remains subject to scope, location, materials/pass-throughs, fulfillment authorization, tax review and applicable service-specific gates.'};
  let estimate, estimateError;
  if(updateEstimateId){
    const result=await supabase.from('dd_estimates').update(payload).eq('id',updateEstimateId).select('id,public_reference,estimate_status,estimated_total,deposit_due,quote_disclaimer').single();
    estimate=result.data; estimateError=result.error;
  }else{
    const result=await supabase.from('dd_estimates').insert(payload).select('id,public_reference,estimate_status,estimated_total,deposit_due,quote_disclaimer').single();
    estimate=result.data; estimateError=result.error;
  }
  if(estimateError) throw estimateError;
  return {estimate,service:{sku:offer.canonical_sku,name:offer.service_name,publicPrice:service.public_price_display||service.price_note||(service.starting_price!=null?`Starting at ${Number(service.starting_price).toFixed(2)}`:'Quote required')},calculation};
}
+Number(s.price).toFixed(2)+(s.unit && !['visit','project','service','flat','treatment','job','load','cycle','package','area','tree','wreath','section','mantel','rug','chair','sofa','mattress','mirror','bath','event','dispatch','audit log','delivery','run','walk','coordination','document','plan','minimum'].includes(s.unit) ? '/'+s.unit : ''),
    commercial_status:'CANONICAL_ACTIVE',
    commercial_intent_status:'SELL_NOW',
    governedOfferStatus:'SELL_NOW',
    fulfillmentGateStatus:'READY',
    quoteQuestions:[],
    sourceType:'DANI_SPECIALS',
    specialUnit:s.unit,
    specialPrice:Number(s.price),
    specialFamily:s.family
  };
}

/**
 * Resolve the two catalog populations into one operator-facing offer graph.
 * Exact canonical overlaps collapse; price conflicts remain attached as explicit
 * special variants; special-only rows remain standalone. No pricing authority is
 * silently overwritten here.
 */
export function resolveCanonicalOffers(governed, specials, governedStatusBySku = new Map()) {
  const governedBySku = new Map(governed.map(row => [row.sku, row]));
  const resolved = [];

  for (const special of specials) {
    const canonicalSku = special.canonicalSku;
    if (!canonicalSku) {
      resolved.push(special);
      continue;
    }

    const statusRows = governedStatusBySku.get(canonicalSku) || [];
    const hasSellNowGoverned = statusRows.some(row => row.commercial_offer_status === 'SELL_NOW');
    const hasAnyGoverned = statusRows.length > 0;
    const base = governedBySku.get(canonicalSku);

    // A special cannot resurrect a canonical service that governance has locked
    // away. If there is no governed row at all, it remains a special-only offer.
    if (hasAnyGoverned && !hasSellNowGoverned) {
      continue;
    }

    if (!base) {
      resolved.push({ ...special, canonicalOnlySpecial:true });
      continue;
    }

    const exactCommercialMatch = Number(base.base_price_cents || 0) === Number(special.base_price_cents || 0)
      && String(base.name || '').trim().toLowerCase() === String(special.name || '').trim().toLowerCase();

    if (exactCommercialMatch) {
      // Exact duplicate/alias: preserve provenance for diagnostics but do not
      // expose a second operator selection.
      base.aliasSources = [...(base.aliasSources || []), special.sku];
      continue;
    }

    base.offerVariants = [
      ...(base.offerVariants || []),
      {
        ...special,
        variantType:'DANI_SPECIAL',
        commercialResolution:'UNRESOLVED_PRICE_CONFLICT',
        canonicalSku,
        displayLabel:`DANI SPECIAL CAMPAIGN — ${Number(special.specialPrice).toFixed(2)}`
      }
    ];
    base.hasCommercialConflict = true;
  }

  // Preserve governed rows that did not have a canonical special.
  for (const base of governed) {
    if (!resolved.includes(base)) resolved.push(base);
  }

  return resolved;
}

export async function getQuoteCatalog(supabase) {
  const { data: offers, error } = await supabase.from('dd_governed_service_offers')
    .select('id,canonical_sku,service_name,division,commercial_object_type,commercial_offer_status,fulfillment_gate_status,runtime_service_id,pricing_rule_count,market_rule_count,channel_availability_count,priced_channel_count,ch01_a_priced,ch01_b_priced')
    .neq('commercial_offer_status', 'DO_NOT_SELL').order('division').order('canonical_sku');
  if (error) throw error;

  const ids = (offers || []).map(o => o.runtime_service_id).filter(Boolean);
  const { data: servicesById, error: serviceIdError } = ids.length ? await supabase.from('services').select('id,sku,name,service_family,pricing_type,billing_cycle,starting_price,base_price_cents,price_note,public_price_low,public_price_high,public_price_display,quote_input_schema,commercial_status,commercial_intent_status,resident_discount_eligible,is_active').in('id', ids) : { data: [], error: null };
  if (serviceIdError) throw serviceIdError;
  const resolvedIds = new Set((servicesById || []).map(s => s.id));
  const missingSkus = (offers || []).filter(o => o.runtime_service_id && !resolvedIds.has(o.runtime_service_id)).map(o => o.canonical_sku).concat((offers || []).filter(o => !o.runtime_service_id).map(o => o.canonical_sku)).filter(Boolean);
  const { data: servicesBySku, error: skuError } = missingSkus.length ? await supabase.from('services').select('id,sku,name,service_family,pricing_type,billing_cycle,starting_price,base_price_cents,price_note,public_price_low,public_price_high,public_price_display,quote_input_schema,commercial_status,commercial_intent_status,resident_discount_eligible,is_active').in('sku', [...new Set(missingSkus)]) : { data: [], error: null };
  if (skuError) throw skuError;
  const byId = new Map((servicesById || []).map(s => [s.id, s]));
  const bySku = new Map((servicesBySku || []).map(s => [s.sku, s]));
  const governed = (offers || []).map(o => { const s = byId.get(o.runtime_service_id) || bySku.get(o.canonical_sku) || {}; return { ...s, sku:o.canonical_sku, canonicalSku:o.canonical_sku, name:o.service_name, division_id:Number(o.division), service_family:s.service_family || null, governedOfferStatus:o.commercial_offer_status, fulfillmentGateStatus:o.fulfillment_gate_status, commercial_status:s.commercial_status || o.commercial_offer_status, commercial_intent_status:s.commercial_intent_status || o.fulfillment_gate_status, publicPrice:s.public_price_display || (s.starting_price != null ? `Starting at ${Number(s.starting_price).toFixed(2)}` : 'Quote required'), quoteQuestions:s.quote_input_schema?.fields || [], sourceType:'GOVERNED' }; });

  // Load all active specials, but separately load governance state for their
  // canonical counterparts so a special cannot bypass a DO_NOT_SELL lock.
  const { data: specials, error: specialsError } = await supabase.from('danis_specials_offers').select('service_id,family,service_name,unit,price,active,market').eq('active', true).eq('market','GA').order('service_id');
  if (specialsError) throw specialsError;
  const specialRows = (specials || []).map(buildSpecialRow);
  const canonicalSkus = [...new Set(specialRows.map(s => s.canonicalSku).filter(Boolean))];
  const { data: governanceRows, error: governanceError } = canonicalSkus.length
    ? await supabase.from('dd_governed_service_offers').select('canonical_sku,commercial_offer_status,fulfillment_gate_status').in('canonical_sku', canonicalSkus)
    : { data: [], error: null };
  if (governanceError) throw governanceError;
  const governedStatusBySku = new Map();
  for (const row of governanceRows || []) {
    const list = governedStatusBySku.get(row.canonical_sku) || [];
    list.push(row);
    governedStatusBySku.set(row.canonical_sku, list);
  }

  return resolveCanonicalOffers(governed, specialRows, governedStatusBySku);
}

async function loadRules(supabase, serviceId, channelCode) {
  const { data, error } = await supabase.from('dd_service_pricing_rules').select('id,channel_code,pricing_type,billing_cycle,base_price_cents,resident_discount_eligible,lock_status,status').eq('service_id', serviceId).eq('channel_code', channelCode).eq('status', 'ACTIVE').order('effective_date',{ascending:false});
  if (error) throw error;
  return data || [];
}

export function isHourlyBilled(service, rule) {
  const pricingType = String(rule?.pricing_type || service?.pricing_type || '').toUpperCase();
  const billingCycle = String(rule?.billing_cycle || service?.billing_cycle || '').toUpperCase();
  return billingCycle === 'HOURLY' || pricingType === 'PER_HOUR' || pricingType.includes('HOURLY');
}

// DESIGN INVARIANT (Engine E -- Quote/Underwritten, locked 2026-09-19): `condition` and
// `scope_summary`, where a service's quote_input_schema collects them, are informational by
// design and must never independently modify the calculated price below. They exist to support
// staff scope review (see the SCOPE_REVIEW flag), not to drive an unapproved condition-based
// multiplier. Introducing condition-based pricing automation is a deliberate future commercial-
// policy decision requiring documented tiers/formulas/testing/re-audit -- do not add it here as
// an implicit fix.
export function calculate(service, rule, answers) {
  const a = answers || {};
  const pricingType = String(rule?.pricing_type || service.pricing_type || '').toUpperCase();
  const ruleBase = rule?.base_price_cents != null ? Number(rule.base_price_cents)/100 : Number(service.starting_price || service.public_price_low || 0);
  let base = ruleBase;
  const quantity = Math.max(1, Number(a.quantity || 1));
  const hours = Math.max(0, Number(a.hours || 0));
  const hourly = isHourlyBilled(service, rule);
  if (hourly) base *= Math.max(1,hours || 1);
  else if (pricingType.includes('PER_UNIT') || pricingType.includes('PER_BASKET') || pricingType.includes('PER_ITEM')) base *= quantity;
  else if (service.sourceType === 'DANI_SPECIALS' && ['basket','bed','window','chair','tree','room','bath','hour','document'].includes(String(service.specialUnit||'').toLowerCase())) base *= quantity;
  const travelFee = Boolean(a.apply_standard_travel) ? Math.max(0,Number(a.miles_one_way||0)-15)*2.5 : 0;
  const materials = Math.max(0,Number(a.materials_cost||0));
  const sourcingFee = materials*0.10;
  const passThrough = Math.max(0,Number(a.pass_through_cost||0));
  const rushFee = Boolean(a.rush) ? (base+travelFee)*0.25 : 0;
  const residentDiscount = Boolean(a.apply_resident_discount) && Boolean(rule?.resident_discount_eligible ?? false);
  const discount = residentDiscount ? base*0.15 : 0;
  const subtotal = Math.max(0,base-discount+travelFee+rushFee+materials+sourcingFee+passThrough);
  const taxRate = Math.max(0,Number(a.tax_rate_percent||0));
  const tax = subtotal*taxRate/100;
  const total = subtotal+tax;
  const deposit = total*Math.min(100,Math.max(0,Number(a.deposit_percent||0)))/100;
  const reviewFlags=[];
  if (service.sourceType !== 'DANI_SPECIALS' && service.commercial_intent_status && service.commercial_intent_status !== 'SELL_NOW') reviewFlags.push('FULFILLMENT_OR_COMMERCIAL_GATE');
  if (service.sourceType !== 'DANI_SPECIALS' && ['VARIABLE_QUOTE','BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED'].some(t=>pricingType.includes(t))) reviewFlags.push('SCOPE_REVIEW');
  if (travelFee>0) reviewFlags.push('TRAVEL_CONFIRMATION');
  if (materials>0) reviewFlags.push('MATERIALS_CONFIRMATION');
  if (passThrough>0) reviewFlags.push('PASS_THROUGH_CONFIRMATION');
  if (taxRate===0) reviewFlags.push('TAX_REVIEW');
  if (Number(a.manual_base_price||0)>0) reviewFlags.push('MANUAL_BASE_IGNORED_GOVERNED_PRICING');
  return { baseSubtotal:money(base), residentDiscount:money(discount), travelFee:money(travelFee), rushFee:money(rushFee), materials:money(materials), sourcingFee:money(sourcingFee), passThrough:money(passThrough), tax:money(tax), taxRate, estimatedTotal:money(total), depositDue:money(deposit), reviewFlags, needsReview:reviewFlags.length>0, isHourly:hourly, ratePerUnit:money(ruleBase) };
}

export async function createEstimate(supabase, body) {
  const updateEstimateId=String(body.updateEstimateId||'').trim()||null;
  let existingEstimate=null;
  if(updateEstimateId){
    const {data,error}=await supabase.from('dd_estimates').select('id,public_reference,estimate_status').eq('id',updateEstimateId).maybeSingle();
    if(error) throw error;
    if(!data) throw new Error('Saved estimate not found.');
    existingEstimate=data;
  }
  const requestId=String(body.requestId||'').trim()||null;
  let sourceRequest=null;
  let sourceLeadId=null;
  if(requestId){
    const {data:req,error:reqError}=await supabase.from('service_requests').select('id,lead_id').eq('id',requestId).maybeSingle();
    if(reqError) throw reqError;
    if(!req) throw new Error('The originating website request could not be found. Refresh the request and try again.');
    sourceRequest=req;
    sourceLeadId=req.lead_id||null;
  }
  const serviceSku=String(body.serviceSku||'').trim();
  if(!serviceSku) throw new Error('Choose a service.');
  const clientType=String(body.clientType||'business');
  const channelCode=CHANNELS[clientType]||'CH04';
  let offer=null, service=null, rule=null;
  if(serviceSku.startsWith('DSS-')){
    const {data:special,error:specialError}=await supabase.from('danis_specials_offers').select('service_id,family,service_name,unit,price,active,market').eq('service_id',serviceSku).eq('active',true).eq('market','GA').maybeSingle();
    if(specialError) throw specialError;
    if(!special) throw new Error('That DANI SPECIALS service could not be resolved.');
    offer={canonical_sku:special.service_id,service_name:special.service_name,division:specialDivision(special.family),commercial_offer_status:'SELL_NOW',fulfillment_gate_status:'READY'};
    service={sku:special.service_id,name:special.service_name,service_family:special.family,pricing_type:'SPECIALS_OWNER_EXECUTABLE',billing_cycle:'ONETIME',starting_price:Number(special.price),public_price_display:`$${Number(special.price).toFixed(2)}`,commercial_intent_status:'SELL_NOW',sourceType:'DANI_SPECIALS',specialUnit:special.unit,specialPrice:Number(special.price)};
  } else {
    const { data: governedOffer, error: offerError } = await supabase.from('dd_governed_service_offers').select('canonical_sku,service_name,division,commercial_offer_status,fulfillment_gate_status,runtime_service_id').eq('canonical_sku',serviceSku).neq('commercial_offer_status','DO_NOT_SELL').order('commercial_offer_status',{ascending:true}).limit(1).maybeSingle();
    if(offerError) throw offerError;
    if(!governedOffer?.runtime_service_id) throw new Error('That service is not currently quoteable.');
    const { data: governedService, error: serviceError } = await supabase.from('services').select('*').eq('id',governedOffer.runtime_service_id).maybeSingle();
    if(serviceError) throw serviceError;
    if(!governedService) throw new Error('The service record could not be resolved.');
    offer=governedOffer; service=governedService;
    const rules=await loadRules(supabase,service.id,channelCode); rule=rules.find(r=>r.base_price_cents!=null)||rules[0]||null;
  }
  const answers={...(body.answers||{}),apply_resident_discount:false,apartment_resident:clientType==='apartment_resident'};
  const calcService={...service,commercial_intent_status:offer.fulfillment_gate_status==='READY'?(offer.commercial_offer_status==='SELL_NOW'?'SELL_NOW':offer.commercial_offer_status):offer.fulfillment_gate_status};
  const calculation=calculate(calcService,rule,answers);
  const publicReference=existingEstimate?.public_reference||`EST-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const payload={public_reference:publicReference,division_slug:String(service.division_id||offer.division||'01').padStart(2,'0'),source_slug:service.sourceType==='DANI_SPECIALS'?'danis_specials_owner_quote':'admin_quote_builder',lead_id:sourceLeadId,service_request_id:sourceRequest?.id||null,client_name:String(body.clientName||'').trim()||null,client_phone:String(body.clientPhone||'').trim()||null,client_email:String(body.clientEmail||'').trim()||null,client_type:ESTIMATE_CLIENT_TYPES[clientType]||'other',organization_name:String(body.organizationName||'').trim()||null,location_address:String(body.locationAddress||'').trim()||null,city:String(body.city||'').trim()||null,state:String(body.state||'GA').trim().toUpperCase()||null,zip_code:String(body.zipCode||'').trim()||null,timeline:String(body.timeline||'').trim()||null,rush_requested:Boolean(answers.rush),requested_date:body.requestedDate||null,intake_answers:{serviceSku,serviceName:offer.service_name,originalClientType:clientType,channelCode,sourceType:service.sourceType||'GOVERNED',answers,pricingSnapshot:{capturedAt:new Date().toISOString(),pricingRuleId:rule?.id||null,lockStatus:rule?.lock_status||null,...calculation}},client_notes:String(body.clientNotes||'').trim()||null,internal_notes:String(body.internalNotes||'').trim()||null,estimate_status:body.preserveEstimateStatus && existingEstimate ? existingEstimate.estimate_status : (calculation.needsReview?'needs_review':'estimated'),priority:String(body.priority||'normal'),base_subtotal:calculation.baseSubtotal,addon_subtotal:0,travel_fee:calculation.travelFee,rush_fee:calculation.rushFee,supplies_fee:calculation.sourcingFee+calculation.materials,pass_through_fee:calculation.passThrough,tax_amount:calculation.tax,estimated_total:calculation.estimatedTotal,deposit_due:calculation.depositDue,quote_disclaimer:'Estimate generated from the current DANI DECLARES commercial catalog. Final price remains subject to scope, location, materials/pass-throughs, fulfillment authorization, tax review and applicable service-specific gates.'};
  let estimate, estimateError;
  if(updateEstimateId){
    const result=await supabase.from('dd_estimates').update(payload).eq('id',updateEstimateId).select('id,public_reference,estimate_status,estimated_total,deposit_due,quote_disclaimer').single();
    estimate=result.data; estimateError=result.error;
  }else{
    const result=await supabase.from('dd_estimates').insert(payload).select('id,public_reference,estimate_status,estimated_total,deposit_due,quote_disclaimer').single();
    estimate=result.data; estimateError=result.error;
  }
  if(estimateError) throw estimateError;
  return {estimate,service:{sku:offer.canonical_sku,name:offer.service_name,publicPrice:service.public_price_display||service.price_note||(service.starting_price!=null?`Starting at ${Number(service.starting_price).toFixed(2)}`:'Quote required')},calculation};
}
