// filename: src/data/brandKit.js — LOCKED BRAND COLOR & ECOSYSTEM DATA
export const BRAND_KIT = {
  legalName: "DANI DECLARES LLC",
  brandName: "DANI DECLARES",
  category: "Concierge Operations + Creative Commerce",
  primaryTagline: "WE HANDLE THE EXECUTION.",
  secondaryTagline: "CONSIDER IT HANDLED.",
  colors: {
    burgundy: "#6B1F2B",
    burgundyDark: "#4F1720",
    burgundyLight: "#873340",
    ivory: "#F6F0E4",
    cream: "#EDE2D0",
    gold: "#C9A45C",
    goldLight: "#DCC58F",
    dark: "#21191A"
  },
  hqLocation: "Tucker, Georgia 30084 (Serving Metro Atlanta, GA & Regional SC)",
  pillars: [
    { num: "01", name: "HANDLE", title: "Operations, Compliance & Concierge Execution", desc: "Administrative execution, document prep, mobile notary, loan signings, I-9s, and apostille processing." },
    { num: "02", name: "PREPARE", title: "Property, Hospitality & Events", desc: "Multi-family unit turnovers, 2-hr HD photo logs, deep cleans, and wedding officiating." },
    { num: "03", name: "CREATE", title: "Creative Production & Merchandise", desc: "Custom DTF heat-press apparel, sublimated tumblers, packaging labels, and signage." },
    { num: "04", name: "CONNECT", title: "Smart NFC & Digital Touchpoints", desc: "SmartTap™ NFC business cards, Smart Review counter stands, and digital profiles." },
    { num: "05", name: "SUPPLY", title: "Business Infrastructure & Market Goods", desc: "Business startup kits, SOP manual packages, and curated snack convenience boxes." }
  ],
  divisions: [
    { name: "DANI DECLARES OPERATIONS", tagline: "Administrative • Compliance • Concierge Execution", route: "/services/concierge" },
    { name: "DANI DECLARES PROPERTY", tagline: "Property Preparation • Turnovers • Hospitality Resets", route: "/services/property" },
    { name: "DANI DECLARES EVENTS", tagline: "Weddings • Celebrations • Event Logistics", route: "/events/weddings" },
    { name: "DANI DECLARES CREATIVE", tagline: "Printing • Merchandise • Custom Apparel", route: "/services/print-studio" },
    { name: "DANI DECLARES SMART", tagline: "NFC • QR • Connected Business Touchpoints", route: "/shop" },
    { name: "DANI DECLARES BUSINESS", tagline: "Business Startup Kits • Infrastructure", route: "/services/business-solutions" },
    { name: "DANI DECLARES MARKET", tagline: "Snacks • Drinks • Curated Care Packages", route: "/shop" }
  ]
};
export default BRAND_KIT;
