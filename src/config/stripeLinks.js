export const STRIPE_LINKS = {
  printing_scanning: "https://buy.stripe.com/7sYeVc8lXf1kfyn2CJ6kg1d",
  mobile_notary: "https://buy.stripe.com/eVqeVcfOpdXgdqf3GN6kg1a",
  poa: process.env.REACT_APP_STRIPE_POA || "https://buy.stripe.com/9B6aEWgStg5ocmbelr6kg15",
  i9: process.env.REACT_APP_STRIPE_I9 || "https://buy.stripe.com/8x27sK1XzcTc85V2CJ6kg16",
  apostille:
    process.env.REACT_APP_STRIPE_APOSTILLE || "https://buy.stripe.com/bJecN4eKl9H04TJ5OV6kg17",
  loan_signing:
    process.env.REACT_APP_STRIPE_LOAN_SIGNING_DEPOSIT ||
    "https://buy.stripe.com/6oU7sK45H4mGae3fpv6kg18",
  trust_signing:
    process.env.REACT_APP_STRIPE_TRUST_DEPOSIT || "https://buy.stripe.com/28E4gy0Tv9H01Hx7X36kg19",
  process_serving: "https://buy.stripe.com/14A00ifOp06q2LB2CJ6kg0O",
  court_courier: "https://buy.stripe.com/eVq5kC45H5qKfyna5b6kg0N",
  digital_court_reporting: "https://buy.stripe.com/bJe8wOeKl5qK0Dt1yF6kg0M",
  legal_doc_prep: "https://buy.stripe.com/bJe8wOcCdf1k85V0uB6kg0Q",
  courier: process.env.REACT_APP_STRIPE_COURIER_DEPOSIT || "",
  officiant: process.env.REACT_APP_STRIPE_OFFICIANT_DEPOSIT || "",
};

export const isValidStripeUrl = (url) =>
  typeof url === "string" && url.startsWith("https://");

export const getStripeLink = (serviceKey) => STRIPE_LINKS[serviceKey] || "";
