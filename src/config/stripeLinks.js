export const STRIPE_LINKS = {
  // Full price links
  poa: process.env.REACT_APP_STRIPE_POA || "",
  i9: process.env.REACT_APP_STRIPE_I9 || "",
  apostille: process.env.REACT_APP_STRIPE_APOSTILLE || "",

  // Deposit links
  loansigning: process.env.REACT_APP_STRIPE_LOAN_SIGNING_DEPOSIT || "",
  trust: process.env.REACT_APP_STRIPE_TRUST_DEPOSIT || "",
  officiant: process.env.REACT_APP_STRIPE_OFFICIANT_DEPOSIT || "",

  // Optional
  courier: process.env.REACT_APP_STRIPE_COURIER_DEPOSIT || "",
};
