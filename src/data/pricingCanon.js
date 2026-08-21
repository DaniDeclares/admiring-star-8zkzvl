import { catalog } from './masterCatalog2026.js';
import { getCommercialRecord } from '../config/commercialRegistry';

/**
 * Legacy presentation aliases. These remain for compatibility, but any
 * serviceId present in the Master Commercial Reconciliation Registry wins.
 */
export const SERVICE_OFFER_MAP = {
  notary: '01-NOT',
  mobile_notary: '01-NOT',
  loansigning: '01-LON',
  loan_signing: '01-LON',
  trust: '01-LON',
  trust_signing: '01-LON',
  i9: '01-I9V',
  i9_admin: '01-I9V',
  legal_doc_prep: '01-DOC',
  document_prep: '01-DOC',
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

const registryPresentationEntry = (record) => ({
  offerId: record.serviceId,
  offerName: record.name,
  transactionType: record.model === 'BESPOKE_SOW' ? 'CUSTOM_QUOTE' : 'FIXED_PRICE',
  workingBaselineRate: record.baseCustomerPrice,
  startingPrice: record.model === 'BESPOKE_SOW' ? 'Custom Quote' : formatCurrency(record.baseCustomerPrice),
  commercialStatus: record.status,
  customerChannel: record.channel,
  residentDiscountEligible: record.residentDiscountEligible,
  providerIsolationLane: record.providerIsolationLane,
});

export function getPricingEntry(serviceId) {
  if (!serviceId) return null;

  const normalizedId = String(serviceId).trim();
  const registryRecord = getCommercialRecord(normalizedId);
  if (registryRecord) return registryPresentationEntry(registryRecord);

  const offerId = SERVICE_OFFER_MAP[normalizedId] || normalizedId;
  return CATALOG_BY_ID.get(offerId) || null;
}

export function getPriceValue(serviceId) {
  const entry = getPricingEntry(serviceId);
  return typeof entry?.workingBaselineRate === 'number'
    ? entry.workingBaselineRate
    : null;
}

export function getPriceLabel(serviceId) {
  const entry = getPricingEntry(serviceId);
  if (!entry) return DEFAULT_PRICE_LABEL;
  if (entry.transactionType === 'CUSTOM_QUOTE') return 'Custom Quote';

  const formattedBaseline = formatCurrency(entry.workingBaselineRate);
  if (formattedBaseline) return formattedBaseline;
  if (entry.startingPrice) return entry.startingPrice;
  return DEFAULT_PRICE_LABEL;
}

export { formatCurrency };