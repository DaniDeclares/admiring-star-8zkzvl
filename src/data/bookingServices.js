import { STRIPE_LINKS } from "./stripeLinks.js";

const STRIPE_LINK_ALIASES = {
  loansigning: "loan_signing",
  officiant: "officiant_deposit",
};

const resolveStripeLink = (serviceId) => {
  const resolvedId = STRIPE_LINK_ALIASES[serviceId] || serviceId;
  return STRIPE_LINKS[resolvedId] ?? null;
};

export const bookingServices = [
  {
    id: "notary",
    name: "Mobile Notary",
    description:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    tidyCalPath: "danideclaresns/notary",
    paymentUrl: resolveStripeLink("notary"),
    payLabel: "Pay Notary Deposit",
  },
  {
    id: "apostille",
    name: "Apostille Facilitation",
    description:
      "Document authentication support with clear guidance for domestic and international use.",
    tidyCalPath: "danideclaresns/apostille",
    paymentUrl: resolveStripeLink("apostille"),
    payLabel: "Pay Apostille Deposit",
  },
  {
    id: "loansigning",
    name: "Loan Signing",
    description:
      "Certified signing agent support for purchase, refinance, and loan packages.",
    tidyCalPath: "danideclaresns/loansigning",
    paymentUrl: resolveStripeLink("loansigning"),
    payLabel: "Pay Loan Signing Deposit",
  },
  {
    id: "officiant",
    name: "Officiant Services",
    description:
      "Ceremony officiation for elopements, courthouse-style vows, and custom celebrations.",
    tidyCalPath: "danideclaresns/officiant",
    paymentUrl: resolveStripeLink("officiant"),
    payLabel: "Pay Officiant Deposit",
  },
];

export const getBookingServiceById = (serviceId) =>
  bookingServices.find((service) => service.id === serviceId);
