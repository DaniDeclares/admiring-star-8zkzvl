// filename: src/data/retainerPlansData.js
// DANI DECLARES LLC — B2B RECURRING RETAINER & SUBSCRIPTION PLANS

export const RETAINER_PLANS_2026 = [
  {
    planId: 'ret-multi-family-5',
    name: 'Multi-Family Property Reset Retainer (5 Units / Mo)',
    targetChannel: '03 COMMUNITY (B2B2C)',
    monthlyPrice: 1125.00,
    monthlyCredits: 500,
    includedTurnovers: 5,
    queue: 'Priority Scheduling Queue',
    features: [
      '500 Monthly Prepaid Service Credits',
      'Priority Scheduling Queue Access',
      '5 Complete 1BR-2BR Unit Turnover Resets per Month',
      'Guaranteed 24-48 Hour Dispatch Window',
      '2-Hour Digital HD Photo Inspection Certificates',
      'Dedicated Dispatch Coordinator'
    ]
  },
  {
    planId: 'ret-str-hospitality-4',
    name: 'STR / Airbnb Hospitality Subscription (4 Turns / Mo)',
    targetChannel: '02 BUSINESS (B2B)',
    monthlyPrice: 450.00,
    monthlyCredits: 500,
    includedTurnovers: 4,
    queue: 'Preferred Dispatch Window',
    features: [
      '500 Monthly Prepaid Service Credits',
      'Preferred Dispatch Window',
      '4 STR Hospitality Turnovers per Month',
      'Linen Wash, Restock & Amenity Replenishment',
      'HD Photo Inspection Logs',
      'Priority Same-Day Check-In Reset Scheduling'
    ]
  }
];
