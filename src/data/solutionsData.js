// filename: src/data/solutionsData.js
// DANI DECLARES LLC — MULTI-DEPARTMENT SOLUTION BUNDLES (LOCKED 2026)

export const solutionsCatalog2026 = {
  "sol-apartment-community": {
    id: "sol-apartment-community",
    name: "Apartment Community Turnover Solution",
    components: ["02-TO1", "04-TAG", "05-MK3"], 
    basePrice: 328.00, // Derived: 50 (Turnover) + 5 (Tags) +  (Welcome Pack Sample)
    billingType: "STARTING_AT",
    metadata: { package_tier: "PROPERTY_B2B" }
  },
  "sol-real-estate-agent": {
    id: "sol-real-estate-agent",
    name: "Real Estate Brokerage Solution",
    components: ["01-LON", "04-GCR", "03-APP"],
    basePrice: 248.00, // Derived: 50 (Signing) + 9 (Review Stand) + 9 (Apparel Deposit)
    billingType: "DEPOSIT_INITIAL",
    metadata: { package_tier: "BROKERAGE_CORE" }
  },
  "sol-office-infrastructure": {
    id: "sol-office-infrastructure",
    name: "Business & Office Infrastructure Solution",
    components: ["05-STU", "05-SOP", "01-ADM"],
    basePrice: 744.00, // Derived: 99 (Kit) + 00 (SOP) + 5 (Admin Hr)
    billingType: "FIXED_SET",
    metadata: { package_tier: "ENTERPRISE_SETUP" }
  },
  "sol-event-execution": {
    id: "sol-event-execution",
    name: "Integrated Event Execution Solution",
    components: ["02-WED", "03-APP", "05-MK15"],
    basePrice: 263.00, // Derived: 99 (Officiant) + 9 (Apparel Deposit) + 5 (Snack Box)
    billingType: "EVENT_HYBRID",
    metadata: { package_tier: "EVENT_EXECUTION" }
  },
  "sol-resident-movein": {
    id: "sol-resident-movein",
    name: "Resident Move-In Reset Solution",
    components: ["02-RES", "01-NOT", "05-MK15"],
    basePrice: 265.00, // Derived: 00 (Clean) + 0 (Notary) + 5 (Care Package)
    billingType: "FIXED_PRICE",
    metadata: { package_tier: "RESIDENT_PERK" }
  },
  "sol-government-execution": {
    id: "sol-government-execution",
    name: "Government & Public-Sector Support Solution",
    components: ["01-ADM", "01-DOC", "05-SOP"],
    basePrice: 0.00, 
    billingType: "B2G_PROCUREMENT_ONLY", // Direct checkout block
    metadata: { package_tier: "MUNICIPAL_TASK_ORDER" }
  }
};

export const MASTER_SOLUTIONS_V6 = Object.values(solutionsCatalog2026);
