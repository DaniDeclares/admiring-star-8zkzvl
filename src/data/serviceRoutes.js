import { paymentLinks } from "./paymentLinks.js";

export const bookingPolicyText =
  "Your appointment is pending until payment is completed. Unpaid bookings may be released.";

export const serviceRoutes = [
  {
    id: "notary",
    title: "Mobile Notary",
    shortDesc: "On-site notarizations for everyday documents and affidavits.",
    category: "Notary",
    bookingEmbedPath: "danideclaresns/notary",
    stripePaymentLink: paymentLinks?.notary?.mobileNotaryVisit,
    primaryActionType: "book",
  },
  {
    id: "apostille",
    title: "Apostille Facilitation",
    shortDesc: "Document authentication support for domestic and international use.",
    category: "Notary",
    bookingEmbedPath: "danideclaresns/apostille",
    stripePaymentLink: paymentLinks?.notary?.apostilleFacilitation,
    primaryActionType: "book",
  },
  {
    id: "officiant",
    title: "Officiant Services",
    shortDesc: "Personalized wedding ceremonies, elopements, and vow renewals.",
    category: "Weddings",
    bookingEmbedPath: "danideclaresns/officiant",
    stripePaymentLink: paymentLinks?.weddings?.courthouseStyle,
    primaryActionType: "book",
  },
  {
    id: "loansigning",
    title: "Loan Signing",
    shortDesc: "Certified signing agent support for real estate closings.",
    category: "Notary",
    bookingEmbedPath: "danideclaresns/loansigning",
    stripePaymentLink: paymentLinks?.notary?.loanSigningAgent,
    primaryActionType: "book",
  },
  {
    id: "fingerprinting",
    title: "Fingerprinting",
    shortDesc: "Mobile fingerprinting for employment, licensing, and compliance.",
    category: "Support",
    stripePaymentLink: paymentLinks?.notary?.mobileFingerprinting,
    primaryActionType: "pay",
  },
  {
    id: "courier",
    title: "Courier Services",
    shortDesc: "Same-day document and key delivery across the metro area.",
    category: "Support",
    stripePaymentLink: "",
    primaryActionType: "pay",
  },
  {
    id: "real-estate-support",
    title: "Real Estate Support",
    shortDesc: "Field inspections, open house coverage, and transaction support.",
    category: "Real Estate",
    stripePaymentLink: "",
    primaryActionType: "pay",
  },
];

export const bookingServiceIds = [
  "notary",
  "apostille",
  "officiant",
  "loansigning",
];

export const bookingServices = serviceRoutes.filter((service) =>
  bookingServiceIds.includes(service.id)
);

export const getServiceById = (id) =>
  serviceRoutes.find((service) => service.id === id);

export const buildServiceActionPath = (service) =>
  service.primaryActionType === "pay"
    ? `/pay?service=${service.id}`
    : `/book?service=${service.id}`;
