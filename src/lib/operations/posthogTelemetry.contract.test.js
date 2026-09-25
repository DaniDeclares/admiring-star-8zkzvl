const ORIGINAL_ENV = process.env;

describe('PostHog analytics configuration contract', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });
  afterAll(() => { process.env = ORIGINAL_ENV; });

  test('analytics stays disabled when the public project key is absent', async () => {
    delete process.env.REACT_APP_POSTHOG_KEY;
    const mod = await import('../../../lib/posthogAnalytics.js');
    expect(mod.isAnalyticsEnabled()).toBe(false);
  });

  test('analytics is enabled only when an explicit project key is supplied', async () => {
    process.env.REACT_APP_POSTHOG_KEY = 'phc_test_public_key';
    const mod = await import('../../../lib/posthogAnalytics.js');
    expect(mod.isAnalyticsEnabled()).toBe(true);
  });
});
