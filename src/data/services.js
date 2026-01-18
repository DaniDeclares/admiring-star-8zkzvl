export const travelFeeDefaults = {
  baseRadiusMiles: 10,
  mileageRate: 1.0,
  baseTravelFee: 25,
  note:
    "Travel fees are calculated round trip using Google mileage. The base travel fee covers the first 10 miles round trip.",
};

export const serviceCatalog = [
  {
    id: "notary",
    title: "General Notary",
    description: "Mobile notary appointments for everyday documents.",
    items: [
      {
        name: "General Notary (per signature)",
        price: "$35",
        details: "Additional signature same visit $10; witness provided $35 each.",
      },
    ],
  },
  {
    id: "loan-signing",
    title: "Loan & Real Estate Signing Packages",
    description: "Certified signing agent support for loan and real estate closings.",
    items: [
      { name: "Refi/Purchase/Seller/HELOC", price: "$175" },
      { name: "Reverse Mortgage", price: "$225" },
      { name: "Cash Signing", price: "$150" },
    ],
    addOns: [
      { name: "Scanbacks", price: "+$25" },
      { name: "Printing (up to 150 pages)", price: "$25" },
      { name: "Printing (151–300 pages)", price: "$40" },
    ],
  },
  {
    id: "apostille",
    title: "Apostille Facilitation",
    description: "Document authentication for domestic and international use.",
    items: [
      { name: "First document", price: "$175" },
      { name: "Each additional document", price: "+$35" },
      { name: "Rush service", price: "+$75–$150" },
    ],
  },
  {
    id: "fingerprinting",
    title: "Fingerprinting",
    description: "Mobile fingerprinting for employment, licensing, and compliance.",
    items: [
      { name: "Standard fingerprinting", price: "$50" },
      { name: "Additional cards/sets", price: "+$20" },
      { name: "Group (5+)", price: "$75 setup + $40/person" },
    ],
  },
  {
    id: "courier",
    title: "Courier Services",
    description: "Same-day document and key delivery across the metro area.",
    items: [
      { name: "Same-day local", price: "$65" },
      { name: "Rush service", price: "$95" },
      { name: "Per additional stop", price: "+$25" },
    ],
  },
  {
    id: "real-estate-support",
    title: "Real Estate Support",
    description: "On-demand support for agents, brokers, and transaction teams.",
    items: [
      { name: "Open house host (3 hours)", price: "$150" },
      { name: "Field inspection", price: "$95" },
      { name: "Lockbox/sign pickup-drop", price: "$50" },
      { name: "Transaction coordination", price: "$350–$500" },
    ],
  },
  {
    id: "officiant-services",
    title: "Officiant Services",
    description: "Wedding officiant packages for elopements and ceremonies.",
    items: [
      { name: "Elopement", price: "$200" },
      { name: "Courthouse-style ceremony", price: "$350" },
      { name: "Custom ceremony", price: "$500+" },
    ],
  },
];

export const serviceBundles = [
  {
    name: "Sign & Close Bundle",
    price: "$250",
    includes: "Loan signing + courier + scanbacks",
  },
  {
    name: "Notary Business Boost",
    price: "$250",
    includes: "Field inspection + I-9 + fingerprinting",
  },
];

export const servicePages = {
  notary: ["notary", "loan-signing", "apostille", "fingerprinting"],
  legal: ["courier"],
  realEstate: ["real-estate-support"],
  weddings: ["officiant-services"],
  packages: [
    "notary",
    "loan-signing",
    "apostille",
    "fingerprinting",
    "courier",
    "real-estate-support",
    "officiant-services",
  ],
};

export const getServiceSections = (ids) =>
  serviceCatalog.filter((section) => ids.includes(section.id));
