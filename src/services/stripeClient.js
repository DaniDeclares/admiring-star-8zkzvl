// filename: src/services/stripeClient.js
// DANI DECLARES LLC — STRIPE CLIENT-SIDE PUBLISHABLE KEY INITIALIZER

import { loadStripe } from '@stripe/stripe-js';

// Stripe Live Publishable Key (Public key for client-side checkout initiation)
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RSlaPChHm1uJK9x3849mIe5jWAx3ta194CU6Gexn4Dfo5WBtsVSrkgt7G9PvTofvqgQousBFcZKDkUl4P4VDjoO00nVt1xlAS';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
