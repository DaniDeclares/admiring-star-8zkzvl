import { getPriceLabel } from "./pricingCanon.js";
import { STRIPE_LINKS } from "./stripeLinks.js";

const STRIPE_LINK_ALIASES = {
  loansigning: "loan_signing",
  officiant: "officiant_deposit",
};

const resolveStripeLink = (serviceId) => {
  const resolvedId = STRIPE_LINK_ALIASES[serviceId] || serviceId;
  return STRIPE_LINKS[resolvedId] ?? null;
};

export const travelFeeDefaults = {
  baseRadiusMiles: 10,
  mileageRate: 1.0,
  baseTravelFee: 25,
  note:
    "Travel fees are calculated round trip using Google mileage. The base travel fee covers the first 10 miles round trip.",
};

export const notaryFeeDisclaimer =
  "Notary fees are set by state law ($10 per notarial act in GA, $5 per notarial act in SC). Mobile travel and convenience fees apply and are disclosed before service.";

export const serviceCatalog = [
  {
    id: "notary",
    title: "Mobile Notary",
    shortDesc:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    category: "Notary",
    tidycalSlug: "danideclaresns/notary",
    priceLabel: getPriceLabel("notary"),
    stripePaymentLink: resolveStripeLink("notary"),
    actionLabels: {
      book: "Book Notary",
      pay: "Pay to Confirm (Deposit)",
    },
    highlights: [
      "State-compliant notarial acts",
      "Evening & weekend availability",
      "Travel fee disclosed before service",
    ],
  },
  {
    id: "apostille",
    title: "Apostille Facilitation",
    shortDesc:
      "Document authentication support with clear guidance for domestic and international use.",
    category: "Apostille",
    tidycalSlug: "danideclaresns/apostille",
    priceLabel: getPriceLabel("apostille"),
    stripePaymentLink: resolveStripeLink("apostille"),
    actionLabels: {
      book: "Book Apostille",
      pay: "Pay to Confirm (Deposit)",
    },
    highlights: [
      "Step-by-step intake",
      "Drop-off coordination",
      "Status updates provided",
    ],
  },
  {
    id: "loansigning",
    title: "Loan Signing",
    shortDesc:
      "Certified signing agent support for purchase, refinance, and loan packages.",
    category: "Loan Signing",
    tidycalSlug: "danideclaresns/loansigning",
    priceLabel: getPriceLabel("loansigning"),
    stripePaymentLink: resolveStripeLink("loansigning"),
    actionLabels: {
      book: "Book Loan Signing",
      pay: "Pay to Confirm (Deposit)",
    },
    highlights: [
      "NNA-certified signing agent",
      "Detailed document walkthroughs",
      "Scanbacks available on request",
    ],
  },
  {
    id: "officiant",
    title: "Officiant Services",
    shortDesc:
      "Ceremony officiation for elopements, courthouse-style vows, and custom celebrations.",
    category: "Officiant",
    tidycalSlug: "danideclaresns/officiant",
    priceLabel: getPriceLabel("officiant"),
    stripePaymentLink: resolveStripeLink("officiant"),
    actionLabels: {
      book: "Book Officiant",
      pay: "Pay to Confirm (Deposit)",
    },
    highlights: [
      "Personalized ceremony flow",
      "Support with filing guidance",
      "Travel coordination included",
    ],
  },
];

export const getServiceById = (serviceId) =>
  serviceCatalog.find((service) => service.id === serviceId);

export const paymentServices = [
  {
    id: "officiant_deposit",
    name: "Officiant Deposit",
    description: "Deposit to confirm officiant services and ceremony support.",
    bookingServiceId: "officiant",
    priceLabel: getPriceLabel("officiant_deposit"),
    stripePaymentLink: resolveStripeLink("officiant_deposit"),
  },
  {
    id: "notary",
    name: "Mobile Notary",
    description:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    bookingServiceId: "notary",
    priceLabel: getPriceLabel("notary"),
    stripePaymentLink: resolveStripeLink("notary"),
  },
  {
    id: "poa",
    name: "Power of Attorney (POA) Notarization",
    description: "Notary support for power of attorney document execution.",
    priceLabel: getPriceLabel("poa"),
    stripePaymentLink: resolveStripeLink("poa"),
  },
  {
    id: "i9",
    name: "I-9 Employment Verification",
    description: "Authorized representative service for I-9 employment verification.",
    priceLabel: getPriceLabel("i9"),
    stripePaymentLink: resolveStripeLink("i9"),
  },
  {
    id: "apostille",
    name: "Apostille Facilitation",
    description:
      "Document authentication support with clear guidance for domestic and international use.",
    bookingServiceId: "apostille",
    priceLabel: getPriceLabel("apostille"),
    stripePaymentLink: resolveStripeLink("apostille"),
  },
  {
    id: "loan_signing",
    name: "Loan Signing",
    description:
      "Certified signing agent support for purchase, refinance, and loan packages.",
    bookingServiceId: "loansigning",
    priceLabel: getPriceLabel("loan_signing"),
    stripePaymentLink: resolveStripeLink("loan_signing"),
  },
  {
    id: "trust_signing",
    name: "Trust Signing",
    description: "Support for trust signing appointments and document execution.",
    priceLabel: getPriceLabel("trust_signing"),
    stripePaymentLink: resolveStripeLink("trust_signing"),
  },
  {
    id: "courier",
    name: "Courier & Court Runs",
    description: "Document courier, court filings, and delivery coordination.",
    priceLabel: getPriceLabel("courier"),
    stripePaymentLink: resolveStripeLink("courier"),
  },
];

const PAYMENT_SERVICE_ALIASES = {
  officiant: "officiant_deposit",
  loansigning: "loan_signing",
};

export const getPaymentServiceById = (serviceId) => {
  if (!serviceId) return undefined;
  const resolvedId = PAYMENT_SERVICE_ALIASES[serviceId] || serviceId;
  return paymentServices.find((service) => service.id === resolvedId);
};
