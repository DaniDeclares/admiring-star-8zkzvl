// filename: src/data/requestEngineData.js
// DANI DECLARES LLC — CUSTOMER PROJECT REQUEST ENGINE DATA

export const INTAKE_CATEGORIES = [
  { id: "prop", label: "Cleaning or Property Preparation", serviceIds: ["prop-unit-turnover", "prop-b2c-deep-clean", "prop-str-turnover"] },
  { id: "doc", label: "Documents or Administrative Help", serviceIds: ["op-admin-support", "op-doc-prep", "op-notary-visit", "op-loan-signing", "op-i9-verify", "op-apostille"] },
  { id: "evt", label: "Wedding or Event Support", serviceIds: ["evt-wedding-officiant", "evt-elopement", "evt-wedding-coordination"] },
  { id: "print", label: "Apparel, Printing or Signage", serviceIds: ["crt-dtf-apparel", "crt-tumblers", "crt-labels-stickers"] },
  { id: "biz", label: "Business Setup or Business Materials", serviceIds: ["biz-startup-kit", "biz-sop-manual"] },
  { id: "smart", label: "NFC, QR or Smart Business Tools", serviceIds: ["sm-smarttap-nfc-card", "sm-review-stand", "sm-nfc-tag-pack"] },
  { id: "mkt", label: "Snacks, Welcome Bags or Supplies", serviceIds: ["mkt-snack-pack-3", "mkt-gamer-pack-5", "mkt-movie-night-15"] },
  { id: "custom", label: "I'm Not Sure — Help Me Figure It Out", serviceIds: [] }
];

export const PATHWAY_TYPES = [
  { id: "direct", label: "I'm an individual or family" },
  { id: "business", label: "I'm a business or office" },
  { id: "realtor", label: "I'm a real estate professional" },
  { id: "property", label: "I manage an apartment community" },
  { id: "govcon", label: "I'm a government agency or contracting partner" }
];
