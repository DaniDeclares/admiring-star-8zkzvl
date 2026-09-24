// Layers 2-4 of the commercial composition pipeline (see
// /mnt/project-files/quote-builder/quote-builder-audit-2026-09-23.md and Dani's
// 2026-09-23 architecture note):
//   evidence -> candidate matching -> commercial validation -> package/custom
//   composition -> (human review happens in Quote Builder UI, unchanged) -> frozen
//   estimate (existing createEstimate()/dd_estimates, untouched by this file).
//
// This file consumes normalized ScopeEvidence (see liveDiscoveryInterpreter2026.js's
// ScopeEvidence shape) -- never raw text directly. That is the seam that lets future
// interpreters (structured web intake, Thumbtack fields, email text, call
// transcription) feed this same pipeline without any change here.
//
// Keyword matching is an implementation detail of matchCandidates() ONLY. Do not let
// it leak into validateCommercial() or recognizeComposition() -- a future candidate
// matcher (embeddings, an LLM classifier) could replace matchCandidates() alone without
// touching the rest of the pipeline.
//
// Nothing in this file adds a line item, invents a price, or bypasses a release gate.
// Every output is a candidate for human review in Quote Builder.

function wordsOf(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

// Deliberately excludes service_family: a generic family word like "cleaning" would
// otherwise match nearly every service in that family and flood the candidate list.
// Only the service's own name and its explicit intake_keywords opt-in are matched.
function haystackWordsFor(entity) {
  return wordsOf([entity.name, ...(entity.intake_keywords || [])].filter(Boolean).join(' '));
}

// Word-level match, not raw substring: "bathrooms" must match a catalog entry whose
// haystack only says "bathroom" (and vice versa) without also matching unrelated words
// that merely share a short prefix.
function tokenMatchesWord(token, word) {
  if (!token || !word) return false;
  if (token === word) return true;
  return token.length >= 4 && word.length >= 4 && (token.startsWith(word) || word.startsWith(token));
}

function anyWordMatches(words, token) {
  return words.some(w => tokenMatchesWord(token, w));
}

function evidenceTokens(evidence) {
  const factTokens = (evidence.extractedFacts || []).flatMap(f => [
    String(f.key || '').toLowerCase(),
    ...String(f.value ?? '').toLowerCase().split(/[\s_]+/)
  ]);
  const rawTokens = wordsOf(evidence.rawText).filter(w => w.length > 2);
  return [...new Set([...factTokens, ...rawTokens])].filter(Boolean);
}

// --- Layer 2: candidate matching ----------------------------------------------------
/**
 * Match normalized ScopeEvidence against the governed catalog. Returns kept candidates
 * plus anything suppressed by an explicit negative-scope fact -- an explicit "I don't
 * need X" always wins over a keyword hit, even when X's own words appear elsewhere in
 * the evidence.
 */
export function matchCandidates(evidence, services, { limit = 12 } = {}) {
  const excludedKeys = [...new Set((evidence.negativeScope || []).map(n => n.key.toLowerCase()))];
  const tokens = evidenceTokens(evidence);
  if (!tokens.length || !Array.isArray(services)) return { candidates: [], exclusions: [] };

  const scored = services.map(service => {
    const haystackWords = haystackWordsFor(service);
    const matched = tokens.filter(t => anyWordMatches(haystackWords, t));
    return { service, haystackWords, matched: [...new Set(matched)], score: matched.length };
  }).filter(row => row.score > 0);

  const kept = [];
  const exclusions = [];
  for (const row of scored) {
    const suppressedBy = excludedKeys.find(key => anyWordMatches(row.matched, key) || anyWordMatches(row.haystackWords, key));
    if (suppressedBy) exclusions.push({ sku: row.service.sku, name: row.service.name, suppressedBy });
    else kept.push(row);
  }
  kept.sort((a, b) => b.score - a.score);
  const candidates = kept.slice(0, limit).map(row => ({
    sku: row.service.sku,
    name: row.service.name,
    publicPrice: row.service.publicPrice,
    matchedTerms: row.matched,
    confidence: row.score >= 2 ? 'HIGH' : 'LOW'
  }));
  return { candidates, exclusions };
}

// --- Layer 3: commercial validation -------------------------------------------------
/**
 * Attach governed commercial roles to each candidate. A single canonical_sku can carry
 * more than one role -- its normal standalone price, and (if a SELL_NOW row exists for
 * it in dd_service_addon_rules) a distinct, separately governed add-on price -- without
 * duplicating the underlying service identity.
 */
export function validateCommercial(candidates, { addonRules = [] } = {}) {
  const addonBySku = new Map();
  for (const rule of addonRules) {
    if (rule.status !== 'SELL_NOW') continue;
    if (!addonBySku.has(rule.canonical_sku)) addonBySku.set(rule.canonical_sku, []);
    addonBySku.get(rule.canonical_sku).push(rule);
  }
  return candidates.map(candidate => {
    const roles = [{ role: 'STANDALONE', publicPrice: candidate.publicPrice }];
    for (const rule of addonBySku.get(candidate.sku) || []) {
      roles.push({ role: 'ADD_ON', addonPriceCents: rule.addon_price_cents, eligibleParentSkus: rule.eligible_parent_skus || null });
    }
    return { ...candidate, roles };
  });
}

// --- Layer 4: package / custom composition recognition -----------------------------
/**
 * Which SELL_NOW governed packages the given SKU set fully satisfies (or nearly
 * satisfies, missing at most 2 required components -- so Quote Builder can show
 * "add these to qualify"). A package nobody has authorized yet correctly never matches.
 */
export function matchGovernedPackages(skus, packages) {
  const selected = new Set(skus || []);
  return (packages || [])
    .filter(pkg => pkg.commercial_offer_status === 'SELL_NOW')
    .map(pkg => {
      const components = pkg.components || [];
      const required = components.filter(c => c.is_required);
      const missingRequired = required.filter(c => !selected.has(c.canonical_sku)).map(c => c.canonical_sku);
      const extraSelections = [...selected].filter(sku => !components.some(c => c.canonical_sku === sku));
      return { ...pkg, satisfied: missingRequired.length === 0, missingRequired, extraSelections };
    })
    .filter(row => row.satisfied || row.missingRequired.length <= 2);
}

/**
 * Full package/custom-composition recognition step. Returns the first fully-satisfied
 * SELL_NOW package (its own governed price/economics apply -- never sum-of-parts unless
 * the package's own pricing_type says so), near-misses, and -- only when no package
 * matches and there are 2+ components in play -- an informational custom-composition
 * candidate. That candidate never invents a bundle price; it names the detected
 * combination and states plainly that no governed package or composition rule prices
 * it yet, exactly like "unresolvable items show as not currently quotable."
 */
export function recognizeComposition(skus, packages) {
  const uniqueSkus = [...new Set(skus || [])];
  const matches = matchGovernedPackages(uniqueSkus, packages);
  const satisfied = matches.find(m => m.satisfied) || null;
  const nearMisses = matches.filter(m => !m.satisfied);
  if (satisfied) return { packageCandidate: satisfied, customCompositionCandidate: null, nearMisses };
  if (uniqueSkus.length >= 2) {
    return {
      packageCandidate: null,
      nearMisses,
      customCompositionCandidate: {
        components: uniqueSkus,
        note: 'No governed package or composition rule authorizes bundle pricing for this combination yet -- price components individually until commercial authority defines one.'
      }
    };
  }
  return { packageCandidate: null, customCompositionCandidate: null, nearMisses };
}

// --- Top-level orchestrator ----------------------------------------------------------
/**
 * Run the full pipeline over one piece of ScopeEvidence. Output shape matches the
 * required trace: raw evidence -> extracted facts -> candidates -> exclusions ->
 * unresolved questions -> package/custom candidate -> confidence. Human review and the
 * frozen estimate happen outside this function, in Quote Builder / createEstimate().
 */
export function composeScope(evidence, { services = [], addonRules = [], packages = [] } = {}) {
  const { candidates, exclusions } = matchCandidates(evidence, services);
  const validatedCandidates = validateCommercial(candidates, { addonRules });
  const { packageCandidate, customCompositionCandidate, nearMisses } = recognizeComposition(
    validatedCandidates.map(c => c.sku),
    packages
  );
  return {
    rawEvidence: evidence.rawText,
    sourceType: evidence.sourceType,
    extractedFacts: evidence.extractedFacts || [],
    candidates: validatedCandidates,
    exclusions,
    unresolvedQuestions: evidence.unresolvedQuestions || [],
    packageCandidate,
    customCompositionCandidate,
    nearMisses,
    confidence: validatedCandidates.some(c => c.confidence === 'HIGH') ? 'HIGH' : (validatedCandidates.length ? 'LOW' : 'NONE')
  };
}
