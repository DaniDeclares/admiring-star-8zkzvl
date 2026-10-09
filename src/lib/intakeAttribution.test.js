import { sanitizeMarketingAttribution } from './intakeAttribution';

describe('intake campaign attribution', () => {
  test('keeps only known tag fields, trimmed and capped', () => {
    expect(sanitizeMarketingAttribution({ utm_source: ' facebook ', utm_campaign: 'oct-six-offers', campaign_audience: 'hire-dani', evil: 'x', utm_content: 'a'.repeat(300) }))
      .toEqual({ utm_source: 'facebook', utm_campaign: 'oct-six-offers', campaign_audience: 'hire-dani', utm_content: 'a'.repeat(120) });
  });
  test('drops markup and non-string values; returns null when nothing remains', () => {
    expect(sanitizeMarketingAttribution({ utm_source: '<script>x</script>' })).toEqual({ utm_source: 'scriptx/script' });
    expect(sanitizeMarketingAttribution({ utm_source: 5, utm_medium: undefined })).toBeNull();
    expect(sanitizeMarketingAttribution(null)).toBeNull();
    expect(sanitizeMarketingAttribution(['utm_source'])).toBeNull();
  });
});
