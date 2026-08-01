import { calculateQuote, calculateInvestmentQuote, SERVICE_RELATIONSHIPS } from '../pricingEngine';
import { getSuggestedAddOns } from '../bundleEngine';
import { generateProposalTemplate } from '../proposalEngine';
import { RETAINER_PLANS_2026 } from '../../data/retainerPlansData';

describe('pricing engine', () => {
  it('calculates a property quote with market-based pricing', () => {
    const quote = calculateQuote('PO-101', {
      market: 'ATL',
      squareFeet: 1200,
      unitCount: 1,
      laborHours: 6,
      mileage: 20,
      addOns: ['carpet']
    });

    expect(quote.quoteType).toBe('property');
    expect(quote.subtotal).toBeGreaterThan(0);
    expect(quote.market).toBe('ATL');
    expect(quote.approvalRequired).toBe(false);
  });

  it('flags approval for large quotes or heavy discounts', () => {
    const quote = calculateQuote('EV-401', {
      market: 'CHARLOTTE',
      guestCount: 250,
      hours: 10,
      discountPercent: 0.25
    });

    expect(quote.approvalRequired).toBe(true);
    expect(quote.approvalReason).toContain('discount');
  });
});

describe('bundle engine', () => {
  it('recommends add-ons for property turnovers', () => {
    const addOns = getSuggestedAddOns('PO-101', { unitCount: 1 });
    expect(addOns).toEqual(expect.arrayContaining(['photo-documentation', 'key-delivery']));
  });
});

describe('proposal engine', () => {
  it('builds a proposal template for apartment communities', () => {
    const proposal = generateProposalTemplate('Apartment Communities', 'PO-101', {
      total: 850,
      serviceName: 'Apartment Turnover Reset'
    });

    expect(proposal.subject).toContain('Apartment Communities');
    expect(proposal.body).toContain('Apartment Turnover Reset');
  });
});

describe('investment and membership pricing', () => {
  it('calculates an investment-based quote with margin controls', () => {
    const quote = calculateInvestmentQuote('PO-101', {
      beds: 2,
      baths: 2,
      squareFeet: 1400,
      urgency: 'standard',
      volume: 'monthly',
      membershipTier: 'silver'
    });

    expect(quote.investment).toBeGreaterThan(0);
    expect(quote.pricingTier).toBe('standard');
    expect(quote.membershipDiscount).toBeGreaterThan(0);
  });

  it('exposes service relationships and membership plans', () => {
    expect(SERVICE_RELATIONSHIPS['PO-101'].recommendedAddOns).toEqual(expect.arrayContaining(['PO-115', 'ND-101']));
    expect(RETAINER_PLANS_2026[0].planId).toBe('ret-multi-family-5');
  });
});
