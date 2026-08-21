import { getCommercialRecord } from './commercialRegistry';

const ADMIN_STRIPE_LINKS = {
  printing_scanning: 'https://buy.stripe.com/7sYeVc8lXf1kfyn2CJ6kg1d',
  mobile_notary: 'https://buy.stripe.com/eVqeVcfOpdXgdqf3GN6kg1a',
  poa: process.env.REACT_APP_STRIPE_POA || 'https://buy.stripe.com/9B6aEWgStg5ocmbelr6kg15',
  i9: process.env.REACT_APP_STRIPE_I9 || 'https://buy.stripe.com/8x27sK1XzcTc85V2CJ6kg16',
  apostille: process.env.REACT_APP_STRIPE_APOSTILLE || 'https://buy.stripe.com/bJecN4eKl9H04TJ5OV6kg17',
  loan_signing: process.env.REACT_APP_STRIPE_LOAN_SIGNING_DEPOSIT || 'https://buy.stripe.com/6oU7sK45H4mGae3fpv6kg18',
  trust_signing: process.env.REACT_APP_STRIPE_TRUST_DEPOSIT || 'https://buy.stripe.com/28E4gy0Tv9H01Hx7X36kg19',
  process_serving: 'https://buy.stripe.com/14A00ifOp06q2LB2CJ6kg0O',
  court_courier: 'https://buy.stripe.com/eVq5kC45H5qKfyna5b6kg0N',
  digital_court_reporting: 'https://buy.stripe.com/bJe8wOeKl5qK0Dt1yF6kg0M',
  legal_doc_prep: 'https://buy.stripe.com/bJe8wOcCdf1k85V0uB6kg0Q',
  courier: process.env.REACT_APP_STRIPE_COURIER_DEPOSIT || '',
  officiant: process.env.REACT_APP_STRIPE_OFFICIANT_DEPOSIT || '',
};

export const STRIPE_LINKS = ADMIN_STRIPE_LINKS;
export { ADMIN_STRIPE_LINKS };

// Legacy UI keys are aliases only. Pricing is resolved by canonical serviceId.
export const SERVICE_ID_ALIASES = Object.freeze({
  mobile_notary: 'B2C-NOTARY-POA',
  poa: 'B2C-NOTARY-POA',
  loan_signing: 'B2C-NOTARY-LOAN',
  apostille: 'B2C-NOTARY-APOSTILLE',
});

export const isValidStripeUrl = (url) =>
  typeof url === 'string' && url.startsWith('https://');

export const getAdminStripeLink = (serviceKey) => STRIPE_LINKS[serviceKey] || '';

export const getCanonicalServiceId = (serviceKey) => {
  const candidate = SERVICE_ID_ALIASES[serviceKey] || serviceKey;
  return getCommercialRecord(candidate)?.serviceId || null;
};

// Public-facing routing never trusts a Stripe URL or client-supplied amount.
// It sends the canonical service ID to the controlled request/verification flow.
export const getStripeLink = (serviceKey) => {
  const serviceId = getCanonicalServiceId(serviceKey);
  if (!serviceId) return '/request-service';
  return `/request-service?service=${encodeURIComponent(serviceId)}`;
};
