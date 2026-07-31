// filename: src/data/brandKit.js
// DANI DECLARES LLC — LOCKED BRAND COLOR SYSTEM

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
    dark: "#21191A",

    // Keys required by HomePage.jsx
    obsidian: "#0F0B0C",
    champagneGold: "#D4B77A",
    taupe: "#7E6E66",
    warmIvory: "#F8F4EE",
    deepRed: "#6B1F2B"
  },

  hqLocation: "Tucker, Georgia 30084 (Serving Metro Atlanta, GA & Regional SC)",

  // Arrays required by HomePage.jsx
  pillars: [
    { num: 1, name: "Idea", title: "Concept & Strategy", desc: "We shape your concept and develop an executable plan." },
    { num: 2, name: "Plan", title: "Project Planning", desc: "We build timelines, budgets, and vendor plans." },
    { num: 3, name: "Prepare", title: "Activation Prep", desc: "We prepare materials, logistics, and teams." },
    { num: 4, name: "Execute", title: "On-Site Execution", desc: "We run the plan with detail-driven execution." },
    { num: 5, name: "Finish", title: "Delivery & Handover", desc: "We complete final touches and hand over deliverables." }
  ],

  divisions: [
    { id: "business-solutions", name: "Business Solutions", tagline: "Enterprise-grade execution", path: "/services/business-solutions" },
    { id: "print-studio", name: "Print Studio", tagline: "Bespoke print production", path: "/services/print-studio" },
    { id: "events", name: "Events", tagline: "Events and celebrations", path: "/services/events" },
    { id: "property", name: "Property", tagline: "Property resets & staging", path: "/services/property" },
    { id: "concierge", name: "Concierge", tagline: "Concierge operations", path: "/services/concierge" },
    { id: "express-goods", name: "Express Goods", tagline: "Everyday convenience goods", path: "/services/express-goods" }
  ]
};
