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
    title: "Mobile Notary",
    shortDesc:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    category: "Notary",
    tidycalSlug: "danideclaresns/notary",
    stripePaymentLink: paymentLinks.notary,
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
    stripePaymentLink: paymentLinks.apostille,
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
    stripePaymentLink: paymentLinks.loansigning,
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
    stripePaymentLink: paymentLinks.officiant,
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
