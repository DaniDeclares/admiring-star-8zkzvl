 codex/redesign-danideclares.com-for-service-booking
import { paymentLinks } from "./paymentLinks.js";
=======
import { getPriceLabel } from "./pricingCanon.js";


export const travelFeeDefaults = {
  baseRadiusMiles: 10,
  mileageRate: 1.0,
  baseTravelFee: 25,
  note:
    "Travel fees are calculated round trip using Google mileage. The base travel fee covers the first 10 miles round trip.",
};

// Centralized service catalog derived from products.csv + prices.csv exports.
export const services = [
  {
    id: "notary",
codex/redesign-danideclares.com-for-service-booking
    title: "General Notary",
    shortDescription: "Mobile notarization for everyday documents and affidavits.",
    category: "notary",
    actionType: "book",
    tidycalSlug: "notary",
    priceLabel: "$35 per signature",
  },
  {
    id: "loan-signing",
    title: "Loan Signing",
    shortDescription:
      "Certified signing agent support for refinance, purchase, and seller packages.",
    category: "notary",
    actionType: "book",
    tidycalSlug: "loansigning",
    priceLabel: "Packages from $175",
  },
  {
    id: "apostille",
    title: "Apostille Facilitation",
    shortDescription:
      "Document authentication coordination for domestic and international use.",
    category: "notary",
    actionType: "book",
    tidycalSlug: "apostille",
    priceLabel: "Starting at $175",
  },
  {
    id: "officiant",
    title: "Wedding Officiant",
    shortDescription: "Elopements and ceremonies crafted to fit your story.",
    category: "weddings",
    actionType: "book",
    tidycalSlug: "officiant",
    priceLabel: "Packages from $200",
  },
  {
    id: "notary-payment",
    title: "Notary Appointment Payment",
    shortDescription:
      "Complete payment to confirm your scheduled general notary appointment.",
    category: "payment",
    actionType: "pay",
    stripePaymentLink: paymentLinks.notary.mobileNotaryVisit,
  },
  {
    id: "loan-signing-payment",
    title: "Loan Signing Payment",
    shortDescription:
      "Confirm your loan signing appointment with secure payment.",
    category: "payment",
    actionType: "pay",
    stripePaymentLink: paymentLinks.notary.loanSigningAgent,
  },
  {
    id: "apostille-payment",
    title: "Apostille Service Payment",
    shortDescription:
      "Finalize payment for your apostille facilitation appointment.",
    category: "payment",
    actionType: "pay",
    stripePaymentLink: paymentLinks.notary.apostilleFacilitation,
  },
  {
    id: "officiant-payment",
    title: "Officiant Service Payment",
    shortDescription:
      "Reserve and confirm your officiant package with payment.",
    category: "payment",
    actionType: "pay",
    stripePaymentLink: paymentLinks.weddings.simpleVows,
  },
];

export const bookingServices = services.filter(
  (service) => service.actionType === "book"
);

export const paymentServices = services.filter(
  (service) => service.actionType === "pay"
);

export const getServiceById = (serviceId) =>
  services.find((service) => service.id === serviceId);
=======
    name: "Mobile Notary",
    shortDesc:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    category: "Notary",
codex/make-service-pricing-compliance-safe
    priceLabel:
      "Mobile service fee from $25 + statutory act fee (GA $2/act, SC up to $5/act)",
=======
    tidycalSlug: "notary",
    priceLabel: getPriceLabel("notary"),
    highlights: [
      "State-compliant notarial acts",
      "Evening & weekend availability",
      "Travel fee disclosed before service",
      "Statutory act fees set by state law (GA $2/act, SC up to $5/act); mobile/service fees separate",
    ],
  },
  {
    id: "apostille",
    name: "Apostille Facilitation",
    shortDesc:
      "Document authentication support with clear guidance for domestic and international use.",
    category: "Apostille",
    tidycalSlug: "apostille",
    priceLabel: getPriceLabel("apostille"),
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
    tidycalSlug: "loansigning",
    priceLabel: getPriceLabel("loansigning"),
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
    tidycalSlug: "officiant",
    priceLabel: getPriceLabel("officiant"),
    highlights: [
      "Personalized ceremony flow",
      "Support with filing guidance",
      "Travel coordination included",
    ],
  },
];

export const getServiceById = (serviceId) =>
  serviceCatalog.find((service) => service.id === serviceId);
