import { summarizeEconomics, evaluateCounteroffer, calculateCompensation } from './componentEconomics2026.js';

const VERIFIED = new Set(['OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED']);
const money = value => Math.round(Number(value || 0) * 100) / 100;

function selectLatest(rows, predicate) {
  return (rows || []).filter(predicate).sort((a,b) => new Date(b.effective_from || 0) - new Date(a.effective_from || 0))[0] || null;
}

function matchPlan(plan, line, component) {
  return (plan || []).find(item => {
    const skuOk = !item.canonicalSku || item.canonicalSku === line.canonicalSku;
    return skuOk && item.componentCode === component.dd_service_components?.component_code;
  }) || null;
}

export async function createEstimateEconomicsSnapshot(supabase, { estimateId, resolvedLineItems, calculation, fulfillmentPlan = [], actorUserId = null, channelCode = null }) {
  const serviceIds = [...new Set((resolvedLineItems || []).map(x => x.runtimeServiceId).filter(Boolean))];
  const { data: existing, error: versionError } = await supabase.from('dd_estimate_economics_snapshots').select('version').eq('estimate_id', estimateId).order('version',{ascending:false}).limit(1).maybeSingle();
  if (versionError) throw versionError;
  const version = Number(existing?.version || 0) + 1;

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
  let compRules = [];
  if (providerIds.length && componentIds.length) {
    const { data, error } = await supabase.from('dd_provider_compensation_rules').select('*').in('provider_id',providerIds).in('component_id',componentIds).eq('status','ACTIVE');
    if (error) throw error;
    compRules = data || [];
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
    const fulfillmentMode = plan?.fulfillmentMode || row.fulfillment_mode || component.default_fulfillment_mode;
    const fulfillerType = plan?.fulfillerType || (fulfillmentMode === 'PROVIDER' ? 'UNASSIGNED' : fulfillmentMode === 'IN_HOUSE' ? 'UNASSIGNED' : fulfillmentMode === 'PROCURED' ? 'VENDOR' : fulfillmentMode === 'SUBCONTRACTED' ? 'SUBCONTRACTOR' : 'UNASSIGNED');
    const providerId = plan?.providerId || null;
    const ownerUserId = plan?.ownerUserId || null;

    let proposedCompensation = 0;
    let compensationBasis = {};
    let compResolved = ['VENDOR','SUBCONTRACTOR'].includes(fulfillerType);

    if (fulfillerType === 'PROVIDER' && providerId) {
      const rule = selectLatest(compRules, r => r.provider_id === providerId && r.component_id === row.component_id && (!r.service_id || r.service_id === row.service_id));
      const c = calculateCompensation(rule, quantity, { percentBasisAmount: calculation?.estimatedTotal || 0 });
      proposedCompensation = c.amount;
      compensationBasis = c.basis;
      compResolved = c.resolved;
      providerCompensation += c.amount;
    } else if (fulfillerType === 'OWNER' && ownerUserId) {
      const explicit = Number(plan?.proposedCompensation);
      const evidence = String(plan?.compensationEvidenceStatus || '');
      if (Number.isFinite(explicit) && explicit >= 0 && VERIFIED.has(evidence)) {
        proposedCompensation = money(explicit);
        compensationBasis = { compensationType: plan?.compensationType || 'NEGOTIATED_PROJECT', evidenceStatus:evidence, sourceReference:plan?.sourceReference || null };
        compResolved = true;
        ownerCompensation += proposedCompensation;
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
  const workingCapitalRequired = policy ? money((ownerCompensation + providerCompensation + materialsCost + procurementCost + subcontractCost + travelCost + otherVariableCost) * Number(policy.working_capital_buffer_percent || 0) / 100) : 0;
  const summary = summarizeEconomics({ customerPrice, ownerCompensation, providerCompensation, materialsCost, procurementCost, subcontractCost, travelCost, paymentProcessingCost, otherVariableCost, overheadRecoveryRequirement, unresolved: unresolvedReasons.length > 0 });

  if (policy && summary.economicsStatus !== 'UNRESOLVED') {
    if (policy.minimum_margin_percent != null && Number(summary.expectedMarginPercent || 0) < Number(policy.minimum_margin_percent)) summary.economicsStatus = 'FAIL';
    if (policy.minimum_contribution_amount != null && Number(summary.expectedContribution || 0) < Number(policy.minimum_contribution_amount)) summary.economicsStatus = 'FAIL';
  }

  const { data: snapshot, error: snapshotError } = await supabase.from('dd_estimate_economics_snapshots').insert({
    estimate_id: estimateId, version, economics_status: summary.economicsStatus, customer_price: summary.customerPrice,
    owner_compensation: summary.ownerCompensation, provider_compensation: summary.providerCompensation, materials_cost: summary.materialsCost,
    procurement_cost: summary.procurementCost, subcontract_cost: summary.subcontractCost, travel_cost: summary.travelCost,
    payment_processing_cost: summary.paymentProcessingCost, other_variable_cost: summary.otherVariableCost,
    overhead_recovery_requirement: summary.overheadRecoveryRequirement, minimum_viable_price: summary.minimumViablePrice,
    expected_contribution: summary.expectedContribution, expected_margin_percent: summary.expectedMarginPercent,
    working_capital_required: workingCapitalRequired, discount_amount: money(calculation?.residentDiscount || 0), tax_amount: money(calculation?.tax || 0),
    snapshot_payload: { unresolvedReasons:[...new Set(unresolvedReasons)], economicPolicyId: policy?.id || null, channelCode, calculation },
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

  const assignmentReadiness = componentDrafts.length && componentDrafts.every(d => ['OWNER','PROVIDER','VENDOR','SUBCONTRACTOR'].includes(d.fulfillerType) && (d.fulfillerType !== 'PROVIDER' || d.providerId) && (d.fulfillerType !== 'OWNER' || d.ownerUserId)) ? 'READY_TO_OFFER' : 'UNRESOLVED';
  const { error: updateError } = await supabase.from('dd_estimates').update({ economics_status:summary.economicsStatus, assignment_readiness_status:assignmentReadiness, active_economics_snapshot_id:snapshot.id }).eq('id',estimateId);
  if (updateError) throw updateError;
  return { snapshot, assignmentReadiness, unresolvedReasons:[...new Set(unresolvedReasons)] };
}

export async function createEstimateAssignmentOffer(supabase, { estimateId, assignmentType, providerId = null, ownerUserId = null, componentSnapshotIds = [], proposedCompensation = 0, proposedBasis = {}, scopeSnapshot = {}, actorUserId = null, expiresAt = null }) {
  const { data: estimate, error } = await supabase.from('dd_estimates').select('id,active_economics_snapshot_id,economics_status,estimated_total').eq('id',estimateId).single();
  if (error || !estimate) throw error || new Error('ESTIMATE_NOT_FOUND');
  if (!estimate.active_economics_snapshot_id) throw new Error('ECONOMICS_SNAPSHOT_REQUIRED');
  const type=String(assignmentType||'').toUpperCase();
  if (!['OWNER','PROVIDER','VENDOR','SUBCONTRACTOR'].includes(type)) throw new Error('INVALID_ASSIGNMENT_TYPE');
  const status = type === 'OWNER' ? 'ACCEPTED' : 'OFFERED';
  const now = new Date().toISOString();
  const { data: offer, error: offerError } = await supabase.from('dd_estimate_assignment_offers').insert({
    estimate_id:estimateId, economics_snapshot_id:estimate.active_economics_snapshot_id, assignment_type:type, provider_id:providerId,
    owner_user_id:ownerUserId, status, component_snapshot_ids:componentSnapshotIds, scope_snapshot:scopeSnapshot,
    proposed_compensation:money(proposedCompensation), proposed_basis:proposedBasis, offered_at:now, responded_at:type==='OWNER'?now:null, expires_at:expiresAt
  }).select('*').single();
  if (offerError) throw offerError;
  await supabase.from('dd_estimate_assignment_events').insert({ assignment_offer_id:offer.id,event_type:type==='OWNER'?'OWNER_ASSIGNMENT_CREATED':'ASSIGNMENT_OFFERED',actor_user_id:actorUserId,to_status:status,compensation_after:money(proposedCompensation),payload:{scopeSnapshot} });
  return offer;
}

export async function getProviderEstimateAssignments(supabase, providerId) {
  if (!providerId) return [];
  const { data, error } = await supabase.from('dd_estimate_assignment_offers')
    .select('id,estimate_id,status,scope_snapshot,proposed_compensation,proposed_basis,counter_compensation,counter_basis,counter_reason,economic_impact_status,offer_version,offered_at,responded_at,resolved_at,expires_at,dd_estimates(public_reference,client_name,organization_name,location_address,city,state,zip_code,timeline,requested_date,estimate_status,estimated_total)')
    .eq('provider_id',providerId).order('created_at',{ascending:false}).limit(100);
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
    next={status:'COUNTEROFFERED',responded_at:now,counter_compensation:money(amount),counter_basis:counterBasis||{},counter_reason:reason||null};
  }
  const { data: updated, error:updateError }=await supabase.from('dd_estimate_assignment_offers').update(next).eq('id',assignmentId).eq('status','OFFERED').select('*').single();
  if(updateError) throw updateError;
  await supabase.from('dd_estimate_assignment_events').insert({assignment_offer_id:assignmentId,event_type:`PROVIDER_${normalized}`,actor_user_id:actorUserId,actor_provider_id:providerId,from_status:'OFFERED',to_status:updated.status,compensation_before:offer.proposed_compensation,compensation_after:normalized==='COUNTEROFFER'?updated.counter_compensation:offer.proposed_compensation,reason,payload:{counterBasis:counterBasis||null}});
  return updated;
}

export async function resolveEstimateCounteroffer(supabase, { assignmentId, decision, actorUserId }) {
  const normalized=String(decision||'').toUpperCase();
  if(!['ACCEPT','REJECT'].includes(normalized)) throw new Error('INVALID_COUNTER_RESOLUTION');
  const {data:offer,error}=await supabase.from('dd_estimate_assignment_offers').select('*').eq('id',assignmentId).single();
  if(error||!offer) throw error||new Error('ASSIGNMENT_NOT_FOUND');
  if(offer.status!=='COUNTEROFFERED') throw new Error('NO_OPEN_COUNTEROFFER');
  const {data:snapshot,error:snapshotError}=await supabase.from('dd_estimate_economics_snapshots').select('*').eq('id',offer.economics_snapshot_id).single();
  if(snapshotError) throw snapshotError;
  const impact=evaluateCounteroffer(snapshot,offer.proposed_compensation,offer.counter_compensation);
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
  }
  await supabase.from('dd_estimate_assignment_events').insert({assignment_offer_id:assignmentId,event_type:`OWNER_${normalized}_COUNTEROFFER`,actor_user_id:actorUserId,from_status:'COUNTEROFFERED',to_status:status,compensation_before:offer.proposed_compensation,compensation_after:accepted?offer.counter_compensation:offer.proposed_compensation,payload:{impact}});
  return {offer:updated,impact};
}
