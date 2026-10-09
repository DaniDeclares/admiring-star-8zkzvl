// "Build With Me" participation interest: the short, first step for people who want to
// build DANI DECLARES with Danielle. It records interest only. It never creates a provider,
// never grants a capability and never implies eligibility for paid work; service providers
// continue into the existing provider application (/providers) with all of its gates.

export const PARTICIPATION_INTERESTS = {
  SERVICE_PROVIDER: 'Service provider',
  MAKER_CREATOR: 'Maker or creator',
  BUSINESS_PARTNER: 'Existing business or partner',
  COMMUNITY_CONTRIBUTOR: 'Community contributor',
  SKILL_BUILDER: 'Developing my skills',
};

// Broad areas only; they map onto the existing provider capability categories during
// staff review. Picking one never claims or authorizes a service.
export const INTEREST_AREAS = {
  CLEANING_HOME: 'Cleaning & home reset',
  PROPERTY_MAINTENANCE: 'Property & maintenance',
  ERRANDS_COURIER: 'Errands, courier & delivery',
  EVENTS: 'Events & hospitality',
  CREATIVE_PRINT: 'Creative, print & merch',
  MARKETING_CONTENT: 'Marketing & content',
  BUSINESS_ADMIN: 'Business & admin support',
  NOTARY_DOCUMENTS: 'Notary & documents',
  OTHER: 'Something else',
};

export const CONSENT_TEXT = 'I agree that DANI DECLARES LLC may contact me by email or phone about my interest. Submitting this form does not create a job, contract, or guarantee of work or income.';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
const stripControl = (text) => Array.from(text, ch => { const code = ch.charCodeAt(0); return code < 32 || code === 127 ? ' ' : ch; }).join('');
const clean = (value, max) => stripControl(String(value ?? '')).replace(/\s+/g, ' ').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export function normalizeInterestSubmission(body = {}, { now = new Date() } = {}) {
  const errors = [];
  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const participation = String(body.participationInterest || '');
  const areas = Array.isArray(body.interestAreas) ? [...new Set(body.interestAreas.map(String))] : [];
  const skills = clean(body.skillsAndEquipment, 1500);
  const locationArea = clean(body.locationArea, 120);
  const message = clean(body.message, 2000);

  if (!name) errors.push('NAME_REQUIRED');
  if (!EMAIL_RE.test(email)) errors.push('EMAIL_INVALID');
  if (phone && !/^[0-9+().\-\s]{7,40}$/.test(phone)) errors.push('PHONE_INVALID');
  if (!PARTICIPATION_INTERESTS[participation]) errors.push('PARTICIPATION_INTEREST_REQUIRED');
  if (areas.some(area => !INTEREST_AREAS[area]) || areas.length > Object.keys(INTEREST_AREAS).length) errors.push('INTEREST_AREA_INVALID');
  if (!skills) errors.push('SKILLS_REQUIRED');
  if (body.contactConsent !== true) errors.push('CONSENT_REQUIRED');

  const utm = {};
  for (const key of UTM_KEYS) {
    const value = clean(body.attribution?.[key], 120);
    if (value) utm[key] = value;
  }
  const landingPath = clean(body.attribution?.landing_path, 200);
  const campaignCode = clean(body.attribution?.campaign_code || utm.utm_campaign, 80).toLowerCase().replace(/[^a-z0-9_-]/g, '') || null;

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    record: {
      name,
      email,
      phone: phone || null,
      interest_area: PARTICIPATION_INTERESTS[participation],
      participation_interest: participation,
      interest_areas: areas,
      skills_and_equipment: skills,
      location_area: locationArea || null,
      message: message || null,
      source: campaignCode === 'build-with-me' ? 'BUILD_WITH_ME' : 'WEBSITE_PARTNER_NETWORK',
      campaign_code: campaignCode,
      utm,
      landing_path: landingPath || null,
      contact_consent: true,
      consent_at: now.toISOString(),
      consent_text: CONSENT_TEXT,
    },
  };
}

// Builds the next-step link into the existing provider application, carrying attribution
// through the parameters providerAcquisitionSource() already reads.
export function providerApplicationLink(attribution = {}) {
  const params = new URLSearchParams();
  params.set('utm_campaign', attribution.campaign_code || attribution.utm_campaign || 'build-with-me');
  if (attribution.utm_source) params.set('utm_source', attribution.utm_source);
  if (attribution.utm_medium) params.set('utm_medium', attribution.utm_medium);
  params.set('audience', 'provider');
  return `/providers?${params.toString()}`;
}

// What happens next for each participation type. Shown on screen and in the acknowledgment
// email. Interest never authorizes paid work; these are honest next steps only.
export const NEXT_STEPS = {
  SERVICE_PROVIDER: 'If you want paid service work, the next step is the DANI provider application: your services, agreement, tax form and any required documents. Approval comes after review.',
  MAKER_CREATOR: "We'll review what you make and reach out if there's a fit with a DANI product, project or order. Nothing is scheduled or purchased yet.",
  BUSINESS_PARTNER: "We'll review your business and reach out about whether a partnership or subcontracting conversation makes sense. This isn't a contract or provider approval.",
  COMMUNITY_CONTRIBUTOR: "We'll reach out about ways to stay involved as DANI grows. This isn't a paid role.",
  SKILL_BUILDER: "We'll keep you in mind as opportunities to learn and grow open up. This isn't a job or training offer.",
};

// The paying-customer path for business-building help. It enters the existing service
// request intake (leads + service_requests, operator alert + customer confirmation) on the
// CH04 Businesses channel, front door CH04-F02 Workplace & Office Operations. It never
// creates a provider application.
export function hireDaniLink(attribution = {}) {
  const params = new URLSearchParams({ channelType: 'B2B', frontDoor: 'CH04-F02', utm_campaign: attribution.campaign_code || attribution.utm_campaign || 'build-with-me', audience: 'hire-dani' });
  if (attribution.utm_source) params.set('utm_source', attribution.utm_source);
  if (attribution.utm_medium) params.set('utm_medium', attribution.utm_medium);
  return `/request-service?${params.toString()}`;
}
