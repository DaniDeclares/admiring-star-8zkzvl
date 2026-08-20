import { persistEstimatePricingSnapshot } from './estimatePricingPersistence2026.js';

describe('estimate pricing snapshot persistence', () => {
  test('persists resolved pricing without recalculating downstream amounts', async () => {
    const create = jest.fn(async ({ data }) => data);
    const prisma = { dd_estimates: { create } };

    const result = await persistEstimatePricingSnapshot({
      prisma,
      divisionSlug: 'b2c-resident-concierge',
      serviceRequest: {
        id: 'request-1',
        leadId: 'lead-1',
        location_address: '123 Main St',
        timeline: 'ASAP',
        request_details: 'Notary request',
        property_details: {
          operationsRouting: { channel: 'B2C' },
          pricingServiceId: '01-NOT',
        },
        intake_answers: { source: 'web' },
        lead: {
          full_name: 'Test Client',
          phone: '555-0100',
          email: 'test@example.com',
          organization_name: null,
        },
      },
    });

    expect(create).toHaveBeenCalledTimes(1);
    expect(result.estimate_status).toBe('pricing_resolved');
    expect(result.base_subtotal).toBe(result.estimated_total);
    expect(result.addon_subtotal).toBe(0);
    expect(result.tax_amount).toBe(0);
    expect(result.intake_answers.pricingSnapshot.resolvedOfferId).toBe('01-NOT');
  });

  test('keeps unresolved pricing in review instead of inventing a number', async () => {
    const create = jest.fn(async ({ data }) => data);
    const prisma = { dd_estimates: { create } };

    const result = await persistEstimatePricingSnapshot({
      prisma,
      divisionSlug: 'b2b-property-operations',
      serviceRequest: {
        id: 'request-2',
        property_details: {
          operationsRouting: { channel: 'B2B_APT' },
          pricingServiceId: '02-TO1',
        },
      },
    });

    expect(result.estimate_status).toBe('pricing_review');
    expect(result.base_subtotal).toBe(0);
    expect(result.estimated_total).toBe(0);
    expect(result.intake_answers.pricingSnapshot.pricingStatus).toBe('PRICING_UNDEFINED');
  });
});
