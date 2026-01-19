export const STRIPE_LINKS = {
  poa: process.env.REACT_APP_STRIPE_POA || "",
  i9: process.env.REACT_APP_STRIPE_I9 || "",
  apostille: process.env.REACT_APP_STRIPE_APOSTILLE || "",
  officiant_deposit:
    process.env.REACT_APP_STRIPE_OFFICIANT_DEPOSIT ||
    "https://buy.stripe.com/aFa7sKdGhcTc71Rfpv6kg14",
};
