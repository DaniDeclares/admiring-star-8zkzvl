// Layer 1 of the commercial composition pipeline: interpretation / evidence extraction.
// See /mnt/project-files/quote-builder/quote-builder-audit-2026-09-23.md and Dani's
// 2026-09-23 architecture note. This is ONE interpreter -- for typed Live Discovery
// notes during a live call/visit. Structured web intake, Thumbtack fields, email text
// and (later) call transcription are separate interpreters that will each produce the
// same normalized ScopeEvidence shape defined below, so scopeComposer2026.js never has
// to know where the evidence came from. Do not add candidate-matching or pricing logic
// here -- this layer only extracts facts from language; it decides nothing commercial.
//
// ScopeEvidence shape:
//   {
//     rawText: string,
//     sourceType: 'LIVE_DISCOVERY_TEXT',
//     extractedFacts: [{ key, value, evidenceSpan, confidence: 'HIGH'|'LOW' }],
//     negativeScope: [{ key, evidenceSpan }],
//     unresolvedQuestions: [string]
//   }

const WORD_NUMBERS = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
const SEVERITY_WORDS = ['severe','heavy','substantial','biohazard','smoke','extremely','excessive'];
const ADD_ON_SIGNALS = [
  { key:'FRIDGE', patterns:[/\bfridge\b/, /\brefrigerator\b/] },
  { key:'OVEN', patterns:[/\boven\b/] },
  { key:'BASEBOARDS', patterns:[/\bbaseboards?\b/] },
  { key:'CABINET_INTERIORS', patterns:[/\bcabinet(s)? interior/, /\binside (the )?cabinets?\b/, /\bcabinets? inside\b/] },
  { key:'INTERIOR_WINDOWS', patterns:[/\binterior windows?\b/, /\binside windows?\b/, /\bwindows? inside\b/] }
];
const NEGATION_PATTERN = /\b(?:don'?t|do not|doesn'?t|not|no|without)\b[^.,;]{0,40}?\b(junk|clutter)\b(?:[^.,;]{0,15}\b(?:removed|removal)\b)?/gi;

function numberFromText(token) {
  if (/^\d+$/.test(token)) return Number(token);
  return WORD_NUMBERS[token.toLowerCase()] ?? null;
}

function findCount(text, nounPattern) {
  // "two bathrooms", "3 bathrooms", "3BA" / "3 BA"
  const wordOrDigit = '(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)';
  const spelled = new RegExp(`\\b${wordOrDigit}\\s*${nounPattern}`, 'i');
  const m = text.match(spelled);
  if (!m) return null;
  const value = numberFromText(m[1]);
  return value == null ? null : { value, evidenceSpan: m[0].trim() };
}

function findBedBathShorthand(text) {
  // "3BR/2BA", "3 BR 2 BA", "3br2ba"
  const m = text.match(/\b(\d+)\s*br\s*\/?\s*(\d+)\s*ba\b/i);
  if (!m) return null;
  return { bedrooms: Number(m[1]), bathrooms: Number(m[2]), evidenceSpan: m[0] };
}

function detectRecurring(text) {
  if (/\bevery\s+(two|other)\s+weeks?\b/i.test(text) || /\bbi[- ]?weekly\b/i.test(text)) {
    const m = text.match(/\bevery\s+(two|other)\s+weeks?\b|\bbi[- ]?weekly\b/i);
    return { value:'BIWEEKLY', evidenceSpan:m[0] };
  }
  if (/\bevery\s+week\b|\bweekly\b/i.test(text)) {
    const m = text.match(/\bevery\s+week\b|\bweekly\b/i);
    return { value:'WEEKLY', evidenceSpan:m[0] };
  }
  if (/\bevery\s+month\b|\bmonthly\b/i.test(text)) {
    const m = text.match(/\bevery\s+month\b|\bmonthly\b/i);
    return { value:'MONTHLY', evidenceSpan:m[0] };
  }
  return null;
}

function detectCleanType(text) {
  if (/\bdeep\s*clean(ing)?\b/i.test(text)) return { value:'DEEP', evidenceSpan:text.match(/\bdeep\s*clean(ing)?\b/i)[0] };
  if (/\bstandard\s*clean(ing)?\b/i.test(text)) return { value:'STANDARD', evidenceSpan:text.match(/\bstandard\s*clean(ing)?\b/i)[0] };
  if (/\blight\s*clean(ing)?\b|\bvacuum(ing)?\b|\bdust(ing)?\b/i.test(text)) return { value:'LIGHT', evidenceSpan:text.match(/\blight\s*clean(ing)?\b|\bvacuum(ing)?\b|\bdust(ing)?\b/i)[0] };
  return null;
}

function detectGarage(text) {
  const range = text.match(/\b(\d{2,4})\s*(?:-|to)\s*(\d{2,4})\s*(?:sq\.?\s*ft\.?|square\s*feet|sqft)\b/i);
  const mentioned = /\bgarage\b/i.test(text);
  if (!mentioned && !range) return null;
  return { mentioned, range: range ? { low:Number(range[1]), high:Number(range[2]), evidenceSpan:range[0] } : null };
}

function detectNegativeScope(text) {
  const negations = [];
  let m;
  NEGATION_PATTERN.lastIndex = 0;
  while ((m = NEGATION_PATTERN.exec(text))) {
    negations.push({ key: m[1].toLowerCase(), evidenceSpan: m[0].trim() });
  }
  return negations;
}

function detectPet(text) {
  const petMention = text.match(/\b(pet|pets|dog|dogs|cat|cats)\b/i);
  if (!petMention) return null;
  const hasSeverity = SEVERITY_WORDS.some(w => new RegExp(`\\b${w}\\b`, 'i').test(text));
  return { present: true, severe: hasSeverity, evidenceSpan: petMention[0] };
}

/**
 * Parse raw typed Live Discovery text into normalized ScopeEvidence. Pure and
 * deterministic -- call it with the full accumulated transcript so far each time (not
 * just the newest delta); it re-derives facts from the whole text.
 */
export function interpretLiveDiscoveryText(rawText) {
  const text = String(rawText || '');
  const facts = [];
  const unresolvedQuestions = [];

  const bedBath = findBedBathShorthand(text);
  if (bedBath) {
    facts.push({ key:'bedroom_count', value:bedBath.bedrooms, evidenceSpan:bedBath.evidenceSpan, confidence:'HIGH' });
    facts.push({ key:'bathroom_count', value:bedBath.bathrooms, evidenceSpan:bedBath.evidenceSpan, confidence:'HIGH' });
  } else {
    const bathrooms = findCount(text, '(?:bathrooms?|baths?|ba\\b)');
    if (bathrooms) facts.push({ key:'bathroom_count', value:bathrooms.value, evidenceSpan:bathrooms.evidenceSpan, confidence:'HIGH' });
    const bedrooms = findCount(text, '(?:bedrooms?|beds?|br\\b)');
    if (bedrooms) facts.push({ key:'bedroom_count', value:bedrooms.value, evidenceSpan:bedrooms.evidenceSpan, confidence:'HIGH' });
  }

  const cleanType = detectCleanType(text);
  if (cleanType) facts.push({ key:'clean_type', value:cleanType.value, evidenceSpan:cleanType.evidenceSpan, confidence:'HIGH' });

  const recurring = detectRecurring(text);
  if (recurring) {
    facts.push({ key:'recurring_frequency', value:recurring.value, evidenceSpan:recurring.evidenceSpan, confidence:'HIGH' });
    unresolvedQuestions.push('Customer signaled recurring service -- confirm one-time vs. recurring commercial path before sending, no recurring/subscription package is governed yet.');
  }

  for (const signal of ADD_ON_SIGNALS) {
    const hit = signal.patterns.find(p => p.test(text));
    if (hit) facts.push({ key:'add_on_signal', value:signal.key, evidenceSpan:text.match(hit)[0], confidence:'HIGH' });
  }

  const garage = detectGarage(text);
  if (garage?.mentioned) {
    facts.push({ key:'space_signal', value:'GARAGE', evidenceSpan:'garage', confidence:'HIGH' });
    if (garage.range) facts.push({ key:'garage_sqft_range', value:`${garage.range.low}-${garage.range.high}`, evidenceSpan:garage.range.evidenceSpan, confidence:'HIGH' });
  }

  const pet = detectPet(text);
  if (pet) {
    facts.push({ key:'pet_present', value:true, evidenceSpan:pet.evidenceSpan, confidence:'HIGH' });
    // Presence of a pet is never, by itself, a severe-condition fact. Only explicit
    // severity language (see SEVERITY_WORDS) sets this -- do not infer severity from
    // pet presence alone, per 2026-09-23 regression case 4.
    if (pet.severe) facts.push({ key:'pet_condition_severity', value:'SEVERE', evidenceSpan:pet.evidenceSpan, confidence:'HIGH' });
  }

  const negativeScope = detectNegativeScope(text);

  if (!facts.some(f => f.key === 'bathroom_count') && /\bbath(room)?s?\b/i.test(text) && !bedBath) {
    unresolvedQuestions.push('How many bathrooms need service?');
  }
  if (garage?.mentioned && !negativeScope.some(n => n.key === 'junk') && !negativeScope.some(n => n.key === 'clutter') && !/\bjunk\b|\bclutter\b/i.test(text)) {
    unresolvedQuestions.push('Does the garage request include junk/clutter removal, or cleaning and organization only?');
  }

  return { rawText: text, sourceType:'LIVE_DISCOVERY_TEXT', extractedFacts: facts, negativeScope, unresolvedQuestions };
}
