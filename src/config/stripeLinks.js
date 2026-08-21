import { getCommercialRecord } from './commercialRegistry';

// Stripe Payment Links are reconciliation/execution artifacts and must not be
// embedded in the public React bundle. Customer-facing navigation goes through
// the governed commercial-intent gate instead.
export const SERVICE_ID_ALIASES = Object.freeze({
  poa: 'B2C-NOTARY-POA',
  apostille: 'B2C-NOTARY-APOSTILLE',
  loan_signing: 'B2C-NOTARY-LOAN',
  i9: 'B2B-ADM-I9',
  mobile_notary: 'B2C-NOTARY-WITNESS',
  administrative_support: 'B2B-ADM-NOTICE',
});

export const getCanonicalServiceId = (serviceKey) => {
  const candidate = SERVICE_ID_ALIASES[serviceKey] || serviceKey;
  return getCommercialRecord(candidate)?.serviceId || null;
};

export const getStripeLink = (serviceKey) => {
  const serviceId = getCanonicalServiceId(serviceKey);
  if (!serviceId) return '/request-service';
  return `/request-service?service=${encodeURIComponent(serviceId)}`;
};

// Backward-compatible helpers. They intentionally return the governed intake
// route rather than a raw buy.stripe.com URL.
export const getAdminStripeLink = getStripeLink;
export const isValidStripeUrl = (url) => typeof url === 'string' && url.startsWith('/request-service');
