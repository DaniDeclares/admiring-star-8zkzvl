import { MASTER_CATALOG_2026 } from './masterCatalog2026.js';

const SERVICE_OFFER_MAP = {
  notary: '01-NOT',
  mobile_notary: '01-NOT',
  loansigning: '01-LON',
  loan_signing: '01-LON',
  trust: '01-LON',
  trust_signing: '01-LON',
  apostille: '01-APO',
  officiant: '02-WED',
};

const formatPrice = (entry) => {
  if (!entry) return 'Starting at / Quoted';

  if (typeof entry.workingBaselineRate === 'number') {
    return `$${entry.workingBaselineRate}`;
  }

  if (entry.startingPrice) {
    return entry.startingPrice;
  }

  return 'Starting at / Quoted';
};

export function getPriceLabel(serviceId) {
  if (!serviceId) return 'Starting at / Quoted';

  const offerId = SERVICE_OFFER_MAP[serviceId] || serviceId;
  const catalogEntry = MASTER_CATALOG_2026.find((entry) => entry.offerId === offerId);

  return formatPrice(catalogEntry);
}

export { SERVICE_OFFER_MAP };
