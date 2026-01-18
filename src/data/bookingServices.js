import { paymentLinks } from "./paymentLinks.js";

export const bookingServices = [
  {
    id: "notary",
    name: "Mobile Notary",
    description:
      "General notarizations at your home, office, or preferred location.",
    tidyCalPath: "danideclaresns/notary",
    paymentUrl: paymentLinks.notary.mobileNotaryVisit,
    payLabel: "Pay for Mobile Notary",
  },
  {
    id: "apostille",
    name: "Apostille",
    description:
      "Apostille intake and drop-off coordination with clear next steps.",
    tidyCalPath: "danideclaresns/apostille",
    paymentUrl: paymentLinks.notary.apostilleFacilitation,
    payLabel: "Pay for Apostille",
  },
  {
    id: "officiant",
    name: "Officiant",
    description:
      "Wedding officiant services for elopements, courthouse-style, or custom ceremonies.",
    tidyCalPath: "danideclaresns/officiant",
    paymentUrl: paymentLinks.weddings.simpleVows,
    payLabel: "Pay for Officiant Services",
  },
  {
    id: "loansigning",
    name: "Loan Signing",
    description:
      "Loan signing appointments for real estate closings and loan packages.",
    tidyCalPath: "danideclaresns/loansigning",
    paymentUrl: paymentLinks.notary.loanSigningAgent,
    payLabel: "Pay for Loan Signing",
  },
];

export const pendingPaymentNotice =
  "Your appointment is pending until payment is completed. Unpaid bookings are released.";

export const availabilityPolicy =
  "Same-day, after-hours, and weekend appointments incur additional fees and are confirmed based on availability.";

export const calendarPolicy =
  "All services book against the same primary calendar. Please keep only the four booking types listed here enabled publicly to reduce double-booking.";

export const getBookingServiceById = (serviceId) =>
  bookingServices.find((service) => service.id === serviceId);
