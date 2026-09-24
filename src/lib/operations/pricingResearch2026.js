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
    .select('id,service_id,canonical_sku,service_family,research_status,priority,pricing_model,geography_scope,evidence_target,evidence_count,economics_ready,current_price_cents,proposed_price_cents,minimum_viable_price_cents,confidence,blocking_reason')
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

export async function refreshPricingResearchItem(supabase, queueRow, minimumViablePriceCents = null) {
  if (!queueRow?.service_id) throw new Error('Missing queue service_id.');
  if (!ALLOWED_RESEARCH_STATES.has(queueRow.research_status)) throw new Error('Invalid pricing research state.');
  const evidence = await loadServiceMarketEvidence(supabase, queueRow.service_id);
  const proposal = buildPricingProposal({
    currentPriceCents: queueRow.current_price_cents,
    minimumViablePriceCents,
    evidence
  });
  const update = {
    evidence_count: evidence.length,
    economics_ready: minimumViablePriceCents != null,
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
