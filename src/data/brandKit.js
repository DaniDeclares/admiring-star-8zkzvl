// filename: src/data/brandKit.js
// DANI DECLARES LLC — MASTER BRAND KIT DATA

export const BRAND_KIT = {
  legalName: "DANI DECLARES LLC",
  brandName: "DANI DECLARES",
  category: "Concierge Execution + Creative Commerce",
  primaryTagline: "WE HANDLE THE EXECUTION.",
  secondaryTagline: "CONSIDER IT HANDLED.",
  
  pillars: [
    { num: "01", name: "HANDLE", title: "Execution & Concierge", desc: "Tasks, logistics, paperwork, coordination, and administrative execution." },
    { num: "02", name: "PREPARE", title: "Property, Events & Hospitality", desc: "Preparing spaces, multi-family unit turnovers, move resets, and event environments." },
    { num: "03", name: "CREATE", title: "Creative Production & Merch", desc: "DTF printing, custom apparel, packaging labels, signage, and branded products." },
    { num: "04", name: "CONNECT", title: "NFC & Smart Business Tools", desc: "Connecting physical products (9 SmartTap™ Cards, Review Stands) to digital destinations." },
    { num: "05", name: "SUPPLY", title: "Business Resources & Everyday Goods", desc: "Business startup kits, office supplies, curated snack boxes, drinks, and convenience bundles." }
  ],

  divisions: [
    { id: "execution", name: "DANI DECLARES OPERATIONS", tagline: "Concierge • Administrative • Field Execution", path: "/services/execution" },
    { id: "property", name: "DANI DECLARES PROPERTY", tagline: "Property Execution • Turnovers • Hospitality", path: "/services/property" },
    { id: "events", name: "DANI DECLARES EVENTS", tagline: "Events • Weddings • Hospitality", path: "/services/events" },
    { id: "creative", name: "DANI DECLARES CREATIVE", tagline: "Creative Production • Printing • Merchandise", path: "/services/creative" },
    { id: "smart", name: "DANI DECLARES SMART", tagline: "NFC • QR • Connected Products", path: "/services/smart" },
    { id: "business", name: "DANI DECLARES BUSINESS", tagline: "Business Startup Kits • Business Infrastructure", path: "/services/business" },
    { id: "market", name: "DANI DECLARES MARKET", tagline: "Snacks • Drinks • Convenience • Curated Goods", path: "/shop" }
  ],

  colors: {
    obsidian: "#0F050A",
    warmIvory: "#F8F5F1",
    champagneGold: "#C8B273",
    deepRed: "#8B1E2E",
    charcoal: "#1B0A0E",
    taupe: "#2D1B28"
  },

  hqLocation: "Tucker, Georgia 30084 (Serving Metro Atlanta, GA & Regional SC)"
};
