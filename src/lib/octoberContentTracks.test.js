import { describe, it, expect } from 'vitest';
import { OCTOBER_CONTENT_TRACKS, octoberCampaignLink, octoberTrackCanPublish } from './octoberContentTracks.js';

describe('October content tracks', () => {
  it('keeps three promotional tracks separate from the daily series', () => {
    expect(Object.keys(OCTOBER_CONTENT_TRACKS)).toHaveLength(4);
    expect(OCTOBER_CONTENT_TRACKS.DAILY_MILLION_DOLLAR_OPERATION.separateFromPromotionalPosts).toBe(true);
  });
  it('routes providers to interest and customers to business intake', () => {
    expect(octoberCampaignLink('BUILD_WITH_DANI')).toContain('/build-with-me?');
    const customer = octoberCampaignLink('LET_DANI_BUILD_YOU');
    expect(customer).toContain('/request-service?');
    expect(customer).toContain('audience=hire-dani');
    expect(customer).not.toContain('/providers');
    expect(customer).toContain('utm_campaign=let-dani-build-you');
  });
  it('does not authorize an unfinished six-offer post', () => {
    expect(octoberTrackCanPublish('THREE_SERVICES_THREE_PRODUCTS')).toBe(false);
    expect(OCTOBER_CONTENT_TRACKS.THREE_SERVICES_THREE_PRODUCTS.offers.digital.map(p => p.priceUsd)).toEqual([19, 15, 9]);
    expect(OCTOBER_CONTENT_TRACKS.THREE_SERVICES_THREE_PRODUCTS.offers.services).toEqual([]);
  });
  it('does not promise provider employment or income', () => {
    expect(OCTOBER_CONTENT_TRACKS.BUILD_WITH_DANI.paidWorkGuaranteed).toBe(false);
    expect(OCTOBER_CONTENT_TRACKS.BUILD_WITH_DANI.requiresProviderApproval).toBe(true);
  });
});
