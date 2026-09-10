// filename: src/data/ecosystemData.js
// DANI DECLARES LLC — MASTER BUSINESS ECOSYSTEM V5.0 DATA (AUTHORITATIVE)

export const MASTER_ECOSYSTEM_V5 = {
  legalName: "DANI DECLARES LLC",
  brandName: "DANI DECLARES",
  primaryTagline: "WE HANDLE THE EXECUTION.",
  secondaryTagline: "CONSIDER IT HANDLED.",
  positioning: "Multidisciplinary Execution Partner Ecosystem",

  // 5 LOCKED CAPABILITY PILLARS
  pillars: [
    { id: "handle", num: "01", name: "HANDLE", title: "Operations, Compliance & Concierge Execution", dept: "DANI DECLARES OPERATIONS" },
    { id: "prepare", num: "02", name: "PREPARE", title: "Property, Hospitality & Events", dept: "DANI DECLARES PROPERTY & DANI DECLARES EVENTS" },
    { id: "create", num: "03", name: "CREATE", title: "Creative Production, Printing & Merchandise", dept: "DANI DECLARES CREATIVE" },
    { id: "connect", num: "04", name: "CONNECT", title: "Smart Business Tools, NFC & Digital Touchpoints", dept: "DANI DECLARES SMART" },
    { id: "supply", num: "05", name: "SUPPLY", title: "Business Infrastructure & Everyday Goods", dept: "DANI DECLARES BUSINESS & DANI DECLARES MARKET" }
  ],

  // 7 LOCKED DEPARTMENTS
  departments: [
    { id: "operations", name: "DANI DECLARES OPERATIONS", tagline: "Administrative • Compliance • Concierge Execution" },
    { id: "property", name: "DANI DECLARES PROPERTY", tagline: "Property Preparation • Turnovers • Hospitality Resets" },
    { id: "events", name: "DANI DECLARES EVENTS", tagline: "Weddings • Celebrations • Event Logistics" },
    { id: "creative", name: "DANI DECLARES CREATIVE", tagline: "Printing • Merchandise • Custom Apparel" },
    { id: "smart", name: "DANI DECLARES SMART", tagline: "NFC • QR • Connected Business Touchpoints" },
    { id: "business", name: "DANI DECLARES BUSINESS", tagline: "Business Startup Kits • Infrastructure" },
    { id: "market", name: "DANI DECLARES MARKET", tagline: "Snacks • Drinks • Curated Care Packages" }
  ],

  // 5 LOCKED CUSTOMER CHANNELS — CANONICAL PUBLIC ARCHITECTURE
  channels: [
    {
      id: "resident",
      internalCode: "CHANNEL 01",
      publicLabel: "Resident Concierge",
      target: "Apartment/property residents and individual residential customers",
      desc: "Direct-to-consumer lifestyle and residential services, including resident-discounted eligible services and resident portal access.",
      cta: "GET STARTED",
      route: "/book"
    },
    {
      id: "propertyManagement",
      internalCode: "CHANNEL 02",
      publicLabel: "Property Management & Apartments",
      target: "Property managers, apartment communities, ownership and operations teams",
      desc: "Post-occupancy turnover, physical-plant support, property compliance, operational asset printing and community activations.",
      cta: "REQUEST PROPERTY SUPPORT",
      route: "/industries/real-estate"
    },
    {
      id: "realEstate",
      internalCode: "CHANNEL 03",
      publicLabel: "Real Estate Offices & Brokerages",
      target: "Realtors, teams, brokerages and real estate offices",
      desc: "Listing support, open-house setup, signage, print collateral, client/closing support and related real-estate execution services.",
      cta: "TELL US WHAT YOU NEED",
      route: "/industries/real-estate"
    },
    {
      id: "business",
      internalCode: "CHANNEL 04",
      publicLabel: "Businesses",
      target: "Businesses and commercial clients",
      desc: "Business operations, workplace support, cleaning, products, printing, signage, startup infrastructure, gifting and recurring support.",
      cta: "TELL US WHAT YOU NEED",
      route: "/industries/business"
    },
    {
      id: "government",
      internalCode: "CHANNEL 05",
      publicLabel: "Government & Institutional Procurement",
      target: "Federal, State, County, Municipal, Public Authority, Education, Healthcare and Institutional buyers; prime contractors and teaming partners",
      desc: "Procurement-specific government and institutional execution across custodial/facility care, facilities support, exterior services, emergency sanitation, supplies/distribution, printing/signage, logistics/field services, administrative/document support and public events/community support.",
      cta: "REQUEST A CAPABILITY STATEMENT",
      route: "/industries/government"
    }
  ],

  verifiedGovernmentCredentials: {
    stateRegistration: "Georgia SOS Control No. #25079444",
    samStatus: "Active registration verified in SAM.gov workspace",
    uei: "TD4TSG48LHN9",
    cageCode: "Pending authoritative SAM record verification",
    primaryNaics: "Pending authoritative SAM record reconciliation",
    secondaryNaics: [],
    insurance: "Not represented here until current coverage evidence is verified",
    w9Status: "Not represented here until current W-9 evidence is verified",
    capabilityDocumentUrl: "/assets/capability-statement.txt"
  },

  publicHQ: "Tucker, Georgia 30084 (Serving Georgia)",
};