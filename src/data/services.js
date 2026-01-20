import { getPriceLabel } from "./pricingCanon.js";
import { paymentLinks } from "./paymentLinks.js";

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
    name: "Mobile Notary",
    shortDesc:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    category: "Notary",
    priceLabel: getPriceLabel("notary"),
    stripePaymentLink: paymentLinks.notary || null,
    highlights: [
      "State-compliant notarial acts",
      "Evening & weekend availability",
      "Travel fee disclosed before service",
    ],
  },
  {
    id: "apostille",
    name: "Apostille Facilitation",
    shortDesc:
      "Document authentication support with clear guidance for domestic and international use.",
    category: "Apostille",
    priceLabel: getPriceLabel("apostille"),
    stripePaymentLink: paymentLinks.apostille || null,
    highlights: [
      "Step-by-step intake",
      "Drop-off coordination",
      "Status updates provided",
    ],
  },
  {
    id: "loansigning",
    name: "Loan Signing",
    shortDesc:
      "Certified signing agent support for purchase, refinance, and loan packages.",
    category: "Loan Signing",
    priceLabel: getPriceLabel("loansigning"),
    stripePaymentLink: paymentLinks.loansigning || null,
    highlights: [
      "NNA-certified signing agent",
      "Detailed document walkthroughs",
      "Scanbacks available on request",
    ],
  },
  {
    id: "officiant",
    name: "Officiant Services",
    shortDesc:
      "Ceremony officiation for elopements, courthouse-style vows, and custom celebrations.",
    category: "Officiant",
    priceLabel: getPriceLabel("officiant"),
    stripePaymentLink: paymentLinks.officiant || null,
    highlights: [
      "Personalized ceremony flow",
      "Support with filing guidance",
      "Travel coordination included",
    ],
  },
];

export const getServiceById = (serviceId) =>
  serviceCatalog.find((service) => service.id === serviceId);
