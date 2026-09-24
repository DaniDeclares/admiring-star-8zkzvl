/**
 * Governed Gmail mailbox roles and deterministic sorter policy.
 * Gmail remains mailbox authority. This module never sends, deletes, archives,
 * or creates sales leads. Lead Scout consumes eligible relationship events later.
 */

export const GMAIL_ACCOUNT_ROLES = Object.freeze({
  'vendors@danideclares.com': 'PRODUCTION_RELATIONSHIP',
  'danideclaresns@gmail.com': 'PRODUCTION_RELATIONSHIP',
  'danijfong20@gmail.com': 'PRODUCTION_MIXED',
  'testingdd63@gmail.com': 'INTERNAL_OPS_TESTING',
});

export const CREDIT_LABEL = 'CREDIT — Reports Scores Disputes & Repair';

const RULES = [
  { key:'CREDIT', label:CREDIT_LABEL, re:/\b(credit score|credit report|experian|equifax|transunion|credit karma|credit dispute|credit bureau|credit monitoring|credit utilization|collection account)\b/i },
  { key:'DD_01', label:'DD 01 — LEGAL & CORPORATE', re:/\b(articles of organization|secretary of state|registered agent|operating agreement|corporate filing|legal notice)\b/i },
  { key:'DD_02', label:'DD 02 — GOV CONTRACTING & CERTIFICATIONS', re:/\b(sam\.gov|cage|uei|wosb|certification|government contract|procurement registration)\b/i },
  { key:'DD_05', label:'DD 05 — FUNDING & CAPITAL', re:/\b(grant|business funding|business loan|capital|lender|financing)\b/i },
  { key:'DD_06', label:'DD 06 — ACCOUNTING TAX & FINANCE', re:/\b(invoice|receipt|tax|irs|payment|expense|subscription|refund|billing)\b/i },
  { key:'DD_07', label:'DD 07 — INSURANCE BONDING & COMPLIANCE', re:/\b(insurance|certificate of insurance|coi|bonding|license renewal|sircon|compliance)\b/i },
  { key:'DD_08', label:'DD 08 — TRAINING & BUSINESS DEVELOPMENT', re:/\b(course|class|webinar|zoom|workshop|score mentor|training)\b/i },
  { key:'DD_09', label:'DD 09 — SALES LEADS & PARTNERSHIPS', re:/\b(proposal|quote request|vendor opportunity|partnership|interested in|service inquiry|estimate)\b/i },
  { key:'DD_10', label:'DD 10 — CUSTOMERS JOBS & SERVICE', re:/\b(appointment|service confirmation|job|customer|booking|scheduled service)\b/i },
  { key:'DD_11', label:'DD 11 — PROVIDERS & WORKFORCE', re:/\b(provider|contractor|subcontractor|onboarding|w-9|workforce|applicant)\b/i },
  { key:'DD_12', label:'DD 12 — MARKETING BRAND & DIGITAL', re:/\b(marketing|seo|social media|brand|website|campaign|google business profile)\b/i },
  { key:'DD_13', label:'DD 13 — TECHNOLOGY SYSTEMS & SECURITY', re:/\b(api|oauth|integration|github|vercel|supabase|security alert|sign-in|login|password|plugin)\b/i },
  { key:'DD_15', label:'DD 15 — GOVERNMENT & BUSINESS INTELLIGENCE', re:/\b(solicitation|rfp|rfq|bid notice|small business|economic development|procurement opportunity)\b/i },
];

const SYSTEM_NOISE = /\b(verification code|one-time code|otp|password reset|sign-in alert|security alert|automated message|do not reply|noreply|no-reply)\b/i;
const INTEGRATION_ONLY = /\b(connect(ed|ion)?|oauth|authorize|integration|plugin|workspace connected|account linked)\b/i;

export function mailboxRole(email) {
  return GMAIL_ACCOUNT_ROLES[String(email || '').trim().toLowerCase()] || 'UNMANAGED';
}

export function classifyGmailMessage({ accountEmail, subject='', snippet='', from='' }) {
  const role = mailboxRole(accountEmail);
  const text = [subject, snippet, from].filter(Boolean).join(' ');
  const internalOnly = role === 'INTERNAL_OPS_TESTING';

  const matches = RULES.filter(rule => rule.re.test(text)).map(rule => ({ key:rule.key, label:rule.label }));
  const systemNoise = SYSTEM_NOISE.test(text);
  const integrationOnly = INTEGRATION_ONLY.test(text) && !/\b(proposal|quote|customer|service inquiry|partnership|contract)\b/i.test(text);

  return {
    role,
    labels: matches,
    confidence: matches.length === 1 ? 'HIGH' : matches.length > 1 ? 'MEDIUM' : 'LOW',
    needsReview: !systemNoise && matches.length === 0,
    internalOnly,
    leadScoutEligible: !internalOnly && !systemNoise && !integrationOnly,
    productionMetricsEligible: !internalOnly,
    suppressionReason: internalOnly ? 'INTERNAL_OPS_TESTING'
      : systemNoise ? 'SYSTEM_AUTH_NOISE'
      : integrationOnly ? 'USER_INITIATED_INTEGRATION_ACTIVITY'
      : null,
  };
}
