import {
  RELATIONSHIP_ROLES,
  ENGAGEMENT_POSTURES,
  MARKET_FITS,
  CLASSIFICATION_PRESETS,
} from './relationshipClassification2026.js';

describe('relationshipClassification2026', () => {
  test('defines the closed set of relationship roles', () => {
    expect(RELATIONSHIP_ROLES).toContain('direct_buyer_candidate');
    expect(RELATIONSHIP_ROLES).toContain('strategic_partner');
    expect(RELATIONSHIP_ROLES).toContain('referral_source');
  });

  test('defines engagement postures that do not auto-authorize outreach', () => {
    expect(ENGAGEMENT_POSTURES).toContain('research_before_outreach');
    expect(ENGAGEMENT_POSTURES).toContain('relationship_first');
    expect(ENGAGEMENT_POSTURES).toContain('nurture');
    expect(ENGAGEMENT_POSTURES).toContain('no_outreach');
  });

  test('presets match the researched feed examples', () => {
    expect(CLASSIFICATION_PRESETS.commercialStrategicAtlanta.relationshipRole).toBe('direct_buyer_candidate');
    expect(CLASSIFICATION_PRESETS.contractorEcosystemPartner.relationshipRole).toBe('strategic_partner');
    expect(CLASSIFICATION_PRESETS.outOfMarketReferralSource.marketFit).toBe('out_of_market');
  });

  test('market fit is a closed set', () => {
    expect(MARKET_FITS).toEqual(['in_market', 'adjacent', 'out_of_market']);
  });
});
