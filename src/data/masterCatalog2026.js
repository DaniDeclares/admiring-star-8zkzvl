// filename: src/data/masterCatalog2026.js
// DANI DECLARES LLC — 2026 LOCKED MASTER COMMERCIAL CATALOG

export const TRANSACTION_TYPES = {
  FIXED_PRICE: "FIXED_PRICE",
  STARTING_AT: "STARTING_AT",
  CUSTOM_QUOTE: "CUSTOM_QUOTE",
  DEPOSIT: "DEPOSIT",
  REQUEST_BOOK: "REQUEST_BOOK",
  CONTRACT_PROCUREMENT: "CONTRACT_PROCUREMENT"
};

export const PRICING_MODELS = {
  B2C_RETAIL: "B2C_RETAIL",
  B2B_VOLUME: "B2B_VOLUME",
  B2B2C_RESIDENT_PERK: "B2B2C_RESIDENT_PERK",
  B2G_PROCUREMENT: "B2G_PROCUREMENT",
  CUSTOM_PROJECT: "CUSTOM_PROJECT"
};

export const CHANNELS = {
  DIRECT_B2C: "01 DIRECT (B2C)",
  BUSINESS_B2B: "02 BUSINESS (B2B)",
  COMMUNITY_B2B2C: "03 COMMUNITY (B2B2C)",
  GOVERNMENT_B2G: "04 GOVERNMENT (B2G)"
};

export const catalog = [
  // 01 — HANDLE (DANI DECLARES OPERATIONS)
  {
    offerId: "01-ADM",
    offerName: "Administrative Execution Support",
    pillar: "01 HANDLE",
    department: "DANI DECLARES OPERATIONS",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C, CHANNELS.GOVERNMENT_B2G],
    customerTypes: ["BUSINESS", "COMMUNITY", "GOVERNMENT"],
    transactionType: TRANSACTION_TYPES.CUSTOM_QUOTE,
    workingBaselineRate: 45.00,
    unit: "Per Hour",
    startingPrice: "5.00 / hr",
    wholesaleCost: 0.00,
    grossMargin: "100%",
    status: "LOCKED_2026"
  },
  {
    offerId: "01-DOC",
    offerName: "Non-Attorney Doc Prep",
    pillar: "01 HANDLE",
    department: "DANI DECLARES OPERATIONS",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.GOVERNMENT_B2G],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 75.00,
    unit: "Per Package",
    startingPrice: "5.00 / pkg",
    wholesaleCost: 5.00,
    grossMargin: "93.3%",
    status: "LOCKED_2026"
  },
  {
    offerId: "01-NOT",
    offerName: "Mobile Notary Public Visit",
    pillar: "01 HANDLE",
    department: "DANI DECLARES OPERATIONS",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C, CHANNELS.GOVERNMENT_B2G],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 50.00,
    unit: "Per Visit",
    startingPrice: "0.00 (3 sigs / 20 mi)",
    wholesaleCost: 0.00,
    grossMargin: "100%",
    status: "LOCKED_2026"
  },
  {
    offerId: "01-LON",
    offerName: "Loan Signing Package",
    pillar: "01 HANDLE",
    department: "DANI DECLARES OPERATIONS",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.DIRECT_B2C],
    customerTypes: ["BUSINESS", "DIRECT"],
    transactionType: TRANSACTION_TYPES.FIXED_PRICE,
    workingBaselineRate: 150.00,
    unit: "Per Signing Package",
    startingPrice: "50.00",
    wholesaleCost: 12.00,
    grossMargin: "92.0%",
    status: "LOCKED_2026"
  },
  {
    offerId: "01-I9V",
    offerName: "Remote I-9 Verification",
    pillar: "01 HANDLE",
    department: "DANI DECLARES OPERATIONS",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.GOVERNMENT_B2G],
    customerTypes: ["BUSINESS", "GOVERNMENT"],
    transactionType: TRANSACTION_TYPES.FIXED_PRICE,
    workingBaselineRate: 50.00,
    unit: "Per Visit",
    startingPrice: "0.00 / visit",
    wholesaleCost: 0.00,
    grossMargin: "100%",
    status: "LOCKED_2026"
  },
  {
    offerId: "01-APO",
    offerName: "Expedited Apostille",
    pillar: "01 HANDLE",
    department: "DANI DECLARES OPERATIONS",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 175.00,
    unit: "Per Document Package",
    startingPrice: "75.00",
    wholesaleCost: 15.00,
    grossMargin: "91.4%",
    status: "LOCKED_2026"
  },

  // 02 — PREPARE (DANI DECLARES PROPERTY & EVENTS)
  {
    offerId: "02-TO1",
    offerName: "Multi-Family Turnover (1BR)",
    pillar: "02 PREPARE",
    department: "DANI DECLARES PROPERTY",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["COMMUNITY", "BUSINESS"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 250.00,
    unit: "Per Unit",
    startingPrice: "50.00",
    wholesaleCost: 150.00,
    grossMargin: "40% Platform Fee",
    status: "LOCKED_2026"
  },
  {
    offerId: "02-TO2",
    offerName: "Multi-Family Turnover (2BR)",
    pillar: "02 PREPARE",
    department: "DANI DECLARES PROPERTY",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["COMMUNITY", "BUSINESS"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 350.00,
    unit: "Per Unit",
    startingPrice: "50.00",
    wholesaleCost: 210.00,
    grossMargin: "40% Platform Fee",
    status: "LOCKED_2026"
  },
  {
    offerId: "02-TO3",
    offerName: "Multi-Family Turnover (3BR)",
    pillar: "02 PREPARE",
    department: "DANI DECLARES PROPERTY",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["COMMUNITY", "BUSINESS"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 450.00,
    unit: "Per Unit",
    startingPrice: "50.00",
    wholesaleCost: 270.00,
    grossMargin: "40% Platform Fee",
    status: "LOCKED_2026"
  },
  {
    offerId: "02-STR",
    offerName: "STR / Airbnb Turnover",
    pillar: "02 PREPARE",
    department: "DANI DECLARES PROPERTY",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["BUSINESS"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 125.00,
    unit: "Per Turnover",
    startingPrice: "25.00 / turn",
    wholesaleCost: 75.00,
    grossMargin: "40% Platform Fee",
    status: "LOCKED_2026"
  },
  {
    offerId: "02-RES",
    offerName: "Residential Deep Cleaning",
    pillar: "02 PREPARE",
    department: "DANI DECLARES PROPERTY",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["DIRECT", "COMMUNITY"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 200.00,
    unit: "Per Home",
    startingPrice: "00.00 / home",
    wholesaleCost: 120.00,
    grossMargin: "40% Platform Fee",
    status: "LOCKED_2026"
  },
  {
    offerId: "02-ELO",
    offerName: "Pop-Up Elopement Officiant",
    pillar: "02 PREPARE",
    department: "DANI DECLARES EVENTS",
    customerChannels: [CHANNELS.DIRECT_B2C],
    customerTypes: ["DIRECT"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 99.00,
    unit: "Per Ceremony",
    startingPrice: "9.00 local / 50.00 travel",
    wholesaleCost: 0.00,
    grossMargin: "100%",
    status: "LOCKED_2026"
  },
  {
    offerId: "02-WED",
    offerName: "Full Wedding Officiant",
    pillar: "02 PREPARE",
    department: "DANI DECLARES EVENTS",
    customerChannels: [CHANNELS.DIRECT_B2C],
    customerTypes: ["DIRECT"],
    transactionType: TRANSACTION_TYPES.FIXED_PRICE,
    workingBaselineRate: 199.00,
    unit: "Per Wedding",
    startingPrice: "99.00",
    wholesaleCost: 0.00,
    grossMargin: "100%",
    status: "LOCKED_2026"
  },

  // 03 — CREATE (DANI DECLARES CREATIVE)
  {
    offerId: "03-APP",
    offerName: "Custom Heat-Press Apparel",
    pillar: "03 CREATE",
    department: "DANI DECLARES CREATIVE",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C, CHANNELS.GOVERNMENT_B2G],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.DEPOSIT,
    workingBaselineRate: 98.00, // Est 4-shirt minimum run
    unit: "Per Order",
    startingPrice: "50% Deposit Required",
    wholesaleCost: 12.00, // .50 Blank + .50 Film per unit
    grossMargin: "65% Avg Margin",
    status: "LOCKED_2026"
  },
  {
    offerId: "03-TUM",
    offerName: "Sublimated 20 oz Tumbler",
    pillar: "03 CREATE",
    department: "DANI DECLARES CREATIVE",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.DEPOSIT,
    workingBaselineRate: 48.00, // Est 2-tumbler run
    unit: "Per Order",
    startingPrice: "50% Deposit Required",
    wholesaleCost: 5.00, // .20 Blank + /usr/bin/bash.80 Ink per unit
    grossMargin: "79.2% Avg Margin",
    status: "LOCKED_2026"
  },
  {
    offerId: "03-LBL",
    offerName: "Custom Packaging Labels",
    pillar: "03 CREATE",
    department: "DANI DECLARES CREATIVE",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 45.00,
    unit: "Per Roll",
    startingPrice: "5.00 / roll",
    wholesaleCost: 14.00,
    grossMargin: "68.8%",
    status: "LOCKED_2026"
  },

  // 04 — CONNECT (DANI DECLARES SMART)
  {
    offerId: "04-NFC",
    offerName: "SmartTap™ Business Card",
    pillar: "04 CONNECT",
    department: "DANI DECLARES SMART",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.FIXED_PRICE,
    workingBaselineRate: 49.00,
    unit: "Per Card",
    startingPrice: "9.00",
    wholesaleCost: 4.50,
    grossMargin: "90.8%",
    status: "LOCKED_2026"
  },
  {
    offerId: "04-GCR",
    offerName: "Smart Google Review Stand",
    pillar: "04 CONNECT",
    department: "DANI DECLARES SMART",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["BUSINESS"],
    transactionType: TRANSACTION_TYPES.FIXED_PRICE,
    workingBaselineRate: 49.00,
    unit: "Per Stand",
    startingPrice: "9.00",
    wholesaleCost: 6.00,
    grossMargin: "87.7%",
    status: "LOCKED_2026"
  },
  {
    offerId: "04-TAG",
    offerName: "Smart Property Tag Set",
    pillar: "04 CONNECT",
    department: "DANI DECLARES SMART",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["BUSINESS"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 75.00,
    unit: "5-pk Set",
    startingPrice: "5.00 / 5-pk",
    wholesaleCost: 8.00,
    grossMargin: "89.3%",
    status: "LOCKED_2026"
  },

  // 05 — SUPPLY (DANI DECLARES BUSINESS & MARKET)
  {
    offerId: "05-STU",
    offerName: "Startup Infrastructure Kit",
    pillar: "05 SUPPLY",
    department: "DANI DECLARES BUSINESS",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.DIRECT_B2C],
    customerTypes: ["BUSINESS"],
    transactionType: TRANSACTION_TYPES.FIXED_PRICE,
    workingBaselineRate: 199.00,
    unit: "Per Kit",
    startingPrice: "99.00",
    wholesaleCost: 31.50,
    grossMargin: "84.1%",
    status: "LOCKED_2026"
  },
  {
    offerId: "05-SOP",
    offerName: "SOP Manual & Checklists",
    pillar: "05 SUPPLY",
    department: "DANI DECLARES BUSINESS",
    customerChannels: [CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C, CHANNELS.GOVERNMENT_B2G],
    customerTypes: ["BUSINESS", "GOVERNMENT"],
    transactionType: TRANSACTION_TYPES.STARTING_AT,
    workingBaselineRate: 500.00,
    unit: "Per Manual Package",
    startingPrice: "00.00",
    wholesaleCost: 0.00,
    grossMargin: "100%",
    status: "LOCKED_2026"
  },
  {
    offerId: "05-MK3",
    offerName: "Quick Snack Pack ( Combo)",
    pillar: "05 SUPPLY",
    department: "DANI DECLARES MARKET",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.FIXED_PRICE,
    workingBaselineRate: 3.00,
    unit: "Per Pack",
    startingPrice: ".00",
    wholesaleCost: 1.10,
    grossMargin: "63.3%",
    status: "LOCKED_2026"
  },
  {
    offerId: "05-MK5",
    offerName: "Gamer Box ( Combo)",
    pillar: "05 SUPPLY",
    department: "DANI DECLARES MARKET",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.FIXED_PRICE,
    workingBaselineRate: 5.00,
    unit: "Per Box",
    startingPrice: ".00",
    wholesaleCost: 1.85,
    grossMargin: "63.0%",
    status: "LOCKED_2026"
  },
  {
    offerId: "05-MK15",
    offerName: "Family Movie Night Box",
    pillar: "05 SUPPLY",
    department: "DANI DECLARES MARKET",
    customerChannels: [CHANNELS.DIRECT_B2C, CHANNELS.BUSINESS_B2B, CHANNELS.COMMUNITY_B2B2C],
    customerTypes: ["ALL"],
    transactionType: TRANSACTION_TYPES.FIXED_PRICE,
    workingBaselineRate: 15.00,
    unit: "Per Box",
    startingPrice: "5.00",
    wholesaleCost: 5.20,
    grossMargin: "65.3%",
    status: "LOCKED_2026"
  }
];

export const MASTER_CATALOG_2026 = catalog;
