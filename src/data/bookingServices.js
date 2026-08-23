import { getCatalogEntry } from "../config/canonicalCatalogRegistry.js";

/**
 * Booking compatibility layer.
 *
 * No service is payment-enabled or bookable from this module until its
 * commercial record is reconciled and promoted. Existing legacy booking
 * routes are intentionally disabled rather than allowed to become a hidden
 * catalog authority.
 */

const canonicalBookingCapabilities = [
  "CAP-05A-NOTARY",
  "CAP-05B-LOAN",
];

export const bookingServices = canonicalBookingCapabilities.map((capabilityId) => {
  const entry = getCatalogEntry(capabilityId);
  return {
    id: capabilityId,
    name: entry?.name ?? capabilityId,
    description: `${entry?.serviceFamily ?? "Service"} — request intake required while reconciliation is in progress.`,
    tidyCalPath: null,
    payServiceKey: null,
    payLabel: "Request service",
    bookingEnabled: false,
    paymentEnabled: false,
    pricingStatus: "PENDING_RECONCILIATION",
  };
});

export const getBookingServiceById = (serviceId) =>
  bookingServices.find((service) => service.id === serviceId) ?? null;
