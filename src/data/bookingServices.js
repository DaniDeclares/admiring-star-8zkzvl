import { paymentLinks } from "./paymentLinks.js";

export const bookingServices = [
  {
    id: "notary",
    name: "Mobile Notary",
    description: "On-site notarizations with flexible scheduling.",
    tidyCalPath: "danideclaresns/notary",
    paymentUrl: paymentLinks.notary,
    payLabel: "Pay Deposit",
  },
  {
    id: "apostille",
    name: "Apostille Facilitation",
    description: "Document authentication support and coordination.",
    tidyCalPath: "danideclaresns/apostille",
    paymentUrl: paymentLinks.apostille,
    payLabel: "Pay Deposit",
  },
  {
    id: "loansigning",
    name: "Loan Signing",
    description: "Certified signing agent support for loan packages.",
    tidyCalPath: "danideclaresns/loansigning",
    paymentUrl: paymentLinks.loansigning,
    payLabel: "Pay Deposit",
  },
  {
    id: "officiant",
    name: "Officiant Services",
    description: "Wedding and vow ceremony officiation with travel coordination.",
    tidyCalPath: "danideclaresns/officiant",
    paymentUrl: paymentLinks.officiant,
    payLabel: "Pay Deposit",
  },
];

export const getBookingServiceById = (serviceId) =>
  bookingServices.find((service) => service.id === serviceId);
