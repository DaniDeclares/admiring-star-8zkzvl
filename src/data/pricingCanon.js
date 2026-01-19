import { PRICING_CANON } from "../config/pricingCanon.js";

const SERVICE_KEY_MAP = {
  advanced_legal: "advanced",
  federal_support: "advanced",
  loan_signing: "loansigning",
  trust_signing: "trust",
  officiant_deposit: "officiant",
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

  const canonKey = SERVICE_KEY_MAP[serviceId] || serviceId;
  const canonEntry = PRICING_CANON[canonKey];

  if (!canonEntry) {
    return "Starting at / Quoted";
  }

  return formatPrice(canonEntry.price);
}
