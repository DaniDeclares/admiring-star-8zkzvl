// Deterministic competitor-price candidate extractor (no model, no network). Output is CANDIDATE evidence only:
// callers must record it as comparability PARTIAL / verification UNVERIFIED so it never counts toward an evidence target.
const UNITS = [
  [/^(hour|hr|hrs|hourly)\b/i, 'LABOR_HOUR'], [/^(visit|trip|clean(?:ing)?)\b/i, 'VISIT'], [/^(job|project|service|appointment)\b/i, 'JOB'],
  [/^(month|mo|monthly)\b/i, 'MONTH'], [/^(week|wk|weekly)\b/i, 'WEEK'], [/^(day|daily)\b/i, 'DAY'], [/^(year|yr|annual)\b/i, 'YEAR'],
  [/^(bag|bags)\b/i, 'BAG'], [/^(load|loads)\b/i, 'LOAD'], [/^(room|rooms)\b/i, 'ROOM'], [/^(plant|plants)\b/i, 'PLANT'],
  [/^(pound|pounds|lb|lbs)\b/i, 'POUND'], [/^(inch|inches|in)\b/i, 'INCH'], [/^(mile|miles|mi)\b/i, 'MILE'],
  [/^(sq\.?\s?ft\.?|square\s+f(?:oo|ee)t|sf)\b/i, 'SQFT'], [/^(item|each|piece|pc)\b/i, 'ITEM'], [/^(30[-\s]?min(?:ute)?s?)\b/i, '30_MIN'],
];
const MONEY = String.raw`\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?`;
const RE = new RegExp(`(starting\\s+(?:at|from)|starts\\s+at|from|as\\s+low\\s+as)?\\s*${MONEY}(?:\\s*(?:-|–|—|to)\\s*\\$?\\s?(\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.(\\d{2}))?)?\\s*(?:\\+)?\\s*(?:per|/|a|an|each)\\s*(30[-\\s]?min(?:ute)?s?|sq\\.?\\s?ft|square\\s+f(?:oo|ee)t|[a-z]+)`, 'gi');
const cents = (d, c) => Math.round(Number(String(d).replace(/,/g, '')) * 100 + (c ? Number(c) : 0));
export function unitFor(word) { const w = String(word || '').trim(); for (const [re, u] of UNITS) if (re.test(w)) return u; return null; }
export function extractPriceCandidates(text, { max = 6 } = {}) {
  const out = []; const seen = new Set(); const t = String(text || '');
  for (const m of t.matchAll(RE)) {
    const unit = unitFor(m[6]); if (!unit) continue;
    const low = cents(m[2], m[3]); const hasHigh = m[4] != null; const high = hasHigh ? cents(m[4], m[5]) : null;
    if (low < 100 || low > 10000000) continue;                       // under $1 or over $100,000: not a service price
    if (hasHigh && (high < low || high > 10000000)) continue;
    const key = `${low}|${high}|${unit}`; if (seen.has(key)) continue; seen.add(key);
    const i = m.index ?? 0;
    out.push({ low_cents: low, high_cents: hasHigh ? high : null, unit, starting_at: !!m[1], snippet: t.slice(Math.max(0, i - 40), i + m[0].length + 40).replace(/\s+/g, ' ').trim().slice(0, 200) });
    if (out.length >= max) break;
  }
  return out;
}
