export function getPriceLabel(serviceId) {
  switch (serviceId) {
    case "poa":
      return "$35";
    case "i9":
      return "$50";
    case "apostille":
      return "$175";
    case "loan_signing":
      return "$150";
    case "trust_signing":
      return "$150";
    case "courier":
      return "$65+ / actual cost";
    default:
      return "Starting at / Quoted";
  }
}
