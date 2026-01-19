import { paymentLinks } from "./paymentLinks.js";

export const bookingServices = [
  {
    id: "notary",
    name: "Mobile Notary",
    description:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    tidyCalPath: "danideclaresns/notary",
    paymentUrl: paymentLinks.notary,
    payLabel: "Pay Notary Deposit",
  },
  {
    id: "apostille",
    name: "Apostille Facilitation",
    description:
      "Document authentication support with clear guidance for domestic and international use.",
    tidyCalPath: "danideclaresns/apostille",
    paymentUrl: paymentLinks.apostille,
    payLabel: "Pay Apostille Deposit",
  },
  {
    id: "loansigning",
    name: "Loan Signing",
    description:
      "Certified signing agent support for purchase, refinance, and loan packages.",
    tidyCalPath: "danideclaresns/loansigning",
    paymentUrl: paymentLinks.loansigning,
    payLabel: "Pay Loan Signing Deposit",
  },
  {
    id: "officiant",
    name: "Officiant Services",
    description:
      "Ceremony officiation for elopements, courthouse-style vows, and custom celebrations.",
    tidyCalPath: "danideclaresns/officiant",
    paymentUrl: paymentLinks.officiant,
    payLabel: "Pay Officiant Deposit",
  },
];

export const getBookingServiceById = (serviceId) =>
  bookingServices.find((service) => service.id === serviceId);
