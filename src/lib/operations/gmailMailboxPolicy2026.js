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
const RULES=[
{key:'CREDIT',label:CREDIT_LABEL,re:/\b(credit score|credit report|experian|equifax|transunion|credit karma|credit dispute|credit bureau|credit monitoring|credit utilization|collection account)\b/i},
{key:'DD_01',label:'DD 01 — LEGAL & CORPORATE',re:/\b(articles of organization|secretary of state|registered agent|operating agreement|corporate filing|legal notice)\b/i},
{key:'DD_02',label:'DD 02 — GOV CONTRACTING & CERTIFICATIONS',re:/\b(sam\.gov|cage|uei|wosb|certification|government contract|procurement registration)\b/i},
{key:'DD_05',label:'DD 05 — FUNDING & CAPITAL',re:/\b(grant|business funding|business loan|capital|lender|financing)\b/i},
{key:'DD_06',label:'DD 06 — ACCOUNTING TAX & FINANCE',re:/\b(invoice|receipt|tax|irs|payment|expense|subscription|refund|billing)\b/i},
{key:'DD_07',label:'DD 07 — INSURANCE BONDING & COMPLIANCE',re:/\b(insurance|certificate of insurance|coi|bonding|license renewal|sircon|compliance)\b/i},
{key:'DD_08',label:'DD 08 — TRAINING & BUSINESS DEVELOPMENT',re:/\b(course|class|webinar|zoom|workshop|score mentor|training)\b/i},
{key:'DD_09',label:'DD 09 — SALES LEADS & PARTNERSHIPS',re:/\b(proposal|quote request|vendor opportunity|partnership|interested in|service inquiry|estimate)\b/i},
{key:'DD_10',label:'DD 10 — CUSTOMERS JOBS & SERVICE',re:/\b(appointment|service confirmation|job|customer|booking|scheduled service)\b/i},
{key:'DD_11',label:'DD 11 — PROVIDERS & WORKFORCE',re:/\b(provider|contractor|subcontractor|onboarding|w-9|workforce|applicant)\b/i},
{key:'DD_12',label:'DD 12 — MARKETING BRAND & DIGITAL',re:/\b(marketing|seo|social media|brand|website|campaign|google business profile)\b/i},
{key:'DD_13',label:'DD 13 — TECHNOLOGY SYSTEMS & SECURITY',re:/\b(api|oauth|integration|github|vercel|supabase|security alert|sign-in|login|password|plugin)\b/i},
{key:'DD_15',label:'DD 15 — GOVERNMENT & BUSINESS INTELLIGENCE',re:/\b(solicitation|rfp|rfq|bid notice|small business|economic development|procurement opportunity)\b/i}];
const SYSTEM_NOISE=/\b(verification code|one-time code|otp|password reset|sign-in alert|security alert|automated message|do not reply|noreply|no-reply)\b/i;
const INTELLIGENCE_SIGNALS=[
{key:'COMPETITOR',re:/\b(competitor|pricing|price increase|new service|launch|offer|package|bundle)\b/i},
{key:'MARKETING',re:/\b(marketing|campaign|conversion|seo|social media|email strategy|customer acquisition|retention)\b/i},
{key:'OPERATIONS',re:/\b(workflow|automation|operations|dispatch|field service|sop|productivity|process)\b/i},
{key:'PROCUREMENT',re:/\b(procurement|rfp|rfq|solicitation|government contract|supplier|vendor program)\b/i},
{key:'FUNDING',re:/\b(grant|funding|capital|loan|credit|financial readiness)\b/i},
{key:'TECHNOLOGY',re:/\b(ai|artificial intelligence|software|api|integration|automation|platform|technology)\b/i},
{key:'WORKFORCE',re:/\b(contractor|provider|hiring|workforce|labor|training|onboarding)\b/i},
{key:'CUSTOMER_INSIGHT',re:/\b(customer|consumer|buyer|resident|property manager|broker|client experience|pain point)\b/i}];
const INTEGRATION_ONLY=/\b(connect(ed|ion)?|oauth|authorize|integration|plugin|workspace connected|account linked)\b/i;

const INTELLIGENCE_DOMAIN_MAP=Object.freeze({
 COMPETITOR:['CUSTOMER_MARKET_INTELLIGENCE','SERVICE_DISCOVERY'],
 MARKETING:['GROWTH_MEDIA_INTELLIGENCE','CUSTOMER_MARKET_INTELLIGENCE'],
 OPERATIONS:['OPERATING_MODEL_INTELLIGENCE','SERVICE_QUALITY_INTELLIGENCE'],
 PROCUREMENT:['PROCUREMENT_CAPITAL_INTELLIGENCE'],
 FUNDING:['PROCUREMENT_CAPITAL_INTELLIGENCE','COMPANY_FINANCIAL_INTELLIGENCE'],
 TECHNOLOGY:['VENDOR_TECH_INTELLIGENCE','AI_DATA_GOVERNANCE_INTELLIGENCE'],
 WORKFORCE:['WORKFORCE_ECONOMICS','PEOPLE_ORG_INTELLIGENCE'],
 CUSTOMER_INSIGHT:['CUSTOMER_MARKET_INTELLIGENCE','SUPPORT_CONVERSATION_INTELLIGENCE']
});
const LABEL_DOMAIN_MAP=Object.freeze({
 DD_01:['LEGAL_CONTRACT_INTELLIGENCE'],DD_02:['PROCUREMENT_CAPITAL_INTELLIGENCE'],DD_05:['PROCUREMENT_CAPITAL_INTELLIGENCE','COMPANY_FINANCIAL_INTELLIGENCE'],
 DD_06:['COMPANY_FINANCIAL_INTELLIGENCE'],DD_07:['ENTERPRISE_RISK_INTELLIGENCE'],DD_08:['OWNER_RESEARCH_MEMORY'],DD_09:['CUSTOMER_MARKET_INTELLIGENCE'],
 DD_10:['SERVICE_QUALITY_INTELLIGENCE'],DD_11:['WORKFORCE_ECONOMICS','PEOPLE_ORG_INTELLIGENCE'],DD_12:['GROWTH_MEDIA_INTELLIGENCE','WEB_CONTENT_DISCOVERY'],
 DD_13:['VENDOR_TECH_INTELLIGENCE','AI_DATA_GOVERNANCE_INTELLIGENCE'],DD_15:['PROCUREMENT_CAPITAL_INTELLIGENCE']
});
export function gmailResearchDomains(sorting={}){const out=new Set();for(const s of sorting.intelligenceSignals||[])for(const d of INTELLIGENCE_DOMAIN_MAP[s]||[])out.add(d);for(const l of sorting.labels||[])for(const d of LABEL_DOMAIN_MAP[l.key]||[])out.add(d);if(!out.size)out.add('OWNER_RESEARCH_MEMORY');return [...out];}

export function mailboxRole(email){return GMAIL_ACCOUNT_ROLES[String(email||'').trim().toLowerCase()]||'UNMANAGED';}
export function classifyGmailMessage({accountEmail,subject='',snippet='',from=''}){const role=mailboxRole(accountEmail);const text=[subject,snippet,from].filter(Boolean).join(' ');const internalOnly=role==='INTERNAL_OPS_TESTING';const matches=RULES.filter(r=>r.re.test(text)).map(r=>({key:r.key,label:r.label}));const systemNoise=SYSTEM_NOISE.test(text);const intelligenceSignals=INTELLIGENCE_SIGNALS.filter(r=>r.re.test(text)).map(r=>r.key);const integrationOnly=INTEGRATION_ONLY.test(text)&&!/\b(proposal|quote|customer|service inquiry|partnership|contract)\b/i.test(text);return{role,labels:matches,confidence:matches.length===1?'HIGH':matches.length>1?'MEDIUM':'LOW',needsReview:!systemNoise&&matches.length===0,internalOnly,leadScoutEligible:!internalOnly&&!systemNoise&&!integrationOnly,productionMetricsEligible:!internalOnly,intelligenceEligible:intelligenceSignals.length>0,intelligenceSignals,intelligenceReviewRequired:intelligenceSignals.length>0,suppressionReason:internalOnly?'INTERNAL_OPS_TESTING':systemNoise?'SYSTEM_AUTH_NOISE':integrationOnly?'USER_INITIATED_INTEGRATION_ACTIVITY':null};}