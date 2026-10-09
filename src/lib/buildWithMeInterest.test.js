import { CONSENT_TEXT, NEXT_STEPS, PARTICIPATION_INTERESTS, hireDaniLink, normalizeInterestSubmission, providerApplicationLink } from './buildWithMeInterest';

const valid = () => ({
  name: '  Jordan Maker ',
  email: 'Jordan@Example.com',
  phone: '(404) 555-0100',
  participationInterest: 'MAKER_CREATOR',
  interestAreas: ['CREATIVE_PRINT', 'CREATIVE_PRINT', 'MARKETING_CONTENT'],
  skillsAndEquipment: 'Heat press, Cricut, 3 years of custom shirts',
  locationArea: 'Decatur, GA',
  contactConsent: true,
  attribution: { utm_source: 'instagram', utm_campaign: 'build-with-me', landing_path: '/build-with-me' },
});

describe('Build With Me interest submissions', () => {
  test('normalizes a valid submission into an interest-only record', () => {
    const result = normalizeInterestSubmission(valid(), { now: new Date('2026-10-10T15:00:00Z') });
    expect(result.ok).toBe(true);
    expect(result.record).toEqual(expect.objectContaining({
      name: 'Jordan Maker',
      email: 'jordan@example.com',
      participation_interest: 'MAKER_CREATOR',
      interest_area: 'Maker or creator',
      interest_areas: ['CREATIVE_PRINT', 'MARKETING_CONTENT'],
      source: 'BUILD_WITH_ME',
      campaign_code: 'build-with-me',
      contact_consent: true,
      consent_at: '2026-10-10T15:00:00.000Z',
      consent_text: CONSENT_TEXT,
    }));
    expect(result.record.utm).toEqual({ utm_source: 'instagram', utm_campaign: 'build-with-me' });
  });

  test('requires explicit consent, a participation interest and what they bring', () => {
    const body = valid();
    body.contactConsent = 'yes';
    delete body.participationInterest;
    body.skillsAndEquipment = '   ';
    expect(normalizeInterestSubmission(body).errors).toEqual(expect.arrayContaining(['CONSENT_REQUIRED', 'PARTICIPATION_INTEREST_REQUIRED', 'SKILLS_REQUIRED']));
  });

  test('rejects unknown categories, bad email and bad phone', () => {
    const body = { ...valid(), email: 'nope', phone: 'call me', interestAreas: ['ROOFING_LICENSED'] };
    expect(normalizeInterestSubmission(body).errors).toEqual(expect.arrayContaining(['EMAIL_INVALID', 'PHONE_INVALID', 'INTEREST_AREA_INVALID']));
  });

  test('non-campaign traffic keeps the existing partner-network source', () => {
    const body = { ...valid(), attribution: {} };
    const result = normalizeInterestSubmission(body);
    expect(result.record.source).toBe('WEBSITE_PARTNER_NETWORK');
    expect(result.record.campaign_code).toBeNull();
  });

  test('strips control characters and caps long text', () => {
    const body = { ...valid(), skillsAndEquipment: 'a\u0000b'.padEnd(5000, 'x') };
    const result = normalizeInterestSubmission(body);
    expect(result.record.skills_and_equipment.length).toBe(1500);
    expect(result.record.skills_and_equipment.startsWith('a b')).toBe(true);
  });

  test('next step links into the existing provider application with attribution', () => {
    expect(providerApplicationLink({ campaign_code: 'build-with-me', utm_source: 'instagram' }))
      .toBe('/providers?utm_campaign=build-with-me&utm_source=instagram&audience=provider');
  });

  test('every participation type has an honest next step', () => {
    expect(Object.keys(NEXT_STEPS).sort()).toEqual(Object.keys(PARTICIPATION_INTERESTS).sort());
    for (const text of Object.values(NEXT_STEPS)) expect(/guarantee|you will be hired|earn \$/i.test(text)).toBe(false);
  });

  test('Hire DANI enters the existing service request intake on CH04-F02, never the provider application', () => {
    const link = hireDaniLink({ campaign_code: 'build-with-me', utm_source: 'facebook' });
    expect(link.startsWith('/request-service?')).toBe(true);
    const q = new URLSearchParams(link.split('?')[1]);
    expect(q.get('channelType')).toBe('B2B');
    expect(q.get('frontDoor')).toBe('CH04-F02');
    expect(q.get('audience')).toBe('hire-dani');
    expect(q.get('utm_source')).toBe('facebook');
    expect(link.includes('/providers')).toBe(false);
  });
});
