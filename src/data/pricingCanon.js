export const CANON_PRICES = {
  poa: 35,
  i9: 50,
  apostille: 175,
  courier: "COURIER",
  advanced_legal: "QUOTE",
  federal_support: "QUOTE",
};

export const getDisplayPrice = (serviceId) => {
  const price = CANON_PRICES[serviceId];

  if (typeof price === "number") {
    return `$${price}`;
  }

  if (price === "COURIER") {
    return "$65+ / actual cost";
  }

  if (price === "QUOTE") {
    return "Starting at / Quoted";
  }

  return "";
};
