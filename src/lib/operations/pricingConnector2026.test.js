import {
  connectRequestToPricing,
  RESOLVER_CHANNEL_BY_OPERATIONS_CHANNEL,
} from './pricingConnector2026.js';
import {
  buildEstimatePricingSnapshot,
  hydrateEstimateIntakeAnswers,
} from './estimatePricingSnapshot2026.js';

describe('DDOS pricing connector', () => {
  test('preserves B2B-APT while resolving through the shared B2B pricing boundary', () => {
    const result = connectRequestToPricing({
      channelType: 'B2B_APT',
      serviceId: '02-TO1',
    });

    expect(RESOLVER_CHANNEL_BY_OPERATIONS_CHANNEL.B2B_APT).toBe('B2B');
    expect(result.resolvedChannel).toBe('B2B_APT');
    expect(result.resolverChannel).toBe('B2B');
    expect(result.pricingStatus).toBe('PRICING_UNDEFINED');
    expect(result.baseAmount).toBeNull();
  });

  test('resolves an authorized B2C catalog offer without applying B2B rules', () => {
    const result = connectRequestToPricing({
      channelType: 'B2C',
      serviceId: '01-NOT',
    });

    expect(result.pricingStatus).toBe('RESOLVED');
    expect(result.resolvedChannel).toBe('B2C');
    expect(result.resolvedOfferId).toBe('01-NOT');
    expect(typeof result.baseAmount).toBe('number');
  });

  test('does not silently downgrade an unsupported channel', () => {
    const result = connectRequestToPricing({
      channelType: 'B2G_UNKNOWN',
      serviceId: '01-NOT',
    });

    expect(result.pricingStatus).toBe('UNRESOLVED_CONTEXT');
    expect(result.reason).toBe('CHANNEL_NOT_SUPPORTED_BY_PRICING_RESOLVER');
  });

  test('requires an explicit pricing service identifier', () => {
    const result = connectRequestToPricing({ channelType: 'B2C' });

    expect(result.pricingStatus).toBe('UNRESOLVED_CONTEXT');
    expect(result.reason).toBe('CHANNEL_AND_PRICING_SERVICE_ID_REQUIRED');
  });

  test('snapshot captures the resolver result without inventing disclaimer metadata', () => {
    const snapshot = buildEstimatePricingSnapshot({
      property_details: {
        operationsRouting: { channel: 'B2C' },
        pricingServiceId: '01-NOT',
      },
    });

    expect(snapshot.pricingStatus).toBe('RESOLVED');
    expect(snapshot.resolvedChannel).toBe('B2C');
    expect(snapshot.resolvedOfferId).toBe('01-NOT');
    expect(snapshot.disclaimerId).toBeNull();
    expect(snapshot.snapshotVersion).toBe('2026.1');
    expect(snapshot.capturedAt).toEqual(expect.any(String));
  });

  test('snapshot can be stored inside the existing dd_estimates intake_answers JSON boundary', () => {
    const snapshot = {
      snapshotVersion: '2026.1',
      pricingStatus: 'RESOLVED',
      resolvedChannel: 'B2C',
      resolvedOfferId: '01-NOT',
      baseAmount: 10,
    };

    expect(hydrateEstimateIntakeAnswers({ existingField: true }, snapshot)).toEqual({
      existingField: true,
      pricingSnapshot: snapshot,
    });
  });
});
