import { calculateQuote } from '../pricingEngine';
import { getSuggestedAddOns } from '../bundleEngine';
import { generateProposalTemplate } from '../proposalEngine';

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
