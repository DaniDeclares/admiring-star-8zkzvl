// DANI DECLARES LLC — PR B
// Comprehensive B2B Commercial Catalog + Multi-Channel Property & Operations Spine
// Numeric values are canonical here only when established in the approved business pricing specification.
// Unresolved values remain UNDEFINED and never become customer-facing prices.

import { PRICING_STATUS, PRICING_CHANNELS, PRICING_UNITS } from './canonicalPricing2026';

export const B2B_OFFER_STATUS = {
  LOCKED: PRICING_STATUS.LOCKED,
  PROPOSED: PRICING_STATUS.PROPOSED,
  UNDEFINED_PENDING: PRICING_STATUS.UNDEFINED,
  CUSTOM_QUOTE: PRICING_STATUS.CUSTOM,
  DISCONTINUED: PRICING_STATUS.DISCARDED,
};

const B2B = PRICING_CHANNELS.B2B;
const B2B2C = PRICING_CHANNELS.B2B2C;
const B2G = PRICING_CHANNELS.B2G;

export const B2B_COMMERCIAL_CATALOG_2026 = {
  PROPERTY_TURNOVER: [
    { offerId: 'B2B-APT-TURN-STANDARD', capabilityId: 'PROPERTY_TURNOVER', channel: B2B, audience: 'B2B-APT', name: 'Standard Multifamily Unit Turn', pricingModel: 'PER_UNIT', baseRate: 350, unit: PRICING_UNITS.PER_UNIT, scope: 'Standard 1–2BR unit turnover / make-ready scope', status: B2B_OFFER_STATUS.LOCKED, legacyOfferIds: ['02-TO1', '02-TO2'], disclaimerIds: ['STANDARD_SCOPE', 'CONDITION_ADJUSTMENT', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: ['B2B_ADDITIONAL_BEDROOM', 'B2B_ADDITIONAL_BATHROOM', 'B2B_EXCESS_DEBRIS', 'B2B_HEAVY_SOIL', 'B2B_PET_MESS', 'B2B_SECOND_TRIP', 'B2B_ACCESS_WAIT'] },
    { offerId: 'B2B-APT-TURN-DEEP', capabilityId: 'PROPERTY_TURNOVER', channel: B2B, audience: 'B2B-APT', name: 'Deep Move-In / Unit Reset', pricingModel: 'PER_UNIT', baseRate: 450, unit: PRICING_UNITS.PER_UNIT, scope: 'Deep move-in / reset scope', status: B2B_OFFER_STATUS.LOCKED, legacyOfferIds: ['02-TO3'], disclaimerIds: ['STANDARD_SCOPE', 'CONDITION_ADJUSTMENT', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: ['B2B_ADDITIONAL_BEDROOM', 'B2B_ADDITIONAL_BATHROOM', 'B2B_EXCESS_DEBRIS', 'B2B_HEAVY_SOIL', 'B2B_PET_MESS', 'B2B_SECOND_TRIP', 'B2B_ACCESS_WAIT'] },
    { offerId: 'B2B-APT-TURN-STR', capabilityId: 'PROPERTY_TURNOVER_STR', channel: B2B, audience: 'B2B-APT', name: 'Short-Term Rental / Airbnb Turnover', pricingModel: 'PER_UNIT', baseRate: null, unit: PRICING_UNITS.PER_UNIT, scope: 'STR turnover with turnover-specific checklist, restock, linen and inspection options', status: B2B_OFFER_STATUS.UNDEFINED_PENDING, legacyOfferIds: ['02-STR'], disclaimerIds: ['STANDARD_SCOPE', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: ['B2B_EXCESS_DEBRIS', 'B2B_HEAVY_SOIL', 'B2B_SECOND_TRIP', 'B2B_ACCESS_WAIT'] },
  ],
  MAINTENANCE_FACILITIES: [
    { offerId: 'B2B-FAC-DISPATCH', capabilityId: 'MAINTENANCE_DISPATCH', channels: [B2B, B2B2C], name: 'Maintenance / Facilities Dispatch', pricingModel: 'PER_VISIT', baseRate: 85, unit: PRICING_UNITS.PER_VISIT, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STANDARD_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT', 'B2B2C_SEPARATION'], modifierIds: ['B2B_MATERIALS_COST_PLUS', 'B2B_SECOND_TRIP', 'B2B_ACCESS_WAIT'] },
    { offerId: 'B2B-FAC-HANDYMAN', capabilityId: 'COMMERCIAL_HANDYMAN', channels: [B2B, B2B2C], name: 'Commercial Handyman / Maintenance', pricingModel: 'HOURLY', baseRate: 55, unit: PRICING_UNITS.PER_HOUR, minimumCharge: 85, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STANDARD_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT', 'B2B2C_SEPARATION'], modifierIds: ['B2B_MATERIALS_COST_PLUS', 'B2B_RUSH'] },
    { offerId: 'B2B-FAC-PUNCHLIST', capabilityId: 'PUNCH_LIST_EXECUTION', channels: [B2B, B2B2C], name: 'Punch-List Execution', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT', 'B2B2C_SEPARATION'], modifierIds: ['B2B_MATERIALS_COST_PLUS', 'B2B_ACCESS_WAIT'] },
    { offerId: 'B2B-FAC-SUPPORT', capabilityId: 'FACILITY_SUPPORT', channels: [B2B, B2G], name: 'Facilities Support Services', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.CUSTOM_QUOTE, disclaimerIds: ['CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'GOVERNMENT_PROCUREMENT', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
  ],
  INSPECTION_LOGISTICS: [
    { offerId: 'B2B-OPS-CONDITION', capabilityId: 'PROPERTY_CONDITION_REPORT', channel: B2B, name: 'Property Condition Reporting', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-OPS-PHOTO', capabilityId: 'PHOTO_DOCUMENTATION', channel: B2B, name: 'Photo Documentation / Inspection Package', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-OPS-LOCKBOX', capabilityId: 'LOCKBOX_DEPLOYMENT', channel: B2B, name: 'Lockbox Deployment / Key Logistics', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-OPS-ACCESS', capabilityId: 'ACCESS_COORDINATION', channel: B2B, name: 'Access Coordination', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
  ],
  ADMIN_EXECUTIVE: [
    { offerId: 'B2B-ADMIN-HOURLY', capabilityId: 'ADMIN_SUPPORT', channel: B2B, name: 'Administrative & Executive Support', pricingModel: 'HOURLY', baseRate: 45, unit: PRICING_UNITS.PER_HOUR, status: B2B_OFFER_STATUS.LOCKED, legacyOfferIds: ['01-ADM'], disclaimerIds: ['STANDARD_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-ADMIN-FRACTIONAL', capabilityId: 'FRACTIONAL_OPERATIONS', channel: B2B, name: 'Fractional Office / Operations Support', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-ADMIN-COMMUNICATION', capabilityId: 'TENANT_CLIENT_COMMUNICATION', channel: B2B, name: 'Tenant / Client Communication Support', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
  ],
  DOCUMENT_WORKFLOW: [
    { offerId: 'B2B-DOC-SOP', capabilityId: 'SOP_MANUAL_SETUP', channel: B2B, name: 'SOP Manual Setup', pricingModel: 'STARTING_AT', baseRate: 500, unit: PRICING_UNITS.STARTING_AT, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STARTING_PRICE', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-DOC-PREP', capabilityId: 'DOCUMENT_PREPARATION', channel: B2B, name: 'Non-Attorney Document Preparation', pricingModel: 'STARTING_AT', baseRate: null, unit: PRICING_UNITS.STARTING_AT, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, legacyOfferIds: ['01-DOC'], disclaimerIds: ['STARTING_PRICE', 'NON_ATTORNEY', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-DOC-COURIER', capabilityId: 'LEGAL_COURIER_ROUTING', channel: B2B, name: 'Legal Courier / Filing Routing Coordination', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['PASS_THROUGH_COSTS', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
  ],
  NOTARY_VERIFICATION: [
    { offerId: 'B2B-NOT-MOBILE', capabilityId: 'MOBILE_NOTARY', channel: B2B, name: 'Mobile Notary Public Visit', pricingModel: 'STARTING_AT', baseRate: 50, unit: PRICING_UNITS.PER_VISIT, status: B2B_OFFER_STATUS.LOCKED, legacyOfferIds: ['01-NOT'], disclaimerIds: ['NOTARY', 'PASS_THROUGH_COSTS', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-NOT-LOAN', capabilityId: 'LOAN_SIGNING', channel: B2B, name: 'Loan Signing Package', pricingModel: 'FIXED_PRICE', baseRate: 150, unit: PRICING_UNITS.PER_PACKAGE, status: B2B_OFFER_STATUS.LOCKED, legacyOfferIds: ['01-LON'], disclaimerIds: ['NOTARY', 'PASS_THROUGH_COSTS', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-NOT-I9', capabilityId: 'I9_VERIFICATION', channel: B2B, name: 'Remote I-9 Verification', pricingModel: 'FIXED_PRICE', baseRate: 50, unit: PRICING_UNITS.PER_VISIT, status: B2B_OFFER_STATUS.LOCKED, legacyOfferIds: ['01-I9V'], disclaimerIds: ['VERIFICATION', 'PASS_THROUGH_COSTS', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-NOT-APOSTILLE', capabilityId: 'APOSTILLE', channel: B2B, name: 'Expedited Apostille Coordination', pricingModel: 'STARTING_AT', baseRate: 175, unit: PRICING_UNITS.STARTING_AT, status: B2B_OFFER_STATUS.LOCKED, legacyOfferIds: ['01-APO'], disclaimerIds: ['PASS_THROUGH_COSTS', 'STARTING_PRICE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-NOT-FINGERPRINT', capabilityId: 'MOBILE_FINGERPRINTING', channel: B2B, name: 'Mobile Fingerprinting', pricingModel: 'STARTING_AT', baseRate: 35, unit: PRICING_UNITS.STARTING_AT, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['VERIFICATION', 'PASS_THROUGH_COSTS', 'STARTING_PRICE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
  ],
  REAL_ESTATE_SUPPORT: [
    { offerId: 'B2B-RE-LISTING', capabilityId: 'LISTING_SUPPORT', channel: B2B, name: 'Listing / Physical Support', pricingModel: 'HOURLY', baseRate: 55, unit: PRICING_UNITS.PER_HOUR, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STANDARD_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-RE-OPEN-HOUSE', capabilityId: 'OPEN_HOUSE_SETUP', channel: B2B, name: 'Open-House Setup & Takedown', pricingModel: 'PER_EVENT', baseRate: 300, unit: PRICING_UNITS.PER_EVENT, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STANDARD_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: ['B2B_RUSH'] },
    { offerId: 'B2B-RE-TRANSACTION', capabilityId: 'LISTING_TRANSACTION_SUPPORT', channel: B2B, name: 'Listing & Transaction Support Retainer', pricingModel: 'MONTHLY_RETAINER', baseRate: 1200, unit: PRICING_UNITS.PER_MONTH, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['RETAINER', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-RE-OFFICE-OPS', capabilityId: 'OFFICE_OPERATIONS', channel: B2B, name: 'Office Operations Retainer', pricingModel: 'MONTHLY_RETAINER', baseRate: 2500, unit: PRICING_UNITS.PER_MONTH, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['RETAINER', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
  ],
  EVENTS: [
    { offerId: 'B2B-EVENT-CORPORATE', capabilityId: 'CORPORATE_EVENT_SUPPORT', channel: B2B, name: 'Corporate / Office Event Support', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: ['B2B_RUSH'] },
    { offerId: 'B2B-EVENT-RESIDENT', capabilityId: 'RESIDENT_APPRECIATION_EVENT', channel: B2B2C, name: 'Resident Appreciation Event Support', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B2C_SEPARATION'], modifierIds: ['B2B_RUSH'] },
    { offerId: 'B2B-EVENT-WEDDING', capabilityId: 'WEDDING_EVENT_COORDINATION', channel: B2B, name: 'Wedding / Elopement Coordination Support', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: ['B2B_RUSH'] },
    { offerId: 'B2B-EVENT-SETUP', capabilityId: 'EVENT_SETUP_TAKEDOWN', channel: B2B, name: 'On-Site Event Setup & Takedown', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: ['B2B_RUSH'] },
  ],
  CREATIVE_MARKETING: [
    { offerId: '04-NFC', capabilityId: 'NFC_SMARTTAP_CARD', channel: B2B, name: 'NFC SmartTap Card', pricingModel: 'FIXED_PRICE', baseRate: 49, unit: PRICING_UNITS.PER_ITEM, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STANDARD_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: '04-GCR', capabilityId: 'REVIEW_COUNTER_STAND', channel: B2B, name: 'Review Counter Stand', pricingModel: 'FIXED_PRICE', baseRate: 49, unit: PRICING_UNITS.PER_ITEM, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STANDARD_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-CREATIVE-NFC-SET', capabilityId: 'SMART_PROPERTY_EVENT_NFC_SET', channel: B2B, name: 'Smart Property / Event NFC Tag Set', pricingModel: 'STARTING_AT', baseRate: 75, unit: PRICING_UNITS.STARTING_AT, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STARTING_PRICE', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-CREATIVE-QR', capabilityId: 'QR_SIGNAGE_PROGRAM', channel: B2B, name: 'QR / Signage Program', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
  ],
  GIFTING_PERKS: [
    { offerId: '05-MK15', capabilityId: 'SNACK_BOX', channel: B2B2C, name: 'Curated Snack Box', pricingModel: 'FIXED_PRICE', baseRate: 15, unit: PRICING_UNITS.PER_ITEM, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STANDARD_SCOPE', 'PASS_THROUGH_COSTS', 'B2B2C_SEPARATION'], modifierIds: [] },
    { offerId: 'B2B-GIFT-WELCOME', capabilityId: 'WELCOME_PACKAGE', channel: B2B2C, name: 'Resident / Client Welcome Package', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B2C_SEPARATION'], modifierIds: [] },
    { offerId: 'B2B-GIFT-APPRECIATION', capabilityId: 'APPRECIATION_GIFTING', channel: B2B2C, name: 'Resident Appreciation Gifting Program', pricingModel: 'CUSTOM', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B2C_SEPARATION'], modifierIds: [] },
  ],
  SUPPLY_MERCHANDISE: [
    { offerId: '03-APP', capabilityId: 'CUSTOM_APPAREL', channel: B2B, name: 'Custom DTF / Heat-Press Apparel', pricingModel: 'DEPOSIT', baseRate: null, unit: PRICING_UNITS.PER_PACKAGE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, legacyOfferIds: ['03-APP'], disclaimerIds: ['STARTING_PRICE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: '03-TUM', capabilityId: 'CUSTOM_TUMBLER', channel: B2B, name: 'Custom 20oz Tumbler', pricingModel: 'FIXED_PRICE', baseRate: null, unit: PRICING_UNITS.PER_ITEM, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, legacyOfferIds: ['03-TUM'], disclaimerIds: ['STARTING_PRICE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: '05-STU', capabilityId: 'PROPERTY_STARTUP_KIT', channel: B2B, name: 'Property Startup Kit', pricingModel: 'FIXED_PRICE', baseRate: 199, unit: PRICING_UNITS.PER_ITEM, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['STANDARD_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
  ],
  RETAINERS: [
    { offerId: 'B2B-APT-RETAINER-1500', capabilityId: 'PROPERTY_SUPPORT_RETAINER', channel: B2B, name: 'Property Support Retainer', pricingModel: 'MONTHLY_RETAINER', baseRate: 1500, unit: PRICING_UNITS.PER_MONTH, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['RETAINER', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-APT-RETAINER-3250', capabilityId: 'RESIDENT_EXPERIENCE_PROGRAM', channel: B2B2C, name: 'Resident Experience Program', pricingModel: 'MONTHLY_RETAINER', baseRate: 3250, unit: PRICING_UNITS.PER_MONTH, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['RETAINER', 'CUSTOM_SCOPE', 'B2B2C_SEPARATION'], modifierIds: [] },
    { offerId: 'B2B-OPS-RETAINER-4500', capabilityId: 'OPERATIONS_PARTNER', channel: B2B, name: 'Operations Partner Retainer', pricingModel: 'MONTHLY_RETAINER', baseRate: 4500, unit: PRICING_UNITS.PER_MONTH, status: B2B_OFFER_STATUS.LOCKED, disclaimerIds: ['RETAINER', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
    { offerId: 'B2B-RET-12-TIER', capabilityId: 'ENTERPRISE_RETAINER_MATRIX', channel: B2B, name: '12-Tier B2B Enterprise Retainer Matrix', pricingModel: 'MONTHLY_RETAINER', baseRate: null, unit: PRICING_UNITS.PER_MONTH, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, disclaimerIds: ['RETAINER', 'CUSTOM_SCOPE', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] },
  ],
  CUSTOM_PROJECTS: [{ offerId: 'B2B-CUSTOM-SOW', capabilityId: 'CUSTOM_PROJECT', channel: B2B, name: 'Custom Commercial Project / SOW', pricingModel: 'SOW_CONTRACT', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.CUSTOM_QUOTE, disclaimerIds: ['CUSTOM_SCOPE', 'MATERIALS_PASS_THROUGH', 'B2B_NO_RESIDENT_DISCOUNT'], modifierIds: [] }],
  GOVERNMENT_INSTITUTIONAL: [
    { offerId: 'B2G-561720-S201', capabilityId: 'GOV_CUSTODIAL_FACILITY', channel: B2G, name: 'Government Facility Custodial / Janitorial Services', pricingModel: 'SOW_CONTRACT', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, classification: 'NAICS 561720 / S201', disclaimerIds: ['GOVERNMENT_PROCUREMENT', 'PROCUREMENT_CLASSIFICATION', 'CUSTOM_SCOPE'], modifierIds: [] },
    { offerId: 'B2G-561210-FAC', capabilityId: 'GOV_FACILITIES_SUPPORT', channel: B2G, name: 'Facilities Support Services', pricingModel: 'SOW_CONTRACT', baseRate: null, unit: PRICING_UNITS.CUSTOM_QUOTE, status: B2B_OFFER_STATUS.UNDEFINED_PENDING, classification: 'NAICS 561210', disclaimerIds: ['GOVERNMENT_PROCUREMENT', 'PROCUREMENT_CLASSIFICATION', 'CUSTOM_SCOPE'], modifierIds: [] },
  ],
};

export const getAllB2BOffers = () => Object.values(B2B_COMMERCIAL_CATALOG_2026).flat();
export const getB2BOffer = (offerId) => getAllB2BOffers().find((offer) => offer.offerId === offerId) || null;
export const getB2BOffersByChannel = (channel) => getAllB2BOffers().filter((offer) => (Array.isArray(offer.channels) ? offer.channels : [offer.channel]).includes(channel));
