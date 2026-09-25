import { summarizeEconomics, evaluateCounteroffer, calculateCompensation } from './componentEconomics2026.js';

const VERIFIED = new Set(['RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED']);
const money = value => Math.round(Number(value || 0) * 100) / 100;

export function resolveAcceptedAssignmentAuthority(offer, { acceptedCounter = false, acceptedAt = null } = {}) {
  const authorizedProviderCompensation = money(
    acceptedCounter ? offer?.counter_compensation : offer?.proposed_compensation
  );
  const compensationBasisSnapshot = acceptedCounter
    ? {
        ...(offer?.proposed_basis || {}),
        ...(offer?.counter_basis || {}),
        authority: 'OWNER_ACCEPTED_PROVIDER_COUNTER',
        originalProposedCompensation: money(offer?.proposed_compensation),
        acceptedCounterCompensation: authorizedProviderCompensation,
        acceptedCounterAt: acceptedAt || null
      }
    : { ...(offer?.proposed_basis || {}) };
  return { authorizedProviderCompensation, compensationBasisSnapshot };
}

export const DANI_OWNER_USER_ID = 'f88a5b79-ac5a-4690-ac28-62312328cb73';

function isEffective(row, now = Date.now()) {
  const from = row?.effective_from ? new Date(row.effective_from).getTime() : 0;
  const to = row?.effective_to ? new Date(row.effective_to).getTime() : null;
  return Number.isFinite(from) && from <= now && (to === null || (Number.isFinite(to) && to > now));
}

function selectLatest(rows, predicate) {
  const now = Date.now();
  return (rows || []).filter(row => isEffective(row, now) && predicate(row)).sort((a,b) => new Date(b.effective_from || 0) - new Date(a.effective_from || 0))[0] || null;
}

function payoutBandAmount(band, field, quantity) {
  const raw=Number(band?.[field] || 0);
  return ['HOURLY','PER_UNIT','PER_SEAT','PER_DEVICE','PER_GARMENT','MILEAGE'].includes(band?.compensation_type) ? money(raw * Math.max(0,Number(quantity||0))) : money(raw);
}

function matchPlan(plan, line, component) {
  return (plan || []).find(item => {
    const skuOk = !item.canonicalSku || item.canonicalSku === line.canonicalSku;
    return skuOk && item.componentCode === component.dd_service_components?.component_code;
  }) || null;
}

export function resolveOwnerFirstComponentMode(ownerAuthorized, componentMode) {
  // Owner authorization describes who performs the in-house work. Procured
  // supplies and subcontracted work retain their own economic treatment.
  return ownerAuthorized && componentMode === 'IN_HOUSE' ? 'OWNER' : null;
}

export async function createEstimateEconomicsSnapshot(supabase, { estimateId, resolvedLineItems, calculation, fulfillmentPlan = [], actorUserId = null, channelCode = null }) {
  const serviceIds = [...new Set((resolvedLineItems || []).map(x => x.runtimeServiceId).filter(Boolean))];
  const { data: existing, error: versionError } = await supabase.from('dd_estimate_economics_snapshots').select('version').eq('estimate_id', estimateId).order('version',{ascending:false}).limit(1).maybeSingle();
  if (versionError) throw versionError;
  const version = Number(existing?.version || 0) + 1;

  let ownerAuthorizedServiceIds = new Set();
  if (serviceIds.length) {
    const { data: ownerAuthRows, error: ownerAuthError } = await supabase.from('dd_owner_fulfillment_authorizations')
      .select('service_id,authorization_status,evidence_status,effective_from,effective_to')
      .eq('owner_user_id', DANI_OWNER_USER_ID)
      .in('service_id', serviceIds);
    if (ownerAuthError) throw ownerAuthError;
    ownerAuthorizedServiceIds = new Set((ownerAuthRows || [])
      .filter(row => isEffective(row) && ['ACTIVE','SCOPED'].includes(String(row.authorization_status || '').toUpperCase()) && VERIFIED.has(row.evidence_status))
      .map(row => row.service_id));
  }

  let packageRows = [];
  if (serviceIds.length) {
    const { data, error } = await supabase.from('dd_service_package_components')
      .select('id,service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,allowance_definition,exclusion_definition,fulfillment_mode,sort_order,dd_service_components(id,component_code,component_name,unit_type,cost_category,tax_classification,default_fulfillment_mode)')
      .in('service_id', serviceIds).eq('is_active', true).order('sort_order',{ascending:true});
    if (error) throw error;
    packageRows = data || [];
  }

  const componentIds = [...new Set(packageRows.map(r => r.component_id).filter(Boolean))];
  let costRows = [];
  if (componentIds.length) {
    const { data, error } = await supabase.from('dd_component_cost_baselines').select('*').in('component_id',componentIds).eq('status','ACTIVE');
    if (error) throw error;
    costRows = (data || []).filter(r => VERIFIED.has(r.evidence_status));
  }

  const providerIds = [...new Set((fulfillmentPlan || []).map(p => p.providerId).filter(Boolean))];
  const ownerUserIds = [...new Set((fulfillmentPlan || []).map(p => p.ownerUserId).filter(Boolean))];
  let compRules = [];
  let payoutBands = [];
  let ownerCompRules = [];
  if (providerIds.length && componentIds.length) {
    const { data, error } = await supabase.from('dd_provider_compensation_rules').select('*').in('provider_id',providerIds).in('component_id',componentIds).eq('status','ACTIVE');
    if (error) throw error;
    compRules = data || [];
    const { data: bands, error: bandError } = await supabase.from('dd_provider_payout_bands').select('*').in('component_id',componentIds).in('service_id',serviceIds).eq('status','ACTIVE');
    if (bandError) throw bandError;
    payoutBands = (bands || []).filter(row => !row.provider_id || providerIds.includes(row.provider_id));
  }
  if (ownerUserIds.length && componentIds.length) {
    const { data, error } = await supabase.from('dd_owner_compensation_rules').select('*').in('owner_user_id',ownerUserIds).in('component_id',componentIds).eq('status','ACTIVE');
    if (error) throw error;
    ownerCompRules = data || [];
  }

  let policy = null;
  const { data: policyRows, error: policyError } = await supabase.from('dd_economic_policies').select('*').eq('status','ACTIVE').order('effective_from',{ascending:false});
  if (policyError) throw policyError;
  const verifiedPolicies = (policyRows || []).filter(p => VERIFIED.has(p.evidence_status));
  for (const serviceId of serviceIds) {
    policy = policy || selectLatest(verifiedPolicies, p => p.service_id === serviceId && (!p.channel_code || p.channel_code === channelCode));
  }
  policy = policy || selectLatest(verifiedPolicies, p => !p.service_id && (!p.channel_code || p.channel_code === channelCode));

  const unresolvedReasons = [];
  if (!packageRows.length) unresolvedReasons.push('PACKAGE_COMPONENTS_UNRESOLVED');
  if (!policy) unresolvedReasons.push('ECONOMIC_POLICY_UNRESOLVED');

  const lineByService = new Map((resolvedLineItems || []).map(line => [line.runtimeServiceId, line]));
  const componentDrafts = [];
  let ownerCompensation = 0;
  let providerCompensation = 0;
  let materialsCost = 0;
  let procurementCost = 0;
  let subcontractCost = 0;
  let travelCost = 0;
  let otherVariableCost = 0;

  for (const row of packageRows) {
    const component = row.dd_service_components;
    if (!component) continue;
    const line = lineByService.get(row.service_id) || resolvedLineItems?.[0] || {};
    const answerQuantity = row.quantity_input_key ? Number(line.answers?.[row.quantity_input_key]) : NaN;
    const quantity = Number.isFinite(answerQuantity) && answerQuantity >= 0 ? answerQuantity : Number(row.included_quantity || 1);
    const plan = matchPlan(fulfillmentPlan, line, row);
    // Owner authorization covers the work, not every component of its package.
    // Preserve procured supplies and other vendor components as costs; otherwise
    // they become OWNER assignments with no labor compensation rule.
    const componentMode = plan?.fulfillmentMode || row.fulfillment_mode || component.default_fulfillment_mode;
    const ownerFirst = resolveOwnerFirstComponentMode(ownerAuthorizedServiceIds.has(row.service_id), componentMode) === 'OWNER';
    const fulfillmentMode = ownerFirst ? 'IN_HOUSE' : componentMode;
    const fulfillerType = ownerFirst ? 'OWNER' : (plan?.fulfillerType || (fulfillmentMode === 'PROVIDER' ? 'UNASSIGNED' : fulfillmentMode === 'IN_HOUSE' ? 'UNASSIGNED' : fulfillmentMode === 'PROCURED' ? 'VENDOR' : fulfillmentMode === 'SUBCONTRACTED' ? 'SUBCONTRACTOR' : 'UNASSIGNED'));
    const providerId = ownerFirst ? null : (plan?.providerId || null);
    const ownerUserId = ownerFirst ? DANI_OWNER_USER_ID : (plan?.ownerUserId || null);

    let proposedCompensation = 0;
    let compensationBasis = {};
    let compResolved = ['VENDOR','SUBCONTRACTOR'].includes(fulfillerType);

    if (fulfillerType === 'PROVIDER' && providerId) {
      const specificBand = selectLatest(payoutBands, r => r.provider_id === providerId && r.component_id === row.component_id && r.service_id === row.service_id && VERIFIED.has(r.evidence_status));
      const standardBand = selectLatest(payoutBands, r => !r.provider_id && r.component_id === row.component_id && r.service_id === row.service_id && VERIFIED.has(r.evidence_status));
      const band = specificBand || standardBand;
      if (band) {
        proposedCompensation = payoutBandAmount(band,'initial_offer_amount',quantity);
        compensationBasis = {
          authority:'PROVIDER_PAYOUT_BAND', payoutBandId:band.id, compensationType:band.compensation_type,
          initialOffer:proposedCompensation, targetPayout:payoutBandAmount(band,'target_payout_amount',quantity),
          maximumPayout:payoutBandAmount(band,'maximum_payout_amount',quantity), evidenceStatus:band.evidence_status,
          sourceReference:band.source_reference || null, equipmentBasis:band.equipment_basis, materialBasis:band.material_basis,
          escalationPolicy:band.escalation_policy || {mode:'MANUAL',auto_step_up:false}
        };
        compResolved = true;
        providerCompensation += proposedCompensation;
      } else {
        const rule = selectLatest(compRules, r => r.provider_id === providerId && r.component_id === row.component_id && (!r.service_id || r.service_id === row.service_id));
        const calculated = calculateCompensation(rule, quantity, { percentBasisAmount: calculation?.estimatedTotal || 0 });
        proposedCompensation = calculated.amount;
        compensationBasis = calculated.basis;
        compResolved = calculated.resolved;
        providerCompensation += calculated.amount;
      }
    } else if (fulfillerType === 'OWNER' && ownerUserId) {
      const rule = selectLatest(ownerCompRules, r => r.owner_user_id === ownerUserId && r.component_id === row.component_id && (!r.service_id || r.service_id === row.service_id));
      const governed = calculateCompensation(rule, quantity, { percentBasisAmount: calculation?.estimatedTotal || 0 });
      if (governed.resolved) {
        proposedCompensation = governed.amount;
        compensationBasis = { ...governed.basis, authority:'OWNER_COMPENSATION_RULE' };
        compResolved = true;
        ownerCompensation += proposedCompensation;
      } else {
        const explicit = Number(plan?.proposedCompensation);
        const evidence = String(plan?.compensationEvidenceStatus || '');
        if (Number.isFinite(explicit) && explicit >= 0 && VERIFIED.has(evidence)) {
          proposedCompensation = money(explicit);
          compensationBasis = { compensationType: plan?.compensationType || 'NEGOTIATED_PROJECT', evidenceStatus:evidence, sourceReference:plan?.sourceReference || 'QUOTE_BUILDER_OWNER_OVERRIDE', authority:'QUOTE_SPECIFIC_OWNER_OVERRIDE' };
          compResolved = true;
          ownerCompensation += proposedCompensation;
        }
      }
    }

    if (!compResolved && ['OWNER','PROVIDER','UNASSIGNED'].includes(fulfillerType)) {
      unresolvedReasons.push(`COMPENSATION_UNRESOLVED:${line.canonicalSku}:${component.component_code}`);
    }

    const baseline = selectLatest(costRows, r => r.component_id === row.component_id && (!r.service_id || r.service_id === row.service_id));
    const baselineAmount = baseline ? money(Number(baseline.unit_cost || 0) * quantity) : 0;
    if (!baseline && ['MATERIAL','PROCUREMENT','SUBCONTRACT','TRAVEL','OTHER'].includes(component.cost_category)) {
      unresolvedReasons.push(`COST_UNRESOLVED:${line.canonicalSku}:${component.component_code}`);
    }
    switch (baseline?.cost_type) {
      case 'MATERIAL': materialsCost += baselineAmount; break;
      case 'PROCUREMENT': procurementCost += baselineAmount; break;
      case 'SUBCONTRACT': subcontractCost += baselineAmount; break;
      case 'TRAVEL': travelCost += baselineAmount; break;
      case 'OTHER': otherVariableCost += baselineAmount; break;
      default: break;
    }

    componentDrafts.push({
      line,
      row,
      component,
      quantity,
      fulfillmentMode,
      fulfillerType,
      providerId,
      ownerUserId,
      proposedCompensation,
      compensationBasis,
      baseline,
      baselineAmount,
      economicStatus: compResolved && (baseline || !['MATERIAL','PROCUREMENT','SUBCONTRACT','TRAVEL','OTHER'].includes(component.cost_category)) ? 'PASS' : 'UNRESOLVED'
    });
  }

  const customerPrice = money(calculation?.estimatedTotal || 0);
  const overheadRecoveryRequirement = policy ? money(Number(policy.overhead_recovery_flat || 0) + customerPrice * Number(policy.overhead_recovery_percent || 0) / 100) : 0;
  const paymentProcessingCost = policy ? money(customerPrice * Number(policy.payment_processing_percent || 0) / 100) : 0;
  const initialSummary = summarizeEconomics({
    customerPrice, ownerCompensation, providerCompensation, materialsCost, procurementCost, subcontractCost, travelCost,
    paymentProcessingCost, otherVariableCost, overheadRecoveryRequirement,
    minimumContributionAmount:policy?.minimum_contribution_amount || 0,
    minimumMarginPercent:policy?.minimum_margin_percent || 0,
    unresolved: unresolvedReasons.length > 0
  });
  let remainingProviderHeadroom = Math.max(0, Number(initialSummary.economicHeadroom || 0));
  providerCompensation = 0;
  for (const draft of componentDrafts) {
    if (draft.fulfillerType !== 'PROVIDER') continue;
    const initial = money(draft.proposedCompensation);
    const commercialMaximum = money(draft.compensationBasis?.maximumPayout ?? initial);
    const budgeted = money(Math.min(commercialMaximum, initial + remainingProviderHeadroom));
    remainingProviderHeadroom = money(Math.max(0, remainingProviderHeadroom - Math.max(0, budgeted - initial)));
    draft.budgetedProviderCost = budgeted;
    draft.compensationBasis = { ...draft.compensationBasis, budgetedProviderCost:budgeted };
    providerCompensation = money(providerCompensation + budgeted);
  }
  const workingCapitalRequired = policy ? money((ownerCompensation + providerCompensation + materialsCost + procurementCost + subcontractCost + travelCost + otherVariableCost) * Number(policy.working_capital_buffer_percent || 0) / 100) : 0;
  const summary = summarizeEconomics({
    customerPrice, ownerCompensation, providerCompensation, materialsCost, procurementCost, subcontractCost, travelCost,
    paymentProcessingCost, otherVariableCost, overheadRecoveryRequirement,
    minimumContributionAmount:policy?.minimum_contribution_amount || 0,
    minimumMarginPercent:policy?.minimum_margin_percent || 0,
    unresolved: unresolvedReasons.length > 0
  });

  const { data: snapshot, error: snapshotError } = await supabase.from('dd_estimate_economics_snapshots').insert({
    estimate_id: estimateId, version, economics_status: summary.economicsStatus, customer_price: summary.customerPrice,
    owner_compensation: summary.ownerCompensation, provider_compensation: summary.providerCompensation, materials_cost: summary.materialsCost,
    procurement_cost: summary.procurementCost, subcontract_cost: summary.subcontractCost, travel_cost: summary.travelCost,
    payment_processing_cost: summary.paymentProcessingCost, other_variable_cost: summary.otherVariableCost,
    overhead_recovery_requirement: summary.overheadRecoveryRequirement, minimum_viable_price: summary.minimumViablePrice,
    expected_contribution: summary.expectedContribution, expected_margin_percent: summary.expectedMarginPercent,
    working_capital_required: workingCapitalRequired, discount_amount: money(calculation?.residentDiscount || 0), tax_amount: money(calculation?.tax || 0),
    snapshot_payload: { unresolvedReasons:[...new Set(unresolvedReasons)], economicPolicyId: policy?.id || null, channelCode, calculation, requiredDaniContribution:summary.requiredDaniContribution, retainedAfterOverhead:summary.retainedAfterOverhead, economicHeadroom:summary.economicHeadroom },
    captured_by: actorUserId
  }).select('*').single();
  if (snapshotError) throw snapshotError;

  if (componentDrafts.length) {
    const inserts = componentDrafts.map(d => ({
      economics_snapshot_id:snapshot.id, estimate_id:estimateId, line_index:resolvedLineItems.indexOf(d.line), canonical_sku:d.line.canonicalSku,
      service_id:d.row.service_id, component_id:d.row.component_id, component_code:d.component.component_code, component_name:d.component.component_name,
      quantity:d.quantity, unit_type:d.component.unit_type, fulfillment_mode:d.fulfillmentMode, fulfiller_type:d.fulfillerType,
      provider_id:d.providerId, owner_user_id:d.ownerUserId, proposed_compensation:d.proposedCompensation, compensation_basis_snapshot:d.compensationBasis,
      expected_material_cost:d.baseline?.cost_type==='MATERIAL'?d.baselineAmount:0, expected_travel_cost:d.baseline?.cost_type==='TRAVEL'?d.baselineAmount:0,
      expected_procurement_cost:d.baseline?.cost_type==='PROCUREMENT'?d.baselineAmount:0, expected_subcontract_cost:d.baseline?.cost_type==='SUBCONTRACT'?d.baselineAmount:0,
      expected_other_cost:d.baseline?.cost_type==='OTHER'?d.baselineAmount:0, tax_classification:d.component.tax_classification,
      economic_status:d.economicStatus, scope_snapshot:{ componentRole:d.row.component_role, allowanceDefinition:d.row.allowance_definition, exclusions:d.row.exclusion_definition, answers:d.line.answers }
    }));
    const { error } = await supabase.from('dd_estimate_component_snapshots').insert(inserts);
    if (error) throw error;
  }

  // Quote-time economics may model an owner/provider fulfillment plan, but it must
  // never create a live fulfillment offer. Provider/owner offers are activated only
  // after the customer's required payment has cleared (paid-first routing contract).
  const assignmentsResolved = componentDrafts.length && componentDrafts.every(d =>
    ['OWNER','PROVIDER','VENDOR','SUBCONTRACTOR'].includes(d.fulfillerType)
    && (d.fulfillerType !== 'PROVIDER' || d.providerId)
    && (d.fulfillerType !== 'OWNER' || d.ownerUserId)
  );
  const assignmentReadiness = assignmentsResolved ? 'PENDING_PAYMENT' : 'UNRESOLVED';

  const estimateUpdates = { economics_status:summary.economicsStatus, assignment_readiness_status:assignmentReadiness, active_economics_snapshot_id:snapshot.id };
  if (summary.economicsStatus !== 'PASS' || assignmentReadiness === 'UNRESOLVED') estimateUpdates.estimate_status = 'needs_review';
  const { error: updateError } = await supabase.from('dd_estimates').update(estimateUpdates).eq('id',estimateId);
  if (updateError) throw updateError;
  return { snapshot, assignmentReadiness, unresolvedReasons:[...new Set(unresolvedReasons)] };
}

async function refreshEstimateAssignmentReadiness(supabase, estimateId) {
  const { data: offers, error } = await supabase.from('dd_estimate_assignment_offers').select('status,economic_impact_status').eq('estimate_id',estimateId).neq('status','SUPERSEDED').neq('status','CANCELLED');
  if (error) throw error;
  let status='UNRESOLVED';
  if ((offers||[]).length) {
    if (offers.some(o => o.economic_impact_status === 'REQUIRES_REPRICE' || o.economic_impact_status === 'REQUIRES_CUSTOMER_REAPPROVAL')) status='NEEDS_REPRICE';
    else if (offers.some(o => o.status === 'COUNTEROFFERED')) status='COUNTER_PENDING';
    else if (offers.some(o => o.status === 'DECLINED')) status='NEEDS_REASSIGNMENT';
    else if (offers.some(o => ['PROPOSED','OFFERED','REVISED'].includes(o.status))) status='AWAITING_PROVIDER';
    else if (offers.every(o => ['ACCEPTED','OWNER_ACCEPTED_COUNTER'].includes(o.status))) status='READY';
  }
  await supabase.from('dd_estimates').update({assignment_readiness_status:status}).eq('id',estimateId);
  return status;
}

export async function createEstimateAssignmentOffer(supabase, { estimateId, assignmentType, providerId = null, ownerUserId = null, componentSnapshotIds = [], proposedCompensation = 0, proposedBasis = {}, targetPayout = null, maximumPayout = null, scopeSnapshot = {}, actorUserId = null, expiresAt = null }) {
  const { data: estimate, error } = await supabase.from('dd_estimates').select('id,active_economics_snapshot_id,economics_status,estimated_total').eq('id',estimateId).single();
  if (error || !estimate) throw error || new Error('ESTIMATE_NOT_FOUND');
  if (!estimate.active_economics_snapshot_id) throw new Error('ECONOMICS_SNAPSHOT_REQUIRED');
  const type=String(assignmentType||'').toUpperCase();
  if (!['OWNER','PROVIDER','VENDOR','SUBCONTRACTOR'].includes(type)) throw new Error('INVALID_ASSIGNMENT_TYPE');
  const status = 'OFFERED';
  const now = new Date().toISOString();
  let bandFields={};
  if(type==='PROVIDER'){
    const commercialMaximum=money(maximumPayout ?? proposedCompensation);
    const budgetedProviderCost=money(proposedBasis?.budgetedProviderCost ?? commercialMaximum);
    const economicCeiling=money(Math.max(Number(proposedCompensation||0),budgetedProviderCost));
    if(Number(proposedCompensation)>economicCeiling) throw new Error('INITIAL_OFFER_EXCEEDS_ECONOMIC_CEILING');
    bandFields={
      initial_offer_amount:money(proposedCompensation),target_payout_amount:money(targetPayout ?? proposedCompensation),maximum_payout_amount:commercialMaximum,
      economic_ceiling_amount:economicCeiling,budgeted_provider_cost:budgetedProviderCost,
      payout_band_snapshot:{initialOffer:money(proposedCompensation),targetPayout:money(targetPayout ?? proposedCompensation),commercialMaximum,economicCeiling,budgetedProviderCost,componentCompensationBases:proposedBasis?.componentCompensationBases||[]}
    };
  }
  const { data: offer, error: offerError } = await supabase.from('dd_estimate_assignment_offers').insert({
    estimate_id:estimateId, economics_snapshot_id:estimate.active_economics_snapshot_id, assignment_type:type, provider_id:providerId,
    owner_user_id:ownerUserId, status, component_snapshot_ids:componentSnapshotIds, scope_snapshot:scopeSnapshot,
    proposed_compensation:money(proposedCompensation), proposed_basis:proposedBasis, ...bandFields,
    offered_at:now, responded_at:null, expires_at:expiresAt
  }).select('*').single();
  if (offerError) throw offerError;
  await supabase.from('dd_estimate_assignment_events').insert({ assignment_offer_id:offer.id,event_type:type==='OWNER'?'OWNER_FIRST_REFUSAL_OFFERED':'ASSIGNMENT_OFFERED',actor_user_id:actorUserId,to_status:status,compensation_after:money(proposedCompensation),payload:{scopeSnapshot} });
  await refreshEstimateAssignmentReadiness(supabase, estimateId);
  return offer;
}

export async function getProviderEstimateAssignments(supabase, providerId) {
  if (!providerId) return [];
  const { data, error } = await supabase.from('dd_estimate_assignment_offers')
    .select('id,estimate_id,status,scope_snapshot,resource_requirements_snapshot,proposed_compensation,proposed_basis,counter_compensation,counter_basis,counter_reason,economic_impact_status,offer_version,offered_at,responded_at,resolved_at,expires_at,route_distance_miles,route_distance_source,travel_cost_snapshot,jurisdiction_snapshot,dd_estimates(public_reference,client_name,organization_name,location_address,city,state,zip_code,timeline,requested_date,estimate_status,estimated_total)')
    .eq('provider_id',providerId).neq('status','PROPOSED').order('created_at',{ascending:false}).limit(100);
  if (error) throw error;
  return data || [];
}

export async function getOwnerEstimateAssignments(supabase) {
  const { data, error } = await supabase.from('dd_estimate_assignment_offers')
    .select('*,dd_estimates(public_reference,client_name,organization_name,location_address,estimate_status,estimated_total)')
    .order('created_at',{ascending:false}).limit(200);
  if (error) throw error;
  return data || [];
}

export async function respondToEstimateAssignment(supabase, { assignmentId, providerId, decision, counterCompensation = null, counterBasis = null, reason = null, actorUserId = null }) {
  const normalized=String(decision||'').toUpperCase();
  if (!['ACCEPT','DECLINE','COUNTEROFFER'].includes(normalized)) throw new Error('INVALID_ASSIGNMENT_DECISION');
  const { data: offer, error } = await supabase.from('dd_estimate_assignment_offers').select('*').eq('id',assignmentId).eq('provider_id',providerId).single();
  if (error || !offer) throw error || new Error('ASSIGNMENT_NOT_FOUND');
  if (offer.status !== 'OFFERED') throw new Error('ASSIGNMENT_NOT_OPEN');
  const now=new Date().toISOString();
  let next;
  if(normalized==='ACCEPT') next={status:'ACCEPTED',responded_at:now};
  else if(normalized==='DECLINE') next={status:'DECLINED',responded_at:now,counter_reason:reason||null};
  else {
    const amount=Number(counterCompensation);
    if(!Number.isFinite(amount)||amount<0) throw new Error('VALID_COUNTER_AMOUNT_REQUIRED');
    const effectiveMaximum=Math.min(Number(offer.maximum_payout_amount ?? Number.POSITIVE_INFINITY),Number(offer.economic_ceiling_amount ?? Number.POSITIVE_INFINITY));
    const target=Number(offer.target_payout_amount ?? offer.proposed_compensation);
    const bandStatus=amount>effectiveMaximum?'EXCEEDS_MAXIMUM':amount>target?'WITHIN_MAX_REVIEW':'WITHIN_TARGET';
    next={
      status:'COUNTEROFFERED',responded_at:now,counter_compensation:money(amount),
      counter_basis:{...(counterBasis||{}),bandStatus},counter_reason:reason||null,
      economic_impact_status:bandStatus==='EXCEEDS_MAXIMUM'?'REQUIRES_REPRICE':'WITHIN_FLOOR'
    };
  }
  const { data: updated, error:updateError }=await supabase.from('dd_estimate_assignment_offers').update(next).eq('id',assignmentId).eq('status','OFFERED').select('*').single();
  if(updateError) throw updateError;
  await supabase.from('dd_estimate_assignment_events').insert({assignment_offer_id:assignmentId,event_type:`PROVIDER_${normalized}`,actor_user_id:actorUserId,actor_provider_id:providerId,from_status:'OFFERED',to_status:updated.status,compensation_before:offer.proposed_compensation,compensation_after:normalized==='COUNTEROFFER'?updated.counter_compensation:offer.proposed_compensation,reason,payload:{counterBasis:counterBasis||null}});
  if(normalized==='ACCEPT'){
    const {error:estimateError}=await supabase.from('dd_estimates').select('id').eq('id',offer.estimate_id).single();
    if(estimateError) throw estimateError;
    const {data:job,error:jobError}=await supabase.from('dd_jobs').select('id').eq('estimate_id',offer.estimate_id).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(jobError) throw jobError;
    if(job){
      const {data:provider,error:providerError}=await supabase.from('dd_providers').select('id,org_id').eq('id',providerId).single();
      if(providerError) throw providerError;
      const {data:existingAssignment,error:existingAssignmentError}=await supabase.from('dd_job_assignments').select('id').eq('job_id',job.id).eq('provider_id',providerId).in('assignment_status',['OFFERED','ACCEPTED']).limit(1).maybeSingle();
      if(existingAssignmentError) throw existingAssignmentError;
      if(!existingAssignment){
        const {error:jobAssignmentError}=await supabase.from('dd_job_assignments').insert({
          job_id:job.id,provider_id:providerId,provider_org_id:provider?.org_id||null,
          source_assignment_offer_id:offer.id,economics_snapshot_id:offer.economics_snapshot_id,
          ...(() => {
            const authority=resolveAcceptedAssignmentAuthority(offer);
            return {
              authorized_provider_compensation:authority.authorizedProviderCompensation,
              compensation_basis_snapshot:authority.compensationBasisSnapshot
            };
          })(),
          assignment_status:'ACCEPTED',provider_notes:'Accepted paid quote assignment.',
          offered_at:offer.offered_at||now,accepted_at:now,response_at:now
        });
        if(jobAssignmentError) throw jobAssignmentError;
      }
      const {error:jobUpdateError}=await supabase.from('dd_jobs').update({assigned_to:providerId,updated_at:now}).eq('id',job.id);
      if(jobUpdateError) throw jobUpdateError;
    }
  }
  await refreshEstimateAssignmentReadiness(supabase, offer.estimate_id);
  return updated;
}

export async function respondToOwnerEstimateAssignment(supabase, { assignmentId, decision, actorUserId }) {
  const normalized=String(decision||'').toUpperCase();
  if(!['ACCEPT','DECLINE'].includes(normalized)) throw new Error('INVALID_OWNER_ASSIGNMENT_DECISION');
  const {data:offer,error}=await supabase.from('dd_estimate_assignment_offers').select('*').eq('id',assignmentId).eq('assignment_type','OWNER').single();
  if(error||!offer) throw error||new Error('OWNER_ASSIGNMENT_NOT_FOUND');
  if(String(offer.owner_user_id)!==String(actorUserId)) throw new Error('OWNER_ASSIGNMENT_ACTOR_MISMATCH');
  if(offer.status!=='OFFERED') throw new Error('OWNER_ASSIGNMENT_NOT_OPEN');

  const {data:estimate,error:estimateError}=await supabase.from('dd_estimates')
    .select('id,service_request_id,zip_code,active_economics_snapshot_id')
    .eq('id',offer.estimate_id).single();
  if(estimateError||!estimate) throw estimateError||new Error('ESTIMATE_NOT_FOUND');
  const {data:job,error:jobError}=await supabase.from('dd_jobs')
    .select('id,job_status,assigned_to,internal_notes').eq('estimate_id',offer.estimate_id)
    .order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(jobError) throw jobError;

  const now=new Date().toISOString();
  const status=normalized==='ACCEPT'?'ACCEPTED':'DECLINED';
  const {data:updated,error:updateError}=await supabase.from('dd_estimate_assignment_offers')
    .update({status,responded_at:now,resolved_at:now,resolved_by:actorUserId,resolution:normalized})
    .eq('id',assignmentId).eq('status','OFFERED').select('*').single();
  if(updateError) throw updateError;

  await supabase.from('dd_estimate_assignment_events').insert({
    assignment_offer_id:assignmentId,event_type:`OWNER_${normalized}_ASSIGNMENT`,
    actor_user_id:actorUserId,from_status:'OFFERED',to_status:status,
    compensation_before:offer.proposed_compensation,compensation_after:offer.proposed_compensation,
    payload:{paidFirst:true,ownerFirst:true}
  });

  if(normalized==='ACCEPT'){
    if(job){
      const {error:jobUpdateError}=await supabase.from('dd_jobs').update({
        assigned_to:`OWNER:${actorUserId}`,updated_at:now
      }).eq('id',job.id);
      if(jobUpdateError) throw jobUpdateError;
    }
    await supabase.from('dd_estimates').update({assignment_readiness_status:'READY'}).eq('id',offer.estimate_id);
    return {offer:updated,routing:{status:'OWNER_ACCEPTED',jobId:job?.id||null}};
  }

  // Owner decline never exposes the job to providers blindly. The job moves to
  // a routing hold until a provider with verified dispatch-origin/location data
  // can be ranked and the travel economics are known.
  await supabase.from('dd_estimates').update({assignment_readiness_status:'NEEDS_REASSIGNMENT'}).eq('id',offer.estimate_id);
  if(job){
    const {error:jobUpdateError}=await supabase.from('dd_jobs').update({
      job_status:'blocked',assigned_to:null,
      internal_notes:[job.internal_notes,'Owner first refusal declined; route to next eligible provider only after location/mileage economics resolve.'].filter(Boolean).join('\n'),
      updated_at:now
    }).eq('id',job.id);
    if(jobUpdateError) throw jobUpdateError;
  }
  return {offer:updated,routing:{status:'NEEDS_REASSIGNMENT',jobId:job?.id||null}};
}

export async function resolveEstimateCounteroffer(supabase, { assignmentId, decision, actorUserId }) {
  const normalized=String(decision||'').toUpperCase();
  if(!['ACCEPT','REJECT'].includes(normalized)) throw new Error('INVALID_COUNTER_RESOLUTION');
  const {data:offer,error}=await supabase.from('dd_estimate_assignment_offers').select('*').eq('id',assignmentId).single();
  if(error||!offer) throw error||new Error('ASSIGNMENT_NOT_FOUND');
  if(offer.status!=='COUNTEROFFERED') throw new Error('NO_OPEN_COUNTEROFFER');
  const {data:snapshot,error:snapshotError}=await supabase.from('dd_estimate_economics_snapshots').select('*').eq('id',offer.economics_snapshot_id).single();
  if(snapshotError) throw snapshotError;
  const {data:acceptedCounters,error:acceptedError}=await supabase.from('dd_estimate_assignment_offers')
    .select('proposed_compensation,counter_compensation').eq('estimate_id',offer.estimate_id).eq('economics_snapshot_id',offer.economics_snapshot_id)
    .eq('status','OWNER_ACCEPTED_COUNTER').neq('id',assignmentId);
  if(acceptedError) throw acceptedError;
  const reservedDelta=(acceptedCounters||[]).reduce((sum,row)=>sum+Math.max(0,Number(row.counter_compensation||0)-Number(row.proposed_compensation||0)),0);
  const adjustedSnapshot={...snapshot,minimum_viable_price:money(Number(snapshot.minimum_viable_price||0)+reservedDelta)};
  const impact=evaluateCounteroffer(adjustedSnapshot,offer.proposed_compensation,offer.counter_compensation,{
    targetPayout:offer.target_payout_amount,
    maximumPayout:offer.maximum_payout_amount
  });
  impact.reservedCounterofferDelta=money(reservedDelta);
  const now=new Date().toISOString();
  const accepted=normalized==='ACCEPT';
  const status=accepted?'OWNER_ACCEPTED_COUNTER':'OWNER_REJECTED_COUNTER';
  const economicImpactStatus=accepted?impact.economicImpactStatus:'WITHIN_FLOOR';
  const {data:updated,error:updateError}=await supabase.from('dd_estimate_assignment_offers').update({status,economic_impact_status:economicImpactStatus,resolved_at:now,resolved_by:actorUserId,resolution:normalized}).eq('id',assignmentId).eq('status','COUNTEROFFERED').select('*').single();
  if(updateError) throw updateError;
  if(accepted){
    const estimateStatus=impact.requiresCustomerReapproval?'needs_review':null;
    const updates={assignment_readiness_status:impact.requiresCustomerReapproval?'NEEDS_REPRICE':'COUNTER_ACCEPTED'};
    if(estimateStatus) updates.estimate_status=estimateStatus;
    await supabase.from('dd_estimates').update(updates).eq('id',offer.estimate_id);

    // Accepted counteroffers become the frozen assignment compensation authority.
    // Do not carry the original proposed amount into AP/earnings after the owner
    // explicitly accepts a provider's counter.
    const {data:job,error:jobError}=await supabase.from('dd_jobs')
      .select('id').eq('estimate_id',offer.estimate_id)
      .order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(jobError) throw jobError;
    if(job && !impact.requiresCustomerReapproval){
      const {data:provider,error:providerError}=await supabase.from('dd_providers')
        .select('id,org_id').eq('id',offer.provider_id).single();
      if(providerError) throw providerError;
      const authority=resolveAcceptedAssignmentAuthority(offer,{acceptedCounter:true,acceptedAt:now});
      const acceptedCompensation=authority.authorizedProviderCompensation;
      const basis=authority.compensationBasisSnapshot;
      const {data:existingAssignment,error:existingAssignmentError}=await supabase.from('dd_job_assignments')
        .select('id').eq('source_assignment_offer_id',offer.id).limit(1).maybeSingle();
      if(existingAssignmentError) throw existingAssignmentError;
      if(existingAssignment){
        const {error:assignmentUpdateError}=await supabase.from('dd_job_assignments').update({
          provider_id:offer.provider_id,provider_org_id:provider?.org_id||null,
          economics_snapshot_id:offer.economics_snapshot_id,
          authorized_provider_compensation:acceptedCompensation,
          compensation_basis_snapshot:basis,
          assignment_status:'ACCEPTED',
          provider_notes:'Owner accepted provider counteroffer.',
          accepted_at:now,response_at:offer.responded_at||now
        }).eq('id',existingAssignment.id);
        if(assignmentUpdateError) throw assignmentUpdateError;
      } else {
        const {error:assignmentInsertError}=await supabase.from('dd_job_assignments').insert({
          job_id:job.id,provider_id:offer.provider_id,provider_org_id:provider?.org_id||null,
          source_assignment_offer_id:offer.id,economics_snapshot_id:offer.economics_snapshot_id,
          authorized_provider_compensation:acceptedCompensation,
          compensation_basis_snapshot:basis,
          assignment_status:'ACCEPTED',provider_notes:'Owner accepted provider counteroffer.',
          offered_at:offer.offered_at||now,accepted_at:now,response_at:offer.responded_at||now
        });
        if(assignmentInsertError) throw assignmentInsertError;
      }
      const {error:jobUpdateError}=await supabase.from('dd_jobs').update({assigned_to:offer.provider_id,updated_at:now}).eq('id',job.id);
      if(jobUpdateError) throw jobUpdateError;
    }
  }
  await supabase.from('dd_estimate_assignment_events').insert({assignment_offer_id:assignmentId,event_type:`OWNER_${normalized}_COUNTEROFFER`,actor_user_id:actorUserId,from_status:'COUNTEROFFERED',to_status:status,compensation_before:offer.proposed_compensation,compensation_after:accepted?offer.counter_compensation:offer.proposed_compensation,payload:{impact}});
  await refreshEstimateAssignmentReadiness(supabase, offer.estimate_id);
  return {offer:updated,impact};
}
