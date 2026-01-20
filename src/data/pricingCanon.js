import { PRICING_CANON } from "../config/pricingCanon.js";

const SERVICE_KEY_MAP = {
  loansigning: "loansigning",
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

  const canonKey = SERVICE_KEY_MAP[serviceId] || serviceId;
  const canonEntry = PRICING_CANON[canonKey];

  if (!canonEntry) {
    return "Starting at / Quoted";
  }

  return formatPrice(canonEntry.price);
}
