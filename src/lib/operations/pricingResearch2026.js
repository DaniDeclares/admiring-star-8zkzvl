const ALLOWED_RESEARCH_STATES = new Set(['QUEUED','RESEARCHING','EVIDENCE_READY','ECONOMICS_READY','REVIEW_READY','GOVERNED','BLOCKED']);
const VERIFIED = new Set(['VERIFIED','SINGLE_SOURCE']);
const DIRECTNESS = Object.freeze({ DIRECT: 1, PARTIAL: 0.6, CONTEXT_ONLY: 0.25 });

export function summarizeMarketEvidence(rows = []) {
  const usable = rows.filter(r => VERIFIED.has(r.verification_status) && r.comparability !== 'CONTEXT_ONLY' && r.observed_price_low_cents != null);
  if (!usable.length) return { count: 0, weightedMarketCents: null, confidence: 'LOW' };
  let weighted = 0, weights = 0;
  for (const r of usable) {
    const low = Number(r.observed_price_low_cents);
    const high = r.observed_price_high_cents == null ? low : Number(r.observed_price_high_cents);
    const midpoint = Math.round((low + high) / 2);
    const weight = DIRECTNESS[r.comparability] || 0;
    weighted += midpoint * weight;
    weights += weight;
  }
  const count = usable.length;
  return {
    count,
    weightedMarketCents: weights ? Math.round(weighted / weights) : null,
    confidence: count >= 3 ? 'HIGH' : count === 2 ? 'MEDIUM' : 'LOW'
  };
}

export function buildPricingProposal({ currentPriceCents, minimumViablePriceCents, evidence = [] } = {}) {
  const market = summarizeMarketEvidence(evidence);
  const floor = Number(minimumViablePriceCents || 0) || null;
  const current = Number(currentPriceCents || 0) || null;
  if (!market.weightedMarketCents) {
    return { proposedPriceCents: current, market, status: 'RESEARCHING', reason: 'INSUFFICIENT_MARKET_EVIDENCE' };
  }
  // Market evidence is a benchmark, never authority. The proposal may not fall below
  // the governed economics floor. Existing price remains unchanged until review.
  const benchmark = market.weightedMarketCents;
  const proposed = Math.max(floor || 0, benchmark);
  return {
    proposedPriceCents: proposed,
    market,
    status: floor ? 'REVIEW_READY' : 'EVIDENCE_READY',
    reason: floor ? 'MARKET_AND_ECONOMICS_AVAILABLE' : 'ECONOMICS_REQUIRED'
  };
}

export async function loadPricingResearchQueue(supabase, { family, limit = 50 } = {}) {
  let query = supabase.from('dd_service_pricing_research_queue')
    .select('id,service_id,canonical_sku,service_family,research_status,priority,pricing_model,geography_scope,evidence_target,evidence_count,economics_ready,current_price_cents,proposed_price_cents,minimum_viable_price_cents,modeled_direct_cost_cents,expected_contribution_cents,expected_margin_percent,economics_evidence_status,confidence,blocking_reason')
    .in('research_status',['QUEUED','RESEARCHING','EVIDENCE_READY','ECONOMICS_READY','REVIEW_READY'])
    .order('priority').order('canonical_sku').limit(limit);
  if (family) query = query.eq('service_family', family);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function loadServiceMarketEvidence(supabase, serviceId) {
  const { data, error } = await supabase.from('dd_service_market_evidence')
    .select('id,service_id,canonical_sku,source_name,source_url,geography,observed_offer,observed_price_low_cents,observed_price_high_cents,pricing_unit,comparable_scope,comparability,verification_status,observed_at,research_run,notes')
    .eq('service_id', serviceId).order('observed_at',{ascending:false});
  if (error) throw error;
  return data || [];
}

export async function recordServiceMarketEvidence(supabase, evidence) {
  if (!evidence?.service_id || !evidence?.canonical_sku || !evidence?.source_name || !evidence?.observed_offer) {
    throw new Error('Incomplete pricing evidence.');
  }
  const { data, error } = await supabase.from('dd_service_market_evidence').insert(evidence).select('id').single();
  if (error) throw error;
  return data;
}

export async function loadAuditedEconomics(supabase, serviceId) {
  const { data, error } = await supabase.from('dd_service_economic_baselines')
    .select('runtime_service_id,evidence_status,estimated_duration_hours,labor_rate,materials_cost,travel_cost,other_direct_cost,source_type,source_reference,source_date,notes')
    .eq('runtime_service_id', serviceId).maybeSingle();
  if (error) throw error;
  if (!data || !['AUDITED','VERIFIED','GOVERNED'].includes(data.evidence_status)) return null;
  const directCostCents = Math.round(100 * (
    Number(data.estimated_duration_hours || 0) * Number(data.labor_rate || 0) +
    Number(data.materials_cost || 0) + Number(data.travel_cost || 0) + Number(data.other_direct_cost || 0)
  ));
  return { ...data, directCostCents, minimumViablePriceCents: Math.ceil(directCostCents / 0.60) };
}

export async function refreshPricingResearchItem(supabase, queueRow, minimumViablePriceCents = null) {
  if (!queueRow?.service_id) throw new Error('Missing queue service_id.');
  if (!ALLOWED_RESEARCH_STATES.has(queueRow.research_status)) throw new Error('Invalid pricing research state.');
  const evidence = await loadServiceMarketEvidence(supabase, queueRow.service_id);
  const economics = await loadAuditedEconomics(supabase, queueRow.service_id);
  if (minimumViablePriceCents == null) minimumViablePriceCents = economics?.minimumViablePriceCents ?? null;
  const proposal = buildPricingProposal({
    currentPriceCents: queueRow.current_price_cents,
    minimumViablePriceCents,
    evidence
  });
  const update = {
    evidence_count: evidence.length,
    economics_ready: minimumViablePriceCents != null,
    modeled_direct_cost_cents: economics?.directCostCents ?? null,
    economics_evidence_status: economics?.evidence_status ?? null,
    expected_contribution_cents: economics && queueRow.current_price_cents != null ? Number(queueRow.current_price_cents) - economics.directCostCents : null,
    expected_margin_percent: economics && Number(queueRow.current_price_cents) > 0 ? Number((((Number(queueRow.current_price_cents)-economics.directCostCents)/Number(queueRow.current_price_cents))*100).toFixed(2)) : null,
    minimum_viable_price_cents: minimumViablePriceCents,
    proposed_price_cents: proposal.proposedPriceCents,
    confidence: proposal.market.confidence,
    research_status: proposal.status,
    last_researched_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('dd_service_pricing_research_queue')
    .update(update).eq('id', queueRow.id).select().single();
  if (error) throw error;
  return { queue: data, proposal };
}

// Deliberately absent: no function here writes services.base_price_cents,
// dd_service_pricing_rules, Stripe, or checkout prices. Promotion to governed
// pricing is a separate controlled operation after evidence + economics review.
