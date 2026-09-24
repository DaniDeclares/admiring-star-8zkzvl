import { describe, expect, it } from 'vitest';
import { buildPricingProposal, summarizeMarketEvidence } from './pricingResearch2026.js';

describe('pricingResearch2026', () => {
  it('weights direct evidence above partial evidence', () => {
    const result = summarizeMarketEvidence([
      { verification_status:'VERIFIED', comparability:'DIRECT', observed_price_low_cents:20000, observed_price_high_cents:30000 },
      { verification_status:'VERIFIED', comparability:'PARTIAL', observed_price_low_cents:10000, observed_price_high_cents:10000 }
    ]);
    expect(result.count).toBe(2);
    expect(result.weightedMarketCents).toBeGreaterThan(10000);
    expect(result.weightedMarketCents).toBeLessThan(25000);
    expect(result.confidence).toBe('MEDIUM');
  });

  it('does not use context-only evidence to set a proposal', () => {
    const proposal = buildPricingProposal({
      currentPriceCents:14000,
      minimumViablePriceCents:12000,
      evidence:[{ verification_status:'VERIFIED', comparability:'CONTEXT_ONLY', observed_price_low_cents:15000 }]
    });
    expect(proposal.proposedPriceCents).toBe(14000);
    expect(proposal.status).toBe('RESEARCHING');
  });

  it('never proposes below the economics floor', () => {
    const proposal = buildPricingProposal({
      currentPriceCents:27500,
      minimumViablePriceCents:26000,
      evidence:[
        { verification_status:'VERIFIED', comparability:'DIRECT', observed_price_low_cents:20000, observed_price_high_cents:24000 },
        { verification_status:'VERIFIED', comparability:'DIRECT', observed_price_low_cents:22000, observed_price_high_cents:24000 },
        { verification_status:'SINGLE_SOURCE', comparability:'DIRECT', observed_price_low_cents:23000, observed_price_high_cents:25000 }
      ]
    });
    expect(proposal.proposedPriceCents).toBe(26000);
    expect(proposal.status).toBe('REVIEW_READY');
    expect(proposal.market.confidence).toBe('HIGH');
  });
});
