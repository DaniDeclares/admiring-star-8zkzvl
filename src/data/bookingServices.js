export const bookingServices = [
  {
    id: "notary",
    name: "Mobile Notary",
    description: "On-site notarizations with flexible scheduling.",
    tidyCalPath: "danideclaresns/notary",
    payServiceKey: "mobile_notary",
    payLabel: "Pay Deposit",
  },
  {
    id: "apostille",
    name: "Apostille Facilitation",
    description: "Document authentication support and coordination.",
    tidyCalPath: "danideclaresns/apostille",
    payServiceKey: "apostille",
    payLabel: "Pay Deposit",
  },
  {
    id: "loansigning",
    name: "Loan Signing",
    description: "Certified signing agent support for loan packages.",
    tidyCalPath: "danideclaresns/loansigning",
    payServiceKey: "loan_signing",
    payLabel: "Pay Deposit",
  },
  {
    id: "officiant",
    name: "Officiant Services",
    description: "Wedding and vow ceremony officiation with travel coordination.",
    tidyCalPath: "danideclaresns/officiant",
    payLabel: "Pay Deposit",
  },
];

export const getBookingServiceById = (serviceId) =>
  bookingServices.find((service) => service.id === serviceId);
