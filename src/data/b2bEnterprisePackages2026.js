// DANI DECLARES LLC — B2B Enterprise Package Layer
// PR B extension: portfolio, enterprise, volume-turn, and institutional package offers.
// These are commercial package records, not consumer SKUs.
// Unless explicitly marked LOCKED, they remain PROPOSED or CUSTOM and must not become automatic checkout prices.
// B2C resident discounts never apply to these offers.

import { PRICING_STATUS, PRICING_CHANNELS, PRICING_UNITS } from './canonicalPricing2026';

export const B2B_ENTERPRISE_PACKAGE_STATUS = {
  LOCKED: PRICING_STATUS.LOCKED,
  PROPOSED: PRICING_STATUS.PROPOSED,
  UNDEFINED_PENDING: PRICING_STATUS.UNDEFINED,
  CUSTOM_QUOTE: PRICING_STATUS.CUSTOM,
};

const B2B = PRICING_CHANNELS.B2B;
const B2G = PRICING_CHANNELS.B2G;

export const B2B_ENTERPRISE_PACKAGES_2026 = {
  PORTFOLIO_OPERATIONS: [{
    offerId: 'B2B-ENT-PORTFOLIO-OPS', capabilityId: 'PORTFOLIO_PROPERTY_OPERATIONS', channel: B2B, audience: 'B2B-APT',
    name: 'Portfolio Property Management & Operations Retainer', pricingModel: 'MONTHLY_RETAINER', baseRate: null,
    priceRange: { min: 5000, max: 10000, currency: 'USD', period: 'month' }, unit: PRICING_UNITS.PER_MONTH,
    status: B2B_ENTERPRISE_PACKAGE_STATUS.PROPOSED,
    scope: 'Multi-property operational coordination, vendor oversight, routine turn coordination, and resident support scaled to portfolio size.',
    disclaimerIds: ['RETAINER', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [],
  }],
  REAL_ESTATE_EXECUTIVE: [{
    offerId: 'B2B-ENT-RE-TRANSACTION-SUITE', capabilityId: 'REAL_ESTATE_TRANSACTION_MANAGEMENT_SUITE', channel: B2B, audience: 'B2B-RE',
    name: 'Full-Scale Real Estate & Transaction Management Suite', pricingModel: 'MONTHLY_RETAINER', baseRate: 5000,
    priceRange: { min: 5000, max: 5000, currency: 'USD', period: 'month' }, unit: PRICING_UNITS.PER_MONTH,
    status: B2B_ENTERPRISE_PACKAGE_STATUS.PROPOSED,
    scope: 'Executive listing coordination, open-house dispatch, transaction processing, marketing asset management, and office operations.',
    disclaimerIds: ['RETAINER', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [],
  }],
  VOLUME_TURNOVER: [{
    offerId: 'B2B-ENT-VOLUME-DEEP-TURN', capabilityId: 'MULTI_UNIT_DEEP_TURNOVER_RESTORATION', channel: B2B, audience: 'B2B-APT',
    name: 'Multi-Unit Property Deep Turnover & Asset Restoration Program', pricingModel: 'SOW_CONTRACT', baseRate: null,
    priceRange: { min: 4000, max: 8500, currency: 'USD', suffix: '+' }, unit: PRICING_UNITS.CUSTOM_QUOTE,
    status: B2B_ENTERPRISE_PACKAGE_STATUS.PROPOSED, quantityRule: { minimumUnits: 10 },
    scope: 'Bulk apartment turns of 10+ units, heavy remediation, specialized repairs, and move-in-ready staging.',
    disclaimerIds: ['CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [],
  }],
  FACILITY_ENTERPRISE: [{
    offerId: 'B2B-ENT-FACILITY-SUPPORT', capabilityId: 'ENTERPRISE_FACILITY_SUPPORT_MAINTENANCE', channel: B2B, audience: 'B2B-APT',
    name: 'Enterprise Facility Support & Maintenance Contract', pricingModel: 'MONTHLY_RETAINER', baseRate: null,
    priceRange: { min: 3500, max: 7500, currency: 'USD', period: 'month', plus: 'materials' }, unit: PRICING_UNITS.PER_MONTH,
    status: B2B_ENTERPRISE_PACKAGE_STATUS.PROPOSED,
    scope: 'Scheduled commercial maintenance, ongoing facility upkeep, emergency dispatch routing, and priority turn execution.',
    disclaimerIds: ['RETAINER', 'CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [],
  }],
  GOVERNMENT_INSTITUTIONAL: [{
    offerId: 'B2G-INSTITUTIONAL-TASK-ORDER-10K', capabilityId: 'GOVERNMENT_INSTITUTIONAL_TASK_ORDER', channel: B2G, audience: 'B2G',
    name: 'Government / Institutional Task Order', pricingModel: 'SOW_CONTRACT', baseRate: null,
    priceRange: { max: 10000, currency: 'USD', suffix: '+' }, unit: PRICING_UNITS.CUSTOM_QUOTE,
    status: B2B_ENTERPRISE_PACKAGE_STATUS.CUSTOM_QUOTE,
    scope: 'Federal, state, municipal, airport, or institutional facilities support, custodial execution, and multi-location logistics under formal solicitation/SOW requirements.',
    disclaimerIds: ['GOVERNMENT_PROCUREMENT', 'PROCUREMENT_CLASSIFICATION', 'CUSTOM_SCOPE'], modifierIds: [],
  }],
};

export const getAllB2BEnterprisePackages = () => Object.values(B2B_ENTERPRISE_PACKAGES_2026).flat();
export const getB2BEnterprisePackage = (offerId) => getAllB2BEnterprisePackages().find((offer) => offer.offerId === offerId) || null;
export const getB2BEnterprisePackagesByChannel = (channel) => getAllB2BEnterprisePackages().filter((offer) => offer.channel === channel);
export const isEnterprisePackage = (offerId) => Boolean(getB2BEnterprisePackage(offerId));
