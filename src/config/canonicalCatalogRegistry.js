/**
 * DANI DECLARES LLC — COMPANY-WIDE CATALOG MASTER
 * Phase 0: capability universe only.
 *
 * IMPORTANT:
 * - This file is NOT a SKU registry.
 * - It contains no customer prices or provider payouts.
 * - A capability being present here does not mean it is commercially active.
 * - Historical records remain evidence and are not imported here automatically.
 * - Pricing, checkout, provider routing, packages and work orders must consume
 *   reconciled records rather than inventing catalog identities.
 */

export const CATALOG_PHASE = 'PHASE_0_CAPABILITY_UNIVERSE';
export const CATALOG_STATUS = 'CATALOG_AUTHORITY_RECONCILIATION';

export const DIVISIONS = Object.freeze([
  { id: 1, name: 'Home, Pet, Plant & Household Support' },
  { id: 2, name: 'Property, Facilities & Field Operations' },
  { id: 3, name: 'Real Estate & Closing Support' },
  { id: 4, name: 'Administrative & Business Operations' },
  { id: 5, name: 'Notary & Document Services' },
  { id: 6, name: 'Business Formation & Digital Infrastructure' },
  { id: 7, name: 'Marketing, Content & Media Production' },
  { id: 8, name: 'Business Development & Growth' },
  { id: 9, name: 'Classes, Workshops & Training' },
  { id: 10, name: 'Experiences & Resident Programming' },
  { id: 11, name: 'Creative Design & Production' },
  { id: 12, name: 'Logistics, Courier & Asset Sourcing' },
  { id: 13, name: 'Government & Institutional Procurement' },
]);

export const COMMERCIAL_OBJECT_TYPES = Object.freeze([
  'SERV',
  'PROD',
  'DIGITAL',
  'KIT',
  'RET',
  'EVENT',
  'WORK-ORDER',
]);

export const LIFECYCLE_STATES = Object.freeze([
  'CANONICAL_ACTIVE',
  'ABSORBED_REDIRECTED',
  'DEPRECATED_HISTORICAL',
  'PENDING_RECONCILIATION',
]);

export const CHANNELS = Object.freeze([
  { id: 'CH01', name: 'Resident Concierge' },
  { id: 'CH02', name: 'Property Management & Apartments' },
  { id: 'CH03', name: 'Real Estate Offices & Brokerages' },
  { id: 'CH04', name: 'Businesses' },
  { id: 'CH05', name: 'Government & Institutional Procurement' },
]);

export const CH01_SUBCHANNELS = Object.freeze([
  { id: 'CH01-A', name: 'Regular Resident Concierge' },
  { id: 'CH01-B', name: 'Apartment Resident Concierge' },
]);

export const MARKETS = Object.freeze([
  'Jonesboro',
  'Tucker',
  'Stone Mountain',
  'Chamblee',
  'Brookhaven',
  'Midtown',
  'Buckhead',
]);

const capability = (id, divisionId, family, name, options = {}) => ({
  capabilityId: id,
  divisionId,
  serviceFamily: family,
  name,
  lifecycleState: options.lifecycleState ?? 'PENDING_RECONCILIATION',
  commercializationState: options.commercializationState ?? 'PENDING_RECONCILIATION',
  objectTypes: options.objectTypes ?? ['SERV', 'WORK-ORDER'],
  dependencies: options.dependencies ?? [],
  legacyIds: options.legacyIds ?? [],
  sourceAuthority: options.sourceAuthority ?? 'Phase 0 Company-Wide Catalog Master',
});

export const COMPANY_WIDE_CATALOG = Object.freeze([
  capability('CAP-01A-CLEAN', 1, 'Home Cleaning & Household Execution', 'Residential cleaning and household sanitation', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-01A-MAINT', 1, 'Household Maintenance Support', 'Household upkeep and basic maintenance support', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-01B-PET', 1, 'Pet & Companion Support', 'Routine in-home pet and companion support', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-01C-PLANT', 1, 'Indoor Plant & Botanical Support', 'Indoor plant and botanical maintenance', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-01D-ORG', 1, 'Household Organization & Decluttering', 'Household organization, sorting and decluttering', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-01E-HOMEWATCH', 1, 'Household Concierge & Home Watch', 'Home watch, household support and vacation preparation', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-01F-MOVE', 1, 'Move & Household Transition', 'Move preparation, transition and post-move support', { lifecycleState: 'CANONICAL_ACTIVE', dependencies: ['CAP-12-LOG'] }),
  capability('CAP-01G-SEASONAL', 1, 'Seasonal & Household Experience Support', 'Seasonal, holiday and household experience support', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-02A-TURN', 2, 'Property Turn & Make-Ready', 'Multifamily turns, make-ready and unit readiness', { lifecycleState: 'CANONICAL_ACTIVE', dependencies: ['CAP-01A-CLEAN', 'CAP-12-LOG'] }),
  capability('CAP-02B-MAINT', 2, 'Facilities Maintenance Coordination', 'Property maintenance dispatch and coordination', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-02C-FIELD', 2, 'Field Operations', 'Inspections, field verification and documentation', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-02D-VENDOR', 2, 'Vendor & Property Support', 'Vendor, work-order and property support coordination', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-03A-LISTING', 3, 'Listing Readiness', 'Listing preparation and property readiness', { lifecycleState: 'CANONICAL_ACTIVE', dependencies: ['CAP-01A-CLEAN'] }),
  capability('CAP-03B-SHOWING', 3, 'Showing & Open-House Support', 'Showing and open-house setup/takedown support', { lifecycleState: 'CANONICAL_ACTIVE', dependencies: ['CAP-10A-EVENT'] }),
  capability('CAP-03C-TRANSACTION', 3, 'Transaction Support', 'Real-estate transaction and closing support', { lifecycleState: 'CANONICAL_ACTIVE', dependencies: ['CAP-05A-NOTARY'] }),
  capability('CAP-03D-REAL-ESTATE-FIELD', 3, 'Real Estate Field Logistics', 'Property access, field documentation and handoff logistics', { lifecycleState: 'CANONICAL_ACTIVE', dependencies: ['CAP-12-LOG'] }),
  capability('CAP-04A-ADMIN', 4, 'Administrative Support', 'Virtual and on-site administrative support', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-04B-OPS', 4, 'Business Operations', 'Workflow, process and back-office operations support', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-04C-FINADMIN', 4, 'Financial & Project Administration', 'Financial, bookkeeping and project administration support where qualified', { lifecycleState: 'PENDING_RECONCILIATION' }),
  capability('CAP-05A-NOTARY', 5, 'Notary', 'Mobile and general notary services where commissioned', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-05B-LOAN', 5, 'Loan Signing & Closing Documents', 'Loan signing and closing-document execution support where qualified', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-05C-DOCFIELD', 5, 'Document Field Services', 'Authorized document witnessing, authentication and field support', { lifecycleState: 'PENDING_RECONCILIATION' }),
  capability('CAP-06A-FORMATION', 6, 'Business Formation Support', 'Business formation and startup process support', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-06B-DIGITAL', 6, 'Digital Infrastructure', 'Google Workspace, domains, hosting and digital configuration', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-06C-COMPUTER', 6, 'Computer & Technical Support', 'Computer setup, troubleshooting, configuration and repair support', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-06D-SYSTEMS', 6, 'Application & Systems Support', 'Application, database, API and systems configuration support', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-07A-MARKETING', 7, 'Marketing Strategy', 'Marketing strategy and campaign operations', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-07B-CONTENT', 7, 'Social & Content', 'Social media and content operations', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-07C-PHOTO', 7, 'Photography & Property Media', 'Property and amenity photography/media', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-07D-VIDEO', 7, 'Video Production', 'Video recording, editing and post-production', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-08A-BD', 8, 'Business Development', 'Sales pipeline and client acquisition development', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-08B-PARTNERS', 8, 'Partnership Development', 'Partner, referral and vendor-network development', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-08C-GROWTH', 8, 'Growth Consulting', 'Growth strategy and commercial expansion support', { lifecycleState: 'CANONICAL_ACTIVE' }),
  capability('CAP-09A-EDU', 9, 'Educational Programs', 'Classes, workshops and educational programs', { lifecycleState: 'PENDING_RECONCILIATION', objectTypes: ['EVENT', 'SERV'] }),
  capability('CAP-09B-BUSINESS-TRAINING', 9, 'Business Training', 'Business operations and entrepreneurship training', { lifecycleState: 'PENDING_RECONCILIATION', objectTypes: ['EVENT', 'SERV'] }),
  capability('CAP-09C-SKILLS', 9, 'Skills & Lifestyle Training', 'Practical skills and lifestyle education', { lifecycleState: 'PENDING_RECONCILIATION', objectTypes: ['EVENT', 'SERV'] }),
  capability('CAP-10A-EVENT', 10, 'Event Planning', 'Event planning, coordination and production', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['EVENT', 'SERV', 'WORK-ORDER'], dependencies: ['CAP-12-LOG'] }),
  capability('CAP-10B-RESIDENT', 10, 'Resident Programming', 'Resident appreciation and community programming', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['EVENT', 'SERV'] }),
  capability('CAP-10C-PRODUCTION', 10, 'Event Production', 'Event setup, takedown, vendor and on-site execution', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['EVENT', 'WORK-ORDER'] }),
  capability('CAP-11A-DESIGN', 11, 'Graphic Design', 'Graphic and branded asset design', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['SERV', 'DIGITAL'] }),
  capability('CAP-11B-PRINT', 11, 'Print Production', 'Print and physical collateral production', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['SERV', 'PROD'] }),
  capability('CAP-11C-APPAREL', 11, 'Apparel & Merchandise', 'DTF, heat press, apparel and promotional merchandise', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['SERV', 'PROD', 'KIT'] }),
  capability('CAP-11D-FABRICATION', 11, 'Custom Product Fabrication', 'Custom branded physical product fabrication', { lifecycleState: 'PENDING_RECONCILIATION', objectTypes: ['PROD', 'SERV'] }),
  capability('CAP-12-LOG', 12, 'Courier & Field Logistics', 'Courier, delivery, errands and field logistics', { lifecycleState: 'CANONICAL_ACTIVE', dependencies: [] }),
  capability('CAP-12-SOURCE', 12, 'Procurement & Material Sourcing', 'Material sourcing, procurement and supply coordination', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['SERV', 'WORK-ORDER'] }),
  capability('CAP-12-ASSET', 12, 'Asset Movement & Management', 'Asset pickup, transfer, delivery and chain-of-custody support', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['SERV', 'WORK-ORDER'] }),
  capability('CAP-13A-READINESS', 13, 'Government Contracting Readiness', 'Government/institutional vendor and procurement readiness', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['SERV', 'DIGITAL'] }),
  capability('CAP-13B-DELIVERY', 13, 'Institutional Service Delivery', 'Contracted public-sector service delivery using approved underlying capabilities', { lifecycleState: 'PENDING_RECONCILIATION', objectTypes: ['SERV', 'WORK-ORDER'] }),
  capability('CAP-13C-ADMIN', 13, 'Government Contract Administration', 'Contract, reporting and milestone administration', { lifecycleState: 'CANONICAL_ACTIVE', objectTypes: ['SERV', 'WORK-ORDER'] }),
  capability('CAP-13D-SOLICITATION', 13, 'Solicitation-Specific Execution', 'Solicitation-specific scope execution and coordination', { lifecycleState: 'PENDING_RECONCILIATION', objectTypes: ['SERV', 'WORK-ORDER'] }),
]);

export const getCatalogEntry = (capabilityId) => COMPANY_WIDE_CATALOG.find((entry) => entry.capabilityId === capabilityId) ?? null;
export const getCatalogByDivision = (divisionId) => COMPANY_WIDE_CATALOG.filter((entry) => entry.divisionId === divisionId);
export const getCommerciallyEligibleCatalog = () => COMPANY_WIDE_CATALOG.filter((entry) => entry.lifecycleState === 'CANONICAL_ACTIVE');
export default COMPANY_WIDE_CATALOG;
