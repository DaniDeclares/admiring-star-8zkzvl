import { getPriceLabel } from "./pricingCanon.js";

export const travelFeeDefaults = {
  baseRadiusMiles: 10,
  mileageRate: 1.0,
  baseTravelFee: 25,
  note:
    "Travel fees are calculated round trip using Google mileage. The base travel fee covers the first 10 miles round trip.",
};

export const serviceCatalog = [
  {
    id: "notary",
    name: "Mobile Notary",
    shortDesc:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    category: "Notary",
    priceLabel:
      "Mobile service fee from $25 + statutory act fee (GA $2/act, SC up to $5/act)",
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
