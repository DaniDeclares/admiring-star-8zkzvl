export const CANON = {
  poa: { type: "fixed", amount: 35, label: "$35" },
  i9: { type: "fixed", amount: 50, label: "$50" },
  apostille: { type: "fixed", amount: 175, label: "$175" },
  courier: { type: "rule", label: "$65+ / actual cost" },
  quote: { type: "quote", label: "Starting at / Quoted" },
};

export function getPriceLabel(serviceId) {
  if (serviceId === "courier") return CANON.courier.label;
  if (serviceId === "poa") return CANON.poa.label;
  if (serviceId === "i9") return CANON.i9.label;
  if (serviceId === "apostille") return CANON.apostille.label;
  return CANON.quote.label;
}
