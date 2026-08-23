// DANI DECLARES LLC — CHANNEL ARCHITECTURE GATE
// Numeric channel records are intentionally empty pending company-wide catalog reconciliation.
// B2C/B2B/B2B2C/B2G are commercial-model classifications, NOT replacements for CH01–CH06.
// See docs/catalog-audit-2026-08-23.md and docs/legacy-pricing-quarantine-2026-08-23.md.

export const CHANNELS = Object.freeze({
  CH01: 'CH01',
  CH02: 'CH02',
  CH03: 'CH03',
  CH04: 'CH04',
  CH05: 'CH05',
  CH06: 'CH06',
});

export const CHANNEL_DEFINITIONS = Object.freeze({
  CH01: { id: 'CH01', name: 'Property Residents', pricingStatus: 'PENDING_RECONCILIATION', residentBenefit: '15% on qualifying canonical services only' },
  CH02: { id: 'CH02', name: 'Direct / Regular Residents', pricingStatus: 'PENDING_RECONCILIATION', residentBenefit: 'NONE' },
  CH03: { id: 'CH03', name: 'Property Management', pricingStatus: 'PENDING_RECONCILIATION', residentBenefit: 'NONE' },
  CH04: { id: 'CH04', name: 'Real Estate', pricingStatus: 'PENDING_RECONCILIATION', residentBenefit: 'NONE' },
  CH05: { id: 'CH05', name: 'Business / Commercial', pricingStatus: 'PENDING_RECONCILIATION', residentBenefit: 'NONE' },
  CH06: { id: 'CH06', name: 'Government / Institutional', pricingStatus: 'CONTRACT_OR_SOLICITATION', residentBenefit: 'NONE' },
});

export const channelPricingMatrix = Object.freeze([]);
export const getChannelPricingRecord = () => null;
export const getChannelPricingRecords = () => [];
export const getPublicPricePresentation = () => null;
export default channelPricingMatrix;
