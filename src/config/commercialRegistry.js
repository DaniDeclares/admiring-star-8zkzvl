// DANI DECLARES LLC — MASTER COMMERCIAL RECONCILIATION REGISTRY
// Canonical customer-facing commercial intent for the audited offers supplied
// in the Master Commercial Reconciliation Matrix.
//
// IMPORTANT:
// - DANI DECLARES owns customer-facing pricing and marketing decisions.
// - Provider lanes are fulfillment boundaries, not pricing authorities.
// - NAWFside may fulfill approved work under its executed agreement/work orders.
// - Provider payout is never inferred from public customer price.
// - Stripe is execution/reconciliation only; it is not pricing authority.
// - Historical entries remain addressable but are never checkout-eligible.

export const CHANNEL_TYPES = Object.freeze({
  B2C_RETAIL: 'B2C_RETAIL',
  B2B_VOLUME: 'B2B_VOLUME',
  B2B2C_RESIDENT_PERK: 'B2B2C_RESIDENT_PERK',
  B2G_PROCUREMENT: 'B2G_PROCUREMENT',
});

export const PRICE_MODELS = Object.freeze({
  FIXED_FLAT: 'FIXED_FLAT',
  VARIABLE_SCALAR: 'VARIABLE_SCALAR',
  RETAINER_SUITE: 'RETAINER_SUITE',
  BESPOKE_SOW: 'BESPOKE_SOW',
});

export const STRIPE_MODES = Object.freeze({
  DIRECT_LINK_MATCH: 'DIRECT_LINK_MATCH',
  FROZEN_ESTIMATE_CHECKOUT: 'FROZEN_ESTIMATE_CHECKOUT',
  MANUAL_INVOICE: 'MANUAL_INVOICE',
});

export const PROVIDER_LANES = Object.freeze({
  NAWFSIDE: 'NAWFSIDE',
  CASS: 'CASS',
  STAFF_DIRECT: 'STAFF_DIRECT',
  UNASSIGNED: 'UNASSIGNED',
});

export const COMMERCIAL_STATUS = Object.freeze({
  CANONICAL_ACTIVE: 'CANONICAL_ACTIVE',
  DEPRECATED_HISTORICAL: 'DEPRECATED_HISTORICAL',
});

const active = (serviceId, name, channel, model, baseCustomerPrice, residentDiscountEligible, allowedModifiers, stripeExecutionMode, providerIsolationLane, sourceDocument) => ({
  serviceId,
  name,
  channel,
  model,
  baseCustomerPrice,
  residentDiscountEligible,
  allowedModifiers,
  stripeExecutionMode,
  providerIsolationLane,
  status: COMMERCIAL_STATUS.CANONICAL_ACTIVE,
  sourceDocument,
});

export const masterCommercialRegistry = Object.freeze({
  // B2C — Residential cleaning / household care
  'B2C-CLEAN-STD-1B1B': active('B2C-CLEAN-STD-1B1B', 'Resident Refresh Standard Clean (1BR/1BA)', 'B2C_RETAIL', 'FIXED_FLAT', 100, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-STD-2B2B': active('B2C-CLEAN-STD-2B2B', 'Resident Refresh Standard Clean (2BR/2BA)', 'B2C_RETAIL', 'FIXED_FLAT', 150, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-STD-3B2B': active('B2C-CLEAN-STD-3B2B', 'Resident Refresh Standard Clean (3BR/2BA)', 'B2C_RETAIL', 'FIXED_FLAT', 250, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-STD-4B3B': active('B2C-CLEAN-STD-4B3B', 'Resident Refresh Standard Clean (4BR/3BA)', 'B2C_RETAIL', 'FIXED_FLAT', 375, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-DEEP-1B1B': active('B2C-CLEAN-DEEP-1B1B', 'Deep Structural Reset (1BR/1BA)', 'B2C_RETAIL', 'FIXED_FLAT', 275, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-DEEP-2B2B': active('B2C-CLEAN-DEEP-2B2B', 'Deep Structural Reset (2BR/2BA)', 'B2C_RETAIL', 'FIXED_FLAT', 325, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-DEEP-3B2B': active('B2C-CLEAN-DEEP-3B2B', 'Deep Structural Reset (3BR/2BA)', 'B2C_RETAIL', 'FIXED_FLAT', 425, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-DEEP-4B3B': active('B2C-CLEAN-DEEP-4B3B', 'Deep Structural Reset (4BR/3BA)', 'B2C_RETAIL', 'FIXED_FLAT', 550, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-TURN-1B1B': active('B2C-CLEAN-TURN-1B1B', 'Deposit Security Move-Out Turn (1BR/1BA)', 'B2C_RETAIL', 'FIXED_FLAT', 330, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-TURN-2B2B': active('B2C-CLEAN-TURN-2B2B', 'Deposit Security Move-Out Turn (2BR/2BA)', 'B2C_RETAIL', 'FIXED_FLAT', 380, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-TURN-3B2B': active('B2C-CLEAN-TURN-3B2B', 'Deposit Security Move-Out Turn (3BR/2BA)', 'B2C_RETAIL', 'FIXED_FLAT', 480, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-CLEAN-TURN-4B3B': active('B2C-CLEAN-TURN-4B3B', 'Deposit Security Move-Out Turn (4BR/3BA)', 'B2C_RETAIL', 'FIXED_FLAT', 605, true, ['SVR-SOIL-T2'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-LAUNDRY-WDF': active('B2C-LAUNDRY-WDF', 'Wash/Dry/Fold', 'B2C_RETAIL', 'FIXED_FLAT', 45, true, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-LAUNDRY-LINEN': active('B2C-LAUNDRY-LINEN', 'Linen & Bedding Reset', 'B2C_RETAIL', 'FIXED_FLAT', 35, true, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-ORG-CLOSET': active('B2C-ORG-CLOSET', 'Closet Optimization — 3 Hour Minimum', 'B2C_RETAIL', 'FIXED_FLAT', 135, true, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-ORG-PANTRY': active('B2C-ORG-PANTRY', 'Pantry / Kitchen Cabinet Organization Base', 'B2C_RETAIL', 'FIXED_FLAT', 150, true, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-ORG-ESTATE': active('B2C-ORG-ESTATE', 'Estate Liquidation Baseline', 'B2C_RETAIL', 'FIXED_FLAT', 65, true, [], 'MANUAL_INVOICE', 'NAWFSIDE', '20-Page Resident Concierge Guide'),

  // B2C — Notary / notarization
  'B2C-NOTARY-LOAN': active('B2C-NOTARY-LOAN', 'Mobile Loan Signing', 'B2C_RETAIL', 'FIXED_FLAT', 150, true, [], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),
  'B2C-NOTARY-APOSTILLE': active('B2C-NOTARY-APOSTILLE', 'Apostille Processing', 'B2C_RETAIL', 'FIXED_FLAT', 175, true, [], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),
  'B2C-NOTARY-POA': active('B2C-NOTARY-POA', 'POA / Healthcare Proxy Witness Base', 'B2C_RETAIL', 'FIXED_FLAT', 35, true, ['TRAVEL-PREMIUM'], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),
  'B2C-NOTARY-EMERGENCY': active('B2C-NOTARY-EMERGENCY', 'Emergency Notarization Priority', 'B2C_RETAIL', 'FIXED_FLAT', 95, true, [], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),
  'B2C-NOTARY-CUSTODY': active('B2C-NOTARY-CUSTODY', 'Family Law / Custody Document Witnessing', 'B2C_RETAIL', 'FIXED_FLAT', 75, true, [], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),
  'B2C-NOTARY-TITLE': active('B2C-NOTARY-TITLE', 'Vehicle Title Signing', 'B2C_RETAIL', 'FIXED_FLAT', 50, true, [], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),
  'B2C-NOTARY-SAFE': active('B2C-NOTARY-SAFE', 'Safety-Deposit Vault Verification', 'B2C_RETAIL', 'FIXED_FLAT', 125, true, [], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),
  'B2C-NOTARY-AFFIDAVIT': active('B2C-NOTARY-AFFIDAVIT', 'School / Residency Financial Affidavit', 'B2C_RETAIL', 'FIXED_FLAT', 45, true, [], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),
  'B2C-NOTARY-WITNESS': active('B2C-NOTARY-WITNESS', 'Independent Witness Deployment Service', 'B2C_RETAIL', 'FIXED_FLAT', 50, true, [], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),

  // B2C — memberships / creative / events
  'B2C-MEMB-EXEC-1B': active('B2C-MEMB-EXEC-1B', 'Executive Home Care Membership (1BR)', 'B2C_RETAIL', 'RETAINER_SUITE', 280, true, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-MEMB-TURN-1B': active('B2C-MEMB-TURN-1B', 'Ultimate Turnkey Household Care (1BR)', 'B2C_RETAIL', 'RETAINER_SUITE', 520, true, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-MEMB-PETS-1B': active('B2C-MEMB-PETS-1B', 'Pampered Pet Household Track (1BR)', 'B2C_RETAIL', 'RETAINER_SUITE', 245, true, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-MEMB-NOMD-1B': active('B2C-MEMB-NOMD-1B', 'Digital Nomad Account Plan (1BR)', 'B2C_RETAIL', 'RETAINER_SUITE', 180, true, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),
  'B2C-PROD-LAUNCH-ST': active('B2C-PROD-LAUNCH-ST', 'Business Startup Launch Kit Starter', 'B2C_RETAIL', 'FIXED_FLAT', 79, false, [], 'DIRECT_LINK_MATCH', 'CASS', '20-Page Resident Concierge Guide'),
  'B2C-PROD-NFC': active('B2C-PROD-NFC', 'SmartTap NFC Functional Card', 'B2C_RETAIL', 'FIXED_FLAT', 49, true, [], 'DIRECT_LINK_MATCH', 'STAFF_DIRECT', '20-Page Resident Concierge Guide'),
  'B2C-EVNT-FULL': active('B2C-EVNT-FULL', 'Full Event Planning Coordination Fee', 'B2C_RETAIL', 'BESPOKE_SOW', 650, true, ['BUDGET-PERCENTAGE'], 'MANUAL_INVOICE', 'STAFF_DIRECT', '20-Page Resident Concierge Guide'),
  'B2C-EVNT-LIGHT-EXT': active('B2C-EVNT-LIGHT-EXT', 'Exterior Patio / Balcony Holiday Lighting Baseline', 'B2C_RETAIL', 'FIXED_FLAT', 450, true, ['HEIGHT-PREMIUM'], 'DIRECT_LINK_MATCH', 'NAWFSIDE', '20-Page Resident Concierge Guide'),

  // B2B — multi-family turns
  'B2B-TURN-ROUGH': active('B2B-TURN-ROUGH', 'B2B Multi-Family Portfolio Rough Clean Turn', 'B2B_VOLUME', 'VARIABLE_SCALAR', 450, false, ['MOD-1B1B-CREDIT', 'MOD-3B2B-DEBIT', 'MOD-4B3B-DEBIT', 'MOD-SQFT-SCALAR', 'B2B-ADD-STEAM', 'B2B-ADD-HEPA'], 'FROZEN_ESTIMATE_CHECKOUT', 'NAWFSIDE', 'B2B Master Commercial Sheet'),
  'B2B-TURN-FINAL': active('B2B-TURN-FINAL', 'B2B Multi-Family Portfolio Final Clean Turn', 'B2B_VOLUME', 'VARIABLE_SCALAR', 650, false, ['MOD-1B1B-CREDIT', 'MOD-3B2B-DEBIT', 'MOD-4B3B-DEBIT', 'MOD-SQFT-SCALAR', 'B2B-ADD-STEAM', 'B2B-ADD-HEPA'], 'FROZEN_ESTIMATE_CHECKOUT', 'NAWFSIDE', 'B2B Master Commercial Sheet'),
  'B2B-TURN-DETAIL': active('B2B-TURN-DETAIL', 'B2B Multi-Family Portfolio Detailed Finish Clean Turn', 'B2B_VOLUME', 'VARIABLE_SCALAR', 1200, false, ['MOD-1B1B-CREDIT', 'MOD-3B2B-DEBIT', 'MOD-4B3B-DEBIT', 'MOD-SQFT-SCALAR', 'B2B-ADD-STEAM', 'B2B-ADD-HEPA'], 'FROZEN_ESTIMATE_CHECKOUT', 'NAWFSIDE', 'B2B Master Commercial Sheet'),
  'B2B-TURN-RESET': active('B2B-TURN-RESET', 'B2B Property Reset / Move-In Unit Prep', 'B2B_VOLUME', 'FIXED_FLAT', 125, false, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', 'B2B Master Commercial Sheet'),
  'B2B-TURN-WALK': active('B2B-TURN-WALK', 'B2B Final Handover Walkthrough Prep', 'B2B_VOLUME', 'FIXED_FLAT', 75, false, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', 'B2B Master Commercial Sheet'),
  'B2B-FLEET-DISPATCH': active('B2B-FLEET-DISPATCH', 'Automotive Roadside Fleet Dispatch Trip', 'B2B_VOLUME', 'FIXED_FLAT', 65, false, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', 'B2B Master Commercial Sheet'),
  'B2B-FLEET-PLUG': active('B2B-FLEET-PLUG', 'Mobile Fleet Tire Plug / Assembly Swap Base', 'B2B_VOLUME', 'FIXED_FLAT', 45, false, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', 'B2B Master Commercial Sheet'),
  'B2B-ADM-I9': active('B2B-ADM-I9', 'I-9 Employment Identity Verification Run', 'B2B_VOLUME', 'FIXED_FLAT', 45, false, [], 'DIRECT_LINK_MATCH', 'CASS', 'B2B Master Commercial Sheet'),
  'B2B-ADM-AUDIT': active('B2B-ADM-AUDIT', 'Key Vault / Delivery Locker Fleet Audit', 'B2B_VOLUME', 'FIXED_FLAT', 125, false, [], 'DIRECT_LINK_MATCH', 'CASS', 'B2B Master Commercial Sheet'),
  'B2B-ADM-NOTICE': active('B2B-ADM-NOTICE', 'Legal Property Notice Hand-Delivery Run', 'B2B_VOLUME', 'FIXED_FLAT', 35, false, [], 'DIRECT_LINK_MATCH', 'STAFF_DIRECT', 'B2B Master Commercial Sheet'),
  'B2B-STAGE-OFFICE': active('B2B-STAGE-OFFICE', 'Leasing Office Event / Seasonal Staging Run', 'B2B_VOLUME', 'FIXED_FLAT', 450, false, ['HEIGHT-PREMIUM'], 'DIRECT_LINK_MATCH', 'STAFF_DIRECT', 'B2B Master Commercial Sheet'),
  'B2B-GLOW-SETUP': active('B2B-GLOW-SETUP', 'Base Glow Structural Lighting Installation', 'B2B_VOLUME', 'FIXED_FLAT', 750, false, [], 'DIRECT_LINK_MATCH', 'NAWFSIDE', 'B2B Master Commercial Sheet'),
  'B2B-PRINT-PACKET': active('B2B-PRINT-PACKET', 'Move-In Folder Portfolio Resident Handout Pack', 'B2B_VOLUME', 'FIXED_FLAT', 8.5, false, [], 'DIRECT_LINK_MATCH', 'CASS', 'B2B Master Commercial Sheet'),
  'B2B-PROD-APPAREL-LV': active('B2B-PROD-APPAREL-LV', 'DTF Branded Client Apparel (Low-Volume Tier)', 'B2B_VOLUME', 'FIXED_FLAT', 25, false, [], 'DIRECT_LINK_MATCH', 'STAFF_DIRECT', 'B2B Master Commercial Sheet'),

  // B2B — retainer packages whose audited amounts were explicitly supplied
  'B2B-RET-001': active('B2B-RET-001', 'Property Readiness Subscription Tier', 'B2B_VOLUME', 'RETAINER_SUITE', 1500, false, [], 'MANUAL_INVOICE', 'STAFF_DIRECT', 'B2B Master Pricing PDF'),
  'B2B-RET-002': active('B2B-RET-002', 'Resident Experience Subscription Tier', 'B2B_VOLUME', 'RETAINER_SUITE', 3250, false, [], 'MANUAL_INVOICE', 'STAFF_DIRECT', 'B2B Master Pricing PDF'),
  'B2B-RET-003': active('B2B-RET-003', 'Portfolio Optimization Subscription Tier', 'B2B_VOLUME', 'RETAINER_SUITE', 5500, false, [], 'MANUAL_INVOICE', 'STAFF_DIRECT', 'B2B Master Pricing PDF'),
  'B2B-RET-004': active('B2B-RET-004', 'Facility Compliance Shield Subscription Tier', 'B2B_VOLUME', 'RETAINER_SUITE', 1850, false, [], 'MANUAL_INVOICE', 'STAFF_DIRECT', 'B2B Master Pricing PDF'),
  'B2B-RET-012': active('B2B-RET-012', 'Complete Enterprise Omnichannel Subscription Tier', 'B2B_VOLUME', 'RETAINER_SUITE', 7500, false, ['OPS-LOCK-10'], 'MANUAL_INVOICE', 'STAFF_DIRECT', 'B2B Master Pricing PDF'),

  // Historical artifacts — retained only for reconciliation/audit visibility.
  'B2C-CLEAN-DEEP-LEGACY-H': {
    serviceId: 'B2C-CLEAN-DEEP-LEGACY-H',
    name: 'Stale Deep Clean Invariant ($200 code placeholder)',
    channel: 'B2C_RETAIL',
    model: 'FIXED_FLAT',
    baseCustomerPrice: 200,
    residentDiscountEligible: false,
    allowedModifiers: [],
    stripeExecutionMode: 'MANUAL_INVOICE',
    providerIsolationLane: 'UNASSIGNED',
    status: COMMERCIAL_STATUS.DEPRECATED_HISTORICAL,
    sourceDocument: 'masterCatalog2026.js (Initial Merge Commit)',
  },
  'B2B-RET-012-LEGACY-EXPENSE': {
    serviceId: 'B2B-RET-012-LEGACY-EXPENSE',
    name: 'Historical $10,500 Institutional Partner Retainer Escalation',
    channel: 'B2B_VOLUME',
    model: 'RETAINER_SUITE',
    baseCustomerPrice: 10500,
    residentDiscountEligible: false,
    allowedModifiers: [],
    stripeExecutionMode: 'MANUAL_INVOICE',
    providerIsolationLane: 'UNASSIGNED',
    status: COMMERCIAL_STATUS.DEPRECATED_HISTORICAL,
    sourceDocument: 'Older B2B Subscriptions Document',
  },
});

// Provider-wall governance. These are permissions granted to DANI DECLARES,
// not provider economics and not customer-facing copy.
export const providerCommercialGovernance = Object.freeze({
  NAWFSIDE: Object.freeze({
    customerPricingOwner: 'DANI_DECLARES',
    marketingOwner: 'DANI_DECLARES',
    providerPricingAuthority: false,
    providerCustomerRelationshipOwner: 'DANI_DECLARES',
    providerPayoutSource: 'EXECUTED_WORK_ORDER_OR_SOW',
    publicProviderEconomicsAllowed: false,
    agreementEffectiveDate: '2026-08-11',
    fulfillmentModel: 'PROJECT_BY_PROJECT_WORK_ORDER',
  }),
});

export function getCommercialRecord(serviceId) {
  return masterCommercialRegistry[String(serviceId || '').trim()] || null;
}

export function isCanonicalActive(serviceId) {
  return getCommercialRecord(serviceId)?.status === COMMERCIAL_STATUS.CANONICAL_ACTIVE;
}

export function getCustomerBasePrice(serviceId) {
  const record = getCommercialRecord(serviceId);
  if (!record || record.status !== COMMERCIAL_STATUS.CANONICAL_ACTIVE) return null;
  return record.baseCustomerPrice;
}

export function listCanonicalOffers() {
  return Object.values(masterCommercialRegistry).filter(
    (record) => record.status === COMMERCIAL_STATUS.CANONICAL_ACTIVE,
  );
}
