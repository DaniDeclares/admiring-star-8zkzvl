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

  // 4 CUSTOMER CHANNELS (INTERNAL DATA MODEL + PUBLIC UX LABELS)
  channels: [
    {
      id: "direct",
      internalCode: "DIRECT (B2C)",
      publicLabel: "Individuals & Families",
      target: "Homeowners, Renters, Couples & Individuals",
      desc: "Standalone access to home cleaning, deep cleaning, mobile notary, apostille assistance, wedding officiating, custom DTF apparel, SmartTap™ NFC cards, and Market snack bundles.",
      cta: "GET STARTED",
      route: "/book"
    },
    {
      id: "business",
      internalCode: "BUSINESS (B2B)",
      publicLabel: "Businesses, Offices & Real Estate Professionals",
      target: "Businesses, Real Estate Brokerages, Offices & Teams",
      desc: "Loan signings, mobile notary, open-house setups, agent apparel, business cards, flyers, signage, Smart Review Stands, closing gifts, and office snack boxes.",
      cta: "TELL US WHAT YOU NEED",
      route: "/industries/real-estate"
    },
    {
      id: "community",
      internalCode: "COMMUNITY (B2B2C)",
      publicLabel: "Apartment Communities & Their Residents",
      target: "Property Managers, Leasing Offices & Tenants",
      desc: "Turnkey unit turnovers, 24-48 hr SLAs, 2-hr digital HD photo logs, welcome bags, resident appreciation events, movie nights, and sponsored Resident Perks.",
      cta: "TELL US WHAT YOU NEED",
      route: "/industries/real-estate"
    },
    {
      id: "government",
      internalCode: "GOVERNMENT (B2G)",
      publicLabel: "Government & Contracting Partners",
      target: "Federal, State, Municipal Agencies & Prime Contractors",
      desc: "Active SAM.gov registration (UEI: TD4TSG48LHN9). Government positioning is centered on janitorial and facilities-support procurement; CAGE and federal classification details are pending authoritative SAM-record reconciliation.",
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

  publicHQ: "Tucker, Georgia 30084 (Serving Metro Atlanta, GA & Regional SC)"
};
