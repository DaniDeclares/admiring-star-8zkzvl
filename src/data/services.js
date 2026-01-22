import { getStripeLink } from "../config/stripeLinks.js";
import { getPriceLabel } from "./pricingCanon.js";
import { SERVICES } from "./servicesCatalog.js";

export const travelFeeDefaults = {
  baseRadiusMiles: 10,
  mileageRate: 1.0,
  baseTravelFee: 25,
  note:
    "Travel fees are calculated round trip using Google mileage. The base travel fee covers the first 10 miles round trip.",
};

const bookingServiceData = [
  {
    id: "notary",
    title: "General Notary",
    shortDescription: "Mobile notarization for everyday documents and affidavits.",
    category: "notary",
    actionType: "book",
    tidycalSlug: "notary",
    priceLabel: "$35 per signature",
    paymentServiceId: "notary-payment",
  },
  {
    id: "loansigning",
    title: "Loan Signing",
    shortDescription:
      "Certified signing agent support for refinance, purchase, and seller packages.",
    category: "notary",
    actionType: "book",
    tidycalSlug: "loansigning",
    priceLabel: "Packages from $175",
    paymentServiceId: "loan-signing-payment",
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
    paymentServiceId: "apostille-payment",
  },
  {
    id: "officiant",
    title: "Wedding Officiant",
    shortDescription: "Elopements and ceremonies crafted to fit your story.",
    category: "weddings",
    actionType: "book",
    tidycalSlug: "officiant",
    priceLabel: "Packages from $200",
    paymentServiceId: "officiant-payment",
  },
];

const paymentServiceData = [
  {
    id: "notary-payment",
    title: "Notary Appointment Payment",
    shortDescription:
      "Complete payment to confirm your scheduled general notary appointment.",
    category: "payment",
    actionType: "pay",
    catalogKey: "mobile_notary",
    bookingServiceId: "notary",
  },
  {
    id: "loan-signing-payment",
    title: "Loan Signing Payment",
    shortDescription:
      "Confirm your loan signing appointment with secure payment.",
    category: "payment",
    actionType: "pay",
    catalogKey: "loan_signing",
    bookingServiceId: "loansigning",
  },
  {
    id: "apostille-payment",
    title: "Apostille Service Payment",
    shortDescription:
      "Finalize payment for your apostille facilitation appointment.",
    category: "payment",
    actionType: "pay",
    catalogKey: "apostille",
    bookingServiceId: "apostille",
  },
  {
    id: "officiant-payment",
    title: "Officiant Service Payment",
    shortDescription: "Reserve and confirm your officiant package with payment.",
    category: "payment",
    actionType: "pay",
    catalogKey: "officiant",
    bookingServiceId: "officiant",
  },
];

const buildPaymentService = (service) => {
  const catalogEntry = SERVICES[service.catalogKey] || {};

  return {
    ...service,
    price: catalogEntry.price ?? null,
    buyButtonId: catalogEntry.buyButtonId ?? null,
    stripePaymentLink:
      catalogEntry.payLinkUrl || getStripeLink(service.catalogKey),
    tidycalUrl: catalogEntry.tidycalUrl || null,
  };
};

export const bookingServices = bookingServiceData;
export const paymentServices = paymentServiceData.map(buildPaymentService);

export const services = [...bookingServices, ...paymentServices];

export const getServiceById = (serviceId) =>
  services.find((service) => service.id === serviceId);

export const serviceCatalog = [
  {
    id: "notary",
    name: "Mobile Notary",
    shortDesc:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    category: "Notary",
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

export const servicePages = {
  financial: [],
  legal: [],
  realEstate: [],
  weddings: [],
};

export const serviceBundles = [];

export const getServiceSections = (sections) => sections || [];
