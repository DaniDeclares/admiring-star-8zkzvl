import { catalog } from './masterCatalog2026.js';

/**
 * Canonical aliases used by presentation-layer components.
 * Keep these aliases pointed at real offerIds from masterCatalog2026.js.
 */
export const SERVICE_OFFER_MAP = {
  notary: '01-NOT',
  mobile_notary: '01-NOT',
  loansigning: '01-LON',
  loan_signing: '01-LON',
  trust: '01-LON',
  trust_signing: '01-LON',
  apostille: '01-APO',
  officiant: '02-WED',
  startup_kit: '05-STU',
  business_startup_kit: '05-STU',
  sop: '05-SOP',
  sop_manual: '05-SOP',
  apparel: '03-APP',
  custom_apparel: '03-APP',
  tumbler: '03-TUM',
  sublimated_tumbler: '03-TUM',
  nfc: '04-NFC',
  smarttap: '04-NFC',
  review_stand: '04-GCR',
  google_review_stand: '04-GCR',
};

const CATALOG_BY_ID = new Map(catalog.map((entry) => [entry.offerId, entry]));

const DEFAULT_PRICE_LABEL = 'Starting at / Quoted';

const formatCurrency = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Resolve an alias or raw offerId to the authoritative catalog entry.
 * Returns null when the requested identifier is not present in the master catalog.
 */
export function getPricingEntry(serviceId) {
  if (!serviceId) return null;

  const normalizedId = String(serviceId).trim();
  const offerId = SERVICE_OFFER_MAP[normalizedId] || normalizedId;

  return CATALOG_BY_ID.get(offerId) || null;
}

/**
 * Return the canonical numeric baseline when the catalog defines one.
 * This intentionally does not reinterpret startingPrice text or invent prices.
 */
export function getPriceValue(serviceId) {
  const entry = getPricingEntry(serviceId);
  return typeof entry?.workingBaselineRate === 'number'
    ? entry.workingBaselineRate
    : null;
}

/**
 * Convert a canonical catalog entry into presentation-safe price copy.
 * Custom-quote services do not expose an hourly baseline as a consumer price.
 */
export function getPriceLabel(serviceId) {
  const entry = getPricingEntry(serviceId);

  if (!entry) return DEFAULT_PRICE_LABEL;

  if (entry.transactionType === 'CUSTOM_QUOTE') {
    return 'Custom Quote';
  }

  const formattedBaseline = formatCurrency(entry.workingBaselineRate);
  if (formattedBaseline) return formattedBaseline;

  if (entry.startingPrice) return entry.startingPrice;

  return DEFAULT_PRICE_LABEL;
}

export { formatCurrency };
