// filename: src/data/mediaData.js
// DANI DECLARES LLC — MASTER V7.0 CENTRALIZED MEDIA & VISUAL ASSET SYSTEM
import { brandBanner } from '../lib/visualBanner.js';

export const MEDIA_FALLBACK = brandBanner({ label: 'DANI DECLARES Execution Services', seed: 'fallback' });

const banner = (id, title, department) => brandBanner({ label: title, kicker: department, seed: id });

export const MASTER_MEDIA_MANIFEST_V7 = [
  // ==========================================
  // 01 — HANDLE (DANI DECLARES OPERATIONS)
  // ==========================================
  {
    id: "op-admin-support",
    title: "Administrative & Executive Execution Support",
    category: "OPERATIONS",
    department: "DANI DECLARES OPERATIONS",
    pillar: "01 HANDLE",
    serviceId: "op-admin-support",
    imageUrl: banner("op-admin-support", "Administrative & Executive Execution Support", "DANI DECLARES OPERATIONS"),
    altText: "Executive administrative coordinator managing business schedules, documents, and project workflows for DANI DECLARES LLC",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "op-doc-prep",
    title: "Non-Attorney Document Preparation Support",
    category: "OPERATIONS",
    department: "DANI DECLARES OPERATIONS",
    pillar: "01 HANDLE",
    serviceId: "op-doc-prep",
    imageUrl: banner("op-doc-prep", "Non-Attorney Document Preparation", "DANI DECLARES OPERATIONS"),
    altText: "Compliance packet and non-attorney document preparation paperwork organized on desk",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "op-notary-visit",
    title: "Mobile Notary Public Visit",
    category: "OPERATIONS",
    department: "DANI DECLARES OPERATIONS",
    pillar: "01 HANDLE",
    serviceId: "op-notary-visit",
    imageUrl: banner("op-notary-visit", "Mobile Notary Public Visit", "DANI DECLARES OPERATIONS"),
    altText: "Mobile notary public placing official notary stamp and signature on legal client paperwork during home visit",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "op-loan-signing",
    title: "Loan Signing Agent Package",
    category: "OPERATIONS",
    department: "DANI DECLARES OPERATIONS",
    pillar: "01 HANDLE",
    serviceId: "op-loan-signing",
    imageUrl: banner("op-loan-signing", "Loan Signing Agent Package", "DANI DECLARES OPERATIONS"),
    altText: "Real estate buyer signing loan mortgage documents with certified loan signing agent",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "op-i9-verify",
    title: "Authorized Remote I-9 Verification",
    category: "OPERATIONS",
    department: "DANI DECLARES OPERATIONS",
    pillar: "01 HANDLE",
    serviceId: "op-i9-verify",
    imageUrl: banner("op-i9-verify", "Authorized Remote I-9 Verification", "DANI DECLARES OPERATIONS"),
    altText: "Remote employee Section 2 I-9 identity verification document inspection by authorized representative",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "op-apostille",
    title: "Expedited Apostille Facilitation",
    category: "OPERATIONS",
    department: "DANI DECLARES OPERATIONS",
    pillar: "01 HANDLE",
    serviceId: "op-apostille",
    imageUrl: banner("op-apostille", "Expedited Apostille Facilitation", "DANI DECLARES OPERATIONS"),
    altText: "International document authentication and Secretary of State apostille seal process",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },

  // ==========================================
  // 02 — PREPARE (DANI DECLARES PROPERTY)
  // ==========================================
  {
    id: "prop-unit-turnover",
    title: "Multi-Family Unit Turnover Reset",
    category: "PROPERTY",
    department: "DANI DECLARES PROPERTY",
    pillar: "02 PREPARE",
    serviceId: "prop-unit-turnover",
    imageUrl: banner("prop-unit-turnover", "Multi-Family Unit Turnover Reset", "DANI DECLARES PROPERTY"),
    altText: "Professional apartment turnover cleaning crew resetting modern kitchen for new resident move-in",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "prop-str-turnover",
    title: "STR / Airbnb Hospitality Turnover",
    category: "PROPERTY",
    department: "DANI DECLARES PROPERTY",
    pillar: "02 PREPARE",
    serviceId: "prop-str-turnover",
    imageUrl: banner("prop-str-turnover", "STR / Airbnb Hospitality Turnover", "DANI DECLARES PROPERTY"),
    altText: "Pristine short-term rental bedroom reset with freshly laundered linens and hospitality amenity arrangement",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "prop-b2c-deep-clean",
    title: "Residential Deep Cleaning & Home Reset",
    category: "PROPERTY",
    department: "DANI DECLARES PROPERTY",
    pillar: "02 PREPARE",
    serviceId: "prop-b2c-deep-clean",
    imageUrl: banner("prop-b2c-deep-clean", "Residential Deep Cleaning & Home Reset", "DANI DECLARES PROPERTY"),
    altText: "Spotless residential home living room and kitchen deep clean performed by DANI DECLARES LLC",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },

  // ==========================================
  // 02 — PREPARE (DANI DECLARES EVENTS)
  // ==========================================
  {
    id: "evt-elopement",
    title: "Same-Day / Pop-Up Elopement Officiant",
    category: "EVENTS",
    department: "DANI DECLARES EVENTS",
    pillar: "02 PREPARE",
    serviceId: "evt-elopement",
    imageUrl: banner("evt-elopement", "Same-Day / Pop-Up Elopement Officiant", "DANI DECLARES EVENTS"),
    altText: "Intimate pop-up elopement wedding ceremony outdoors with bride, groom, and officiant",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "evt-wedding-officiant",
    title: "Personalized Full Wedding Ceremony Officiant",
    category: "EVENTS",
    department: "DANI DECLARES EVENTS",
    pillar: "02 PREPARE",
    serviceId: "evt-wedding-officiant",
    imageUrl: banner("evt-wedding-officiant", "Personalized Full Wedding Ceremony Officiant", "DANI DECLARES EVENTS"),
    altText: "Full personalized wedding ceremony with floral arch setup and officiant ceremony delivery",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },

  // ==========================================
  // 03 — CREATE (DANI DECLARES CREATIVE)
  // ==========================================
  {
    id: "crt-dtf-apparel",
    title: "Custom Heat-Press DTF Apparel",
    category: "CREATIVE",
    department: "DANI DECLARES CREATIVE",
    pillar: "03 CREATE",
    serviceId: "crt-dtf-apparel",
    imageUrl: banner("crt-dtf-apparel", "Custom Heat-Press DTF Apparel", "DANI DECLARES CREATIVE"),
    altText: "Custom DTF heat-press printed team t-shirts and corporate merchandise produced by DANI DECLARES CREATIVE",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "crt-tumblers",
    title: "Sublimated 20 oz Custom Tumbler",
    category: "CREATIVE",
    department: "DANI DECLARES CREATIVE",
    pillar: "03 CREATE",
    serviceId: "crt-tumblers",
    imageUrl: banner("crt-tumblers", "Sublimated 20 oz Custom Tumbler", "DANI DECLARES CREATIVE"),
    altText: "Insulated stainless steel 20 oz tumblers with full-wrap custom sublimated graphic designs",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "crt-labels-stickers",
    title: "Custom Packaging Labels & Stickers",
    category: "CREATIVE",
    department: "DANI DECLARES CREATIVE",
    pillar: "03 CREATE",
    serviceId: "crt-labels-stickers",
    imageUrl: banner("crt-labels-stickers", "Custom Packaging Labels & Stickers", "DANI DECLARES CREATIVE"),
    altText: "Custom die-cut packaging stickers and product labels printed for small business retail packaging",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },

  // ==========================================
  // 04 — CONNECT (DANI DECLARES SMART)
  // ==========================================
  {
    id: "sm-smarttap-nfc-card",
    title: "SmartTap™ NFC Business Card Package",
    category: "SMART",
    department: "DANI DECLARES SMART",
    pillar: "04 CONNECT",
    serviceId: "sm-smarttap-nfc-card",
    imageUrl: banner("sm-smarttap-nfc-card", "SmartTap™ NFC Business Card Package", "DANI DECLARES SMART"),
    altText: "SmartTap™ black matte NFC digital business card tapped on smartphone for instant contact download",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "sm-review-stand",
    title: "Smart Review Counter Stand (Google Reviews)",
    category: "SMART",
    department: "DANI DECLARES SMART",
    pillar: "04 CONNECT",
    serviceId: "sm-review-stand",
    imageUrl: banner("sm-review-stand", "Smart Review Counter Stand", "DANI DECLARES SMART"),
    altText: "Acrylic countertop Smart Review stand with integrated NFC chip and QR code driving Google customer reviews",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },

  // ==========================================
  // 05 — SUPPLY (DANI DECLARES BUSINESS & MARKET)
  // ==========================================
  {
    id: "biz-startup-kit",
    title: "Business Startup Infrastructure Kit",
    category: "BUSINESS",
    department: "DANI DECLARES BUSINESS",
    pillar: "05 SUPPLY",
    serviceId: "biz-startup-kit",
    imageUrl: banner("biz-startup-kit", "Business Startup Infrastructure Kit", "DANI DECLARES BUSINESS"),
    altText: "Business startup kit containing business cards, packaging labels, flyers, and SmartTap™ NFC card",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "mkt-snack-pack-3",
    title: "Quick Snack Pack ( Combo)",
    category: "MARKET",
    department: "DANI DECLARES MARKET",
    pillar: "05 SUPPLY",
    serviceId: "mkt-snack-pack-3",
    imageUrl: banner("mkt-snack-pack-3", "Quick Snack Pack Combo", "DANI DECLARES MARKET"),
    altText: "Curated  Quick Snack Pack with individually packaged chips, cold beverage, and sweet treat",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "mkt-gamer-pack-5",
    title: "Gamer / Daily Combo Box ( Combo)",
    category: "MARKET",
    department: "DANI DECLARES MARKET",
    pillar: "05 SUPPLY",
    serviceId: "mkt-gamer-pack-5",
    imageUrl: banner("mkt-gamer-pack-5", "Gamer / Daily Combo Box", "DANI DECLARES MARKET"),
    altText: "Curated  Gamer Combo box containing savory chips, cold Gatorade, full-size candy bar, and treats",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  },
  {
    id: "mkt-movie-night-15",
    title: "Family Movie Night / Office Box",
    category: "MARKET",
    department: "DANI DECLARES MARKET",
    pillar: "05 SUPPLY",
    serviceId: "mkt-movie-night-15",
    imageUrl: banner("mkt-movie-night-15", "Family Movie Night / Office Box", "DANI DECLARES MARKET"),
    altText: "12-item Family Movie Night and office snack box filled with chips, popcorn, candies, and drinks",
    sourceType: "BRANDED",
    usage: "CARD",
    aspectRatio: "16:9",
    focalPoint: "center",
    fallbackUrl: MEDIA_FALLBACK
  }
];

export const getMediaById = (id) => {
  const found = MASTER_MEDIA_MANIFEST_V7.find((item) => item.id === id || item.serviceId === id);
  return found || {
    imageUrl: MEDIA_FALLBACK,
    altText: "DANI DECLARES LLC Execution Services",
    sourceType: "BRANDED",
    usage: "CARD",
    fallbackUrl: MEDIA_FALLBACK
  };
};
