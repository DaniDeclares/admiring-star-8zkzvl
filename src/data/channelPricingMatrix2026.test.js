import {
  CHANNELS,
} from './masterCatalog2026.js';
import {
  channelPricingMatrix,
  getChannelPricingRecord,
  getPublicPricePresentation,
} from './channelPricingMatrix2026.js';

test('every catalog/channel combination has a pricing treatment', () => {
  expect(channelPricingMatrix.length).toBeGreaterThan(0);
  for (const record of channelPricingMatrix) {
    expect(record.serviceId).toBeTruthy();
    expect(record.channel).toBeTruthy();
    expect(record.pricingModel).toBeTruthy();
  }
});

test('government pricing is never exposed as a numeric public amount', () => {
  const governmentRecords = channelPricingMatrix.filter(
    (record) => record.channel === CHANNELS.GOVERNMENT_B2G
  );

  for (const record of governmentRecords) {
    const presentation = getPublicPricePresentation(record.serviceId, record.channel);
    expect(presentation.amount).toBeNull();
    expect(presentation.quoteRequired).toBe(true);
    expect(presentation.label).toBe('Contract / Solicitation Pricing');
  }
});

test('B2B public presentation does not inherit B2C retail price', () => {
  const record = channelPricingMatrix.find(
    (item) => item.channel === CHANNELS.BUSINESS_B2B
  );
  expect(record).toBeTruthy();

  const presentation = getPublicPricePresentation(
    record.serviceId,
    CHANNELS.BUSINESS_B2B
  );
  expect(presentation.amount).toBeNull();
  expect(presentation.quoteRequired).toBe(true);
});

test('B2C keeps its retail price when one exists', () => {
  const record = channelPricingMatrix.find(
    (item) =>
      item.channel === CHANNELS.DIRECT_B2C &&
      typeof item.workingBaselineRate === 'number'
  );

  if (!record) return;

  const presentation = getPublicPricePresentation(
    record.serviceId,
    CHANNELS.DIRECT_B2C
  );
  expect(presentation.amount).toBe(record.workingBaselineRate);
  expect(presentation.quoteRequired).toBe(false);
});

test('lookup remains canonical by serviceId plus channel', () => {
  const first = channelPricingMatrix[0];
  expect(getChannelPricingRecord(first.serviceId, first.channel)).toEqual(first);
});
