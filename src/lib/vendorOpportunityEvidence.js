// Evidence-only adapter for the existing research and owner-attention flow.
// No scraping, scheduling, DB writes, auto-outreach or vendor registration.
const THIRD_PARTY = /netvendor|compliance depot|opstechnology|vendor credentialing|vendorcafe|realpage vendor|vendor shield/i;
const VENDOR = /\b(?:vendor|supplier|contractor)\s+(?:application|registration|portal|opportunit(?:y|ies)|onboarding|invitation|program)\b|\b(?:request for (?:proposal|quote|bid)|RFP|RFQ|invitation to bid)\b|\bseeking\s+(?:cleaning|maintenance|turnover|janitorial)\s+(?:vendors|contractors)\b/i;
const IRRELEVANT = /\b(?:careers?|employment|job openings?|resident portal|leasing application)\b/i;
const FIT = /cleaning|janitorial|turnover|make.ready|inspection|documentation|maintenance|field support|common.area|office support/i;
const SOLICITATION = /\b(?:request for (?:proposal|quote|bid)|RFP|RFQ|invitation to bid)\b/i;
function normalizeUrl(value) {
  try {
    const u = new URL(value);
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) return null;
    u.hostname = u.hostname.toLowerCase();
    u.hash = '';
    for (const k of [...u.searchParams.keys()]) if (/^utm_|^fbclid$|^gclid$/i.test(k)) u.searchParams.delete(k);
    return u.toString().replace(/\/$/, '');
  } catch { return null; }
}
function normalizeText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function classifyVendorEvidence(record, previous = {}) {
  if (!record || typeof record !== 'object') return { status: 'REVIEW_REQUIRED', reason: 'missing record' };
  const url = normalizeUrl(record.url);
  const id = normalizeText(record.companyId || record.company).toLowerCase();
  if (!id || !url) return { status: 'REVIEW_REQUIRED', reason: 'missing company or valid URL' };
  // First-party attribution must be independently checked by the authorized source adapter.
  if (record.sourceVerified !== true) return { status: 'REVIEW_REQUIRED', reason: 'source authenticity unverified' };
  const text = [record.title, record.body, record.requirements].map(normalizeText).join(' ');
  const hasVendor = VENDOR.test(text);
  if (IRRELEVANT.test(text) && !hasVendor) return { status: 'IGNORE', reason: 'unrelated application' };
  if (!hasVendor) return { status: 'REVIEW_REQUIRED', reason: 'no explicit vendor invitation' };
  const key = id + '|' + url;
  const evidence = [record.title, record.body, record.requirements, record.deadline, record.fees, record.platform]
    .map(normalizeText).join('|');
  if (previous[key] === evidence) return { status: 'UNCHANGED', key, evidence };
  if (!Object.prototype.hasOwnProperty.call(previous, key) && record.baseline === true)
    return { status: 'BASELINED', key, evidence, reason: 'existing evergreen page; no new-opening alert' };
  const thirdParty = THIRD_PARTY.test(text + ' ' + normalizeText(record.platform));
  return {
    status: thirdParty ? 'THIRD_PARTY_REVIEW' : 'OWNER_REVIEW',
    key, evidence, url, company: record.company, serviceFit: FIT.test(text),
    isSolicitation: SOLICITATION.test(text), deadline: record.deadline || null,
    feeFreeVerified: false, directEnrollmentVerified: false,
    requiresOwnerApproval: true, route: 'DANI_AS_VENDOR',
    reason: thirdParty ? 'third-party enrollment mentioned; do not auto-register' : 'verify eligibility, fees and actual opening'
  };
}
module.exports = { classifyVendorEvidence, normalizeUrl };
