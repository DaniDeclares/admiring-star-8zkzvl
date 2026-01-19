import { serviceCatalog } from "./services.js";

export const bookingServices = serviceCatalog.filter(
  (service) => service.actionType === "book"
);

export const getBookingServiceById = (serviceId) =>
  bookingServices.find((service) => service.id === serviceId);
