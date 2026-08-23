/**
 * DANI DECLARES LLC — PUBLIC SERVICE PROJECTION
 *
 * Compatibility layer for existing UI imports. The Company-Wide Catalog
 * Master is the authority. No legacy pricing, travel-fee engine, provider
 * economics, obsolete packages, or unreconciled service catalog lives here.
 *
 * Phase 0: capabilities can be requested, but no customer price or payment
 * route is authorized until reconciliation promotes the commercial object.
 */

import {
  COMPANY_WIDE_CATALOG,
  getCatalogEntry,
} from "../config/canonicalCatalogRegistry.js";

export const travelFeeDefaults = Object.freeze(null);

const publicCapabilities = COMPANY_WIDE_CATALOG.filter(
  (entry) => entry.lifecycleState === "CANONICAL_ACTIVE"
);

const toPublicService = (entry) => ({
  id: entry.capabilityId,
  canonicalCapabilityId: entry.capabilityId,
  title: entry.name,
  name: entry.name,
  shortDescription: `${entry.serviceFamily} capability. Request intake is required while commercial reconciliation is in progress.`,
  category: entry.serviceFamily,
  divisionId: entry.divisionId,
  actionType: "request",
  pricingStatus: "PENDING_RECONCILIATION",
  price: null,
  priceLabel: "Request a scope review",
  paymentEnabled: false,
  bookingEnabled: false,
  lifecycleState: entry.lifecycleState,
  objectTypes: entry.objectTypes,
  dependencies: entry.dependencies,
});

export const bookingServices = publicCapabilities.map(toPublicService);
export const paymentServices = [];
export const services = bookingServices;
export const serviceCatalog = bookingServices;
export const serviceBundles = [];

export const servicePages = {
  financial: [],
  legal: [],
  realEstate: [],
  weddings: [],
};

export const getServiceById = (serviceId) =>
  services.find((service) => service.id === serviceId) ?? null;

export const getServiceSections = (sections) => sections || [];
export const getCanonicalCapability = (capabilityId) => getCatalogEntry(capabilityId);

export default serviceCatalog;
