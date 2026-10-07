// Operation $1 Million — governed content-package underwriting.
// Candidate economics only. This module does NOT promote prices or mutate catalog authority.

export const OP1M_CONTENT_PACKAGE_POLICY = Object.freeze({
  maxLaborPct: 0.40,
  processingPct: 0.03,
  riskOverheadPct: 0.12,
  ownerMeasurementRate: 75,
  providerTargetRate: 60,
  measurementJobsRequired: 3,
});

export const CONTENT_DEPTH = Object.freeze({
  EDIT: 'EDIT',
  CREATE: 'CREATE',
  CONTENT_PARTNER: 'CONTENT_PARTNER',
  MARKETING_PARTNER: 'MARKETING_PARTNER',
});

// Existing Production anchors. Preserve; do not silently replace.
export const EXISTING_CONTENT_AUTHORITY = Object.freeze({
  EDIT: { sku: 'DNI-07A-020', startingPrice: 199 },
  CREATE: { sku: 'DNI-07A-007', startingPrice: 250 },
  CONTENT_CALENDAR: { sku: 'DNI-07A-004', startingPrice: 250 },
  // DNI-07A-005 intentionally excluded from package math until $400 vs $650 conflict is resolved.
});

export function money(n) { return Math.round(n * 100) / 100; }

export function underwritePackage({
  price,
  providerMinutes = 0,
  ownerCreativeMinutes = 0,
  ownerQaAdminMinutes = 0,
  ownerCustomerCommsMinutes = 0,
  providerRate = OP1M_CONTENT_PACKAGE_POLICY.providerTargetRate,
  ownerRate = OP1M_CONTENT_PACKAGE_POLICY.ownerMeasurementRate,
}) {
  const providerLabor = providerMinutes / 60 * providerRate;
  const ownerLabor = (ownerCreativeMinutes + ownerQaAdminMinutes + ownerCustomerCommsMinutes) / 60 * ownerRate;
  const labor = providerLabor + ownerLabor;
  const processing = price * OP1M_CONTENT_PACKAGE_POLICY.processingPct;
  const riskOverhead = price * OP1M_CONTENT_PACKAGE_POLICY.riskOverheadPct;
  const laborPct = labor / price;
  return {
    price: money(price),
    providerLabor: money(providerLabor),
    ownerLabor: money(ownerLabor),
    totalLabor: money(labor),
    laborPct: money(laborPct * 100),
    processing: money(processing),
    riskOverhead: money(riskOverhead),
    contributionAfterModeledCosts: money(price - labor - processing - riskOverhead),
    clearsLaborGate: laborPct <= OP1M_CONTENT_PACKAGE_POLICY.maxLaborPct,
    minimumPriceForLaborGate: money(labor / OP1M_CONTENT_PACKAGE_POLICY.maxLaborPct),
  };
}

// C-team candidate for the live DeAndrea buying-intent lane.
// Scope deliberately keeps CREATE below Content Partner:
// customer supplies the core idea + footage; DANI organizes/refines, then produces.
export const CREATE_STARTER_CANDIDATES = Object.freeze([
  { price: 497, label: '$497 / 2', decision: 'AGGRESSIVE_MEASUREMENT' },
  { price: 547, label: '$547 / 2', decision: 'C_TEAM_RECOMMENDED' },
  { price: 597, label: '$597 / 2', decision: 'PREMIUM_CUSHION' },
]);

export const CREATE_STARTER_SCOPE = Object.freeze({
  quantity: 2,
  finishedFormat: 'short-form vertical video',
  ideaBoundary: 'Customer supplies core idea/message; DANI organizes/refines it. Blank-page concept development is Content Partner work.',
  planning: 'One shared batch planning / voice-over organization step.',
  editing: 'Cuts, captions, basic visual polish, licensed-library music where appropriate, platform-ready export.',
  revisions: 'One consolidated revision round across the batch; new concept/direction after approval is a change in scope.',
  footage: 'Client-provided footage. Heavy footage sorting/rescue is out of scope and requires an overage/change order.',
  turnaroundClock: 'Starts after payment and all required assets are received; pauses for missing assets or customer feedback.',
  payment: '100% upfront for Starter.',
  exclusions: ['filming', 'advanced motion graphics', 'paid stock/music', 'heavy footage rescue', 'blank-page campaign strategy', 'posting/management'],
});

// Normal first-job model includes the labor Grok omitted: QA/admin + customer communication.
// 2 pieces: 60 provider edit min each; 30 shared creative min; 15 QA/admin min each; 15 customer-comms min batch.
// This is a conservative measurement model, not permanent truth.
export function createStarterEconomics(price) {
  return underwritePackage({
    price,
    providerMinutes: 120,
    ownerCreativeMinutes: 30,
    ownerQaAdminMinutes: 30,
    ownerCustomerCommsMinutes: 15,
  });
}

export function cTeamDecision() {
  const candidates = CREATE_STARTER_CANDIDATES.map(c => ({ ...c, economics: createStarterEconomics(c.price) }));
  return {
    operation: 'OPERATION_$1M_COMPANY',
    funnelStage: 'BUYING_INTENT',
    directMatch: CONTENT_DEPTH.CREATE,
    recommendation: 547,
    why: [
      'Respond to the live buyer now; do not wait for the full 1/4/8/12 recurring matrix.',
      'Keep CREATE distinct from commodity EDIT and from blank-page CONTENT_PARTNER strategy.',
      'Count all modeled human delivery labor, including owner QA/admin and customer communication.',
      'Use the first 3-5 paid CREATE jobs as measurement jobs and tighten the model from actuals.',
      'Do not promote recurring Content Partner or Marketing Partner prices until their economics clear.',
    ],
    candidates,
  };
}

export const C_TEAM_BLIND_SPOTS = Object.freeze([
  'Customer communication time can erase margin if it is not measured.',
  'Raw-footage sorting needs a boundary or overage.',
  'Voice-over help must stop short of blank-page concept development at CREATE depth.',
  'First-job onboarding will likely be slower than later batches.',
  'Revision means one consolidated change set, not a new concept.',
  'Turnaround must start only after payment + complete assets and pause on customer delay.',
  'The old canonical $199/$250 cost models are explicitly DRAFT; they cannot be treated as audited unit economics.',
  'DNI-07A-005 has a $400/$650 authority conflict and must not anchor Marketing Partner pricing yet.',
  'A single buyer validates demand, not the whole catalog.',
  'Package learning must feed acquisition -> quote -> payment -> fulfillment -> repeat/cross-sell in the OP1M loop.',
]);

export const OWNER_DECISIONS_REQUIRED = Object.freeze([
  {
    id: 'CREATE_SCOPE_DEPTH',
    question: 'At CREATE depth, should DANI own A) organize/refine customer-supplied idea, B) develop hook/angle from a topic, or C) blank-page concept + message?',
    cTeamVote: 'A',
  },
  {
    id: 'LABOR_DEFINITION',
    question: 'Should the <=40% labor gate count all human delivery labor, including owner planning, customer communication, QA and revisions?',
    cTeamVote: 'YES',
  },
  {
    id: 'STARTER_PRICE',
    question: 'For the first two-piece CREATE Starter, choose A) $497, B) $547, or C) $597.',
    cTeamVote: 'B',
  },
]);

export function eli10() {
  return 'A package is a box. Before writing the price on the box, count every human minute needed to fill it. CREATE is the box where the customer brings the idea and footage and DANI helps turn it into post-ready content. Deeper blank-page strategy goes in a bigger box.';
}

export const CREATE_STARTER_PROS = Object.freeze([
  'Answers a real buyer while intent is warm.',
  'Creates paid evidence instead of more hypothetical research.',
  'Directly solves the stated thought-organization + editing burden.',
  'Separates CREATE value from $199 EDIT.',
  'Provides a natural path to recurring Content Partner.',
  'Can be fulfilled owner-first without depending on a named provider.',
]);

export const CREATE_STARTER_CONS = Object.freeze([
  'First-job delivery time is not yet measured.',
  'Creative scope can expand if idea/voice-over boundaries are vague.',
  'Two pieces are not recurring revenue by themselves.',
  'Customer communication and footage cleanup can create hidden labor.',
  'Recurring package prices remain held until measured economics clear.',
]);
