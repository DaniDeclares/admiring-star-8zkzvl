// Public Holiday 2026 community expressions of interest. This is NOT a service
// booking, cash donation, provider approval, benefit determination or referral award.
export const HOLIDAY_INTEREST_ROLES = Object.freeze({
  FAMILY_SUPPORT: 'A family seeking support',
  COMMUNITY_ORG: 'An organization identifying needs or offering connections',
  SPONSOR: 'A business or individual offering resources',
  VOLUNTEER: 'Someone offering time or professional skills',
});
export const HOLIDAY_INTEREST_AREAS = Object.freeze({
  HOUSING_TRANSITION: 'Housing transition or move-in essentials',
  HOUSEHOLD_ITEMS: 'Household supplies and practical necessities',
  MOVING_LOGISTICS: 'Moving, transportation or logistics',
  SERVICES: 'Professional services or volunteer assistance',
  REFERRALS: 'Organization referrals and coordination',
  OTHER: 'Other practical support',
});
export const HOLIDAY_CONTACT_CONSENT = 'I agree that DANI DECLARES may contact me about this Holiday 2026 community inquiry. Submitting does not guarantee assistance, partnership, or work. My information is not permission for marketing.';
const clean = (v, len) => Array.from(String(v ?? ''), ch => { const code = ch.charCodeAt(0); return code < 32 || code === 127 ? ' ' : ch; }).join('').replace(/\s+/g, ' ').trim().slice(0, len);
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
export function normalizeHolidayInterest(body = {}, now = new Date()) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, errors: ['INVALID_BODY'] };
  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const city = clean(body.city, 100);
  const role = String(body.role || '');
  const area = String(body.area || '');
  const note = clean(body.note, 600);
  const errors = [];
  if (!name) errors.push('NAME_REQUIRED');
  if (!EMAIL_RE.test(email)) errors.push('EMAIL_INVALID');
  if (phone && !/^[0-9+().\-\s]{7,40}$/.test(phone)) errors.push('PHONE_INVALID');
  if (!city) errors.push('CITY_REQUIRED');
  if (!HOLIDAY_INTEREST_ROLES[role]) errors.push('ROLE_INVALID');
  if (!HOLIDAY_INTEREST_AREAS[area]) errors.push('AREA_INVALID');
  if (body.contactConsent !== true) errors.push('CONSENT_REQUIRED');
  const attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = clean(body.attribution?.[key], 120);
    if (value) attribution[key] = value;
  }
  attribution.landing_path = '/holiday/community';
  if (errors.length) return { ok: false, errors };
  return { ok: true, errors: [], record: {
    name, email, phone: phone || null, city, role, area,
    note: note || null, attribution, status: 'NEW',
    contact_consent: true, consent_at: now.toISOString(),
    consent_text: HOLIDAY_CONTACT_CONSENT,
    source: 'WEBSITE_HOLIDAY_2026',
  }};
}
