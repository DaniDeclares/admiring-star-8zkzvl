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
  {
    id: "process-serving-payment",
    title: "Process Serving Payment",
    shortDescription:
      "Submit payment for process serving and case-related document delivery.",
    category: "payment",
    actionType: "pay",
    catalogKey: "process_serving",
    bookingServiceId: "notary",
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
      "On-site notarizations for personal, legal, and business documents with flexible scheduling.",
    category: "Notary",
    tidycalSlug: "notary",
    priceLabel: getPriceLabel("notary"),
    bookingServiceId: "notary",
    paymentServiceId: "notary-payment",
    group: "general-notary",
  },
  {
    id: "apostille",
    name: "Apostille Facilitation",
    shortDesc:
      "Document authentication support with clear guidance for domestic and international use.",
    category: "Apostille",
    tidycalSlug: "apostille",
    priceLabel: getPriceLabel("apostille"),
    bookingServiceId: "apostille",
    paymentServiceId: "apostille-payment",
    group: "apostille-auth",
  },
  {
    id: "loansigning",
    name: "Loan Signing",
    shortDesc:
      "Certified signing agent support for purchase, refinance, and loan packages.",
    category: "Loan Signing",
    tidycalSlug: "loansigning",
    priceLabel: getPriceLabel("loansigning"),
    bookingServiceId: "loansigning",
    paymentServiceId: "loan-signing-payment",
    group: "tax-legal",
  },
  {
    id: "courier-field",
    name: "Courier & Field Support",
    shortDesc:
      "Court runs, document drops, and field support handled with clear pickup and delivery updates.",
    category: "Courier/Field",
    tidycalSlug: "notary",
    bookingServiceId: "notary",
    paymentServiceId: "notary-payment",
    group: "tax-legal",
  },
  {
    id: "facility-visits",
    name: "Facility Visits",
    shortDesc:
      "Mobile notary visits for hospitals, nursing homes, detention centers, and care facilities.",
    category: "Facility Visits",
    tidycalSlug: "notary",
    bookingServiceId: "notary",
    paymentServiceId: "notary-payment",
    group: "general-notary",
  },
  {
    id: "school-family",
    name: "School & Family Documentation",
    shortDesc:
      "Notarization for school enrollment, travel consent, guardianship, and family affidavits.",
    category: "School/Family",
    tidycalSlug: "notary",
    bookingServiceId: "notary",
    paymentServiceId: "notary-payment",
    group: "school-family",
  },
  {
    id: "i9-admin",
    name: "I-9 & Administrative Support",
    shortDesc:
      "Employer I-9 verification and administrative document assistance for HR teams.",
    category: "I-9/Admin",
    tidycalSlug: "notary",
    bookingServiceId: "notary",
    paymentServiceId: "notary-payment",
    group: "employer-admin",
  },
  {
    id: "officiant",
    name: "Officiant Services",
    shortDesc:
      "Ceremony officiation for elopements, courthouse-style vows, and custom celebrations.",
    category: "Officiant",
    tidycalSlug: "officiant",
    priceLabel: getPriceLabel("officiant"),
    bookingServiceId: "officiant",
    paymentServiceId: "officiant-payment",
    group: "school-family",
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
