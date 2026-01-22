import { SERVICES } from "./servicesCatalog.js";

const SERVICE_KEY_MAP = {
  notary: "mobile_notary",
  loansigning: "loan_signing",
  loan_signing: "loan_signing",
  trust: "trust_signing",
  trust_signing: "trust_signing",
  officiant: "officiant",
};

const formatPrice = (price) => {
  if (typeof price === "number") {
    return `$${price}`;
  }

  return price;
};

export function getPriceLabel(serviceId) {
  if (!serviceId) {
    return "Starting at / Quoted";
  }

  const catalogKey = SERVICE_KEY_MAP[serviceId] || serviceId;
  const catalogEntry = SERVICES[catalogKey];

  if (!catalogEntry) {
    return "Starting at / Quoted";
  }

  return formatPrice(catalogEntry.price);
}
