// Pure evidence classifier for the existing Owner HQ research refresh.
// No network requests, database writes, new queues, or scheduler.
const THIRD_PARTY = /netvendor|compliance depot|opstechnology|vendor credentialing|vendorcafe|realpage vendor|vendor shield/i;
const VENDOR = /vendor (application|registration|portal|opportunit|onboarding|invitation)|supplier (registration|application)|request for (proposal|quote|bid)|\bRFP\b|\bRFQ\b|seeking (cleaning|maintenance|turnover|janitorial) (vendors|contractors)/i;
const IRRELEVANT = /career(s)?|employment|apply for (a )?job|leasing application|resident portal/i;
const FIT = /cleaning|janitorial|turnover|make.ready|inspection|documentation|maintenance|field support|common.area|office support/i;

function normalizeUrl(value) {
  try {
    const u = new URL(value);
    if (!['https:', 'http:'].includes(u.protocol)) return null;
    u.hash = '';
    for (const k of [...u.searchParams.keys()]) if (/^utm_|^fbclid$|^gclid$/i.test(k)) u.searchParams.delete(k);
    return u.toString().replace(/\/$/, '');
  } catch { return null; }
}
function classifyVendorEvidence(record, previous = {}) {
  const url = normalizeUrl(record.url);
  const text = [record.title, record.body, record.requirements].filter(Boolean).join(' ');
  const id = String(record.companyId || record.company || '').trim().toLowerCase();
  if (!id || !url || !/^https?:\/\//.test(url)) return { status: 'REVIEW_REQUIRED', reason: 'missing company or valid URL' };
  if (IRRELEVANT.test(text) && !VENDOR.test(text)) return { status: 'IGNORE', reason: 'unrelated application' };
  if (!VENDOR.test(text)) return { status: 'REVIEW_REQUIRED', reason: 'no explicit vendor invitation' };
  const key = id + '|' + url;
  const evidence = [record.title, record.body, record.requirements].map(v => String(v || '').trim().replace(/\s+/g, ' ')).join('|');
  if (previous[key] === evidence) return { status: 'UNCHANGED', key, evidence };
  const thirdParty = THIRD_PARTY.test(text);
  return {
    status: thirdParty ? 'THIRD_PARTY_REVIEW' : 'OWNER_REVIEW',
    key, evidence, url, company: record.company,
    serviceFit: FIT.test(text),
    feeFreeVerified: false,
    directEnrollmentVerified: false,
    requiresOwnerApproval: true,
    reason: thirdParty ? 'third-party enrollment mentioned; no auto-registration' : 'opening requires eligibility and fee verification'
  };
}
module.exports = { classifyVendorEvidence, normalizeUrl };
