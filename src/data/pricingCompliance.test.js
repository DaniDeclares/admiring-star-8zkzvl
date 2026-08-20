import fs from 'fs';
import path from 'path';
import { resolveB2BOffer } from './b2bPricingResolver2026';
import { PRICING_CHANNELS } from './canonicalPricing2026';
import { B2B_SUBCHANNELS } from './b2bChannelPolicy2026';

const LIVE_PRICING_SURFACES = [
  'src/pages/RealEstatePage.jsx',
  'src/pages/BusinessSolutionsPage.jsx',
  'src/pages/MembershipPage.jsx',
  'src/pages/ShopPage.jsx',
];

const readRepoFile = (relativePath) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('pricing compliance guardrails', () => {
  it('keeps migrated customer-facing pricing surfaces free of literal dollar amounts', () => {
    const literalPricePattern = /\$\s*\d/;

    LIVE_PRICING_SURFACES.forEach((relativePath) => {
      const source = readRepoFile(relativePath);
      expect(source).not.toMatch(literalPricePattern);
    });
  });

  it('does not resolve B2G work into a fabricated numeric checkout price', () => {
    const result = resolveB2BOffer('B2G-INSTITUTIONAL-TASK-ORDER-10K', {
      channel: PRICING_CHANNELS.B2G,
      commercialSubchannel: B2B_SUBCHANNELS.GOVERNMENT,
    });

    expect(result.amount).toBeNull();
    expect(['CUSTOM', 'UNDEFINED']).toContain(result.status);
  });

  it('keeps the canonical B2B property-turn prices distinct from B2C pricing', () => {
    const standard = resolveB2BOffer('B2B-APT-TURN-STANDARD', {
      channel: PRICING_CHANNELS.B2B,
      commercialSubchannel: B2B_SUBCHANNELS.APT,
    });
    const deep = resolveB2BOffer('B2B-APT-TURN-DEEP', {
      channel: PRICING_CHANNELS.B2B,
      commercialSubchannel: B2B_SUBCHANNELS.APT,
    });

    expect(standard.amount).toBe(350);
    expect(deep.amount).toBe(450);
    expect(standard.disclaimers.map((d) => d.id)).toContain('B2B_NO_RESIDENT_DISCOUNT');
    expect(deep.disclaimers.map((d) => d.id)).toContain('B2B_NO_RESIDENT_DISCOUNT');
  });
});
