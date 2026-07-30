// filename: src/data/retainerPlansData.js
// DANI DECLARES LLC — B2B RECURRING RETAINER & SUBSCRIPTION PLANS

export const RETAINER_PLANS_2026 = [
  {
    planId: 'ret-multi-family-5',
    name: 'Multi-Family Property Reset Retainer (5 Units / Mo)',
    targetChannel: '03 COMMUNITY (B2B2C)',
    monthlyPrice: 1125.00, // 25 / unit discounted bulk rate
    includedTurnovers: 5,
    features: [
      '5 Complete 1BR-2BR Unit Turnover Resets per Month',
      'Guaranteed 24-48 Hour SLA Completion',
      '2-Hour Digital HD Photo Inspection Certificates',
      'Sponsored 15% Resident Perk Discount Code for Property Tenants',
      'Dedicated Dispatch Coordinator'
    ]
  },
  {
    planId: 'ret-str-hospitality-4',
    name: 'STR / Airbnb Hospitality Subscription (4 Turns / Mo)',
    targetChannel: '02 BUSINESS (B2B)',
    monthlyPrice: 450.00, // 12.50 / turnover
    includedTurnovers: 4,
    features: [
      '4 STR Hospitality Turnovers per Month',
      'Linen Wash, Restock & Amenity Replenishment',
      'HD Photo Inspection Logs',
      'Priority Same-Day Check-In Reset Scheduling'
    ]
  }
];
