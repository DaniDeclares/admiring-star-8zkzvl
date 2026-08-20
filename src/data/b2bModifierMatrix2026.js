// DANI DECLARES LLC — PR B B2B modifier matrix
// Numeric modifier values are locked only where already approved by the pricing spine.
// Everything else remains UNDEFINED_PENDING until a business decision is recorded.
// Modifiers must never create an unapproved or duplicative charge.

import { PRICING_STATUS, PRICING_CHANNELS, PRICING_METHODS } from './canonicalPricing2026';

export const STACKING_RULES = {
  STACKABLE: 'STACKABLE',
  NON_STACKABLE: 'NON_STACKABLE',
  REPLACES_PARENT: 'REPLACES_PARENT',
  CUSTOM_QUOTE: 'CUSTOM_QUOTE',
};

export const B2B_MODIFIERS_2026 = {
  B2B_ADDITIONAL_BEDROOM: { modifierId: 'B2B_ADDITIONAL_BEDROOM', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C], name: 'Additional Bedroom', trigger: 'bedroom count exceeds base service scope', fieldMetric: 'bedroom_count', pricingMethod: PRICING_METHODS.FLAT, amount: null, status: PRICING_STATUS.UNDEFINED, stackingRule: STACKING_RULES.STACKABLE, documentationRequired: true },
  B2B_ADDITIONAL_BATHROOM: { modifierId: 'B2B_ADDITIONAL_BATHROOM', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C], name: 'Additional Bathroom', trigger: 'bathroom count exceeds base service scope', fieldMetric: 'bathroom_count', pricingMethod: PRICING_METHODS.FLAT, amount: null, status: PRICING_STATUS.UNDEFINED, stackingRule: STACKING_RULES.STACKABLE, documentationRequired: true },
  B2B_EXCESS_DEBRIS: { modifierId: 'B2B_EXCESS_DEBRIS', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C], name: 'Excess Loose Debris', trigger: 'loose debris exceeds one 33-gallon contractor bag', fieldMetric: 'contractor_bag_count', pricingMethod: PRICING_METHODS.PER_UNIT, amount: null, status: PRICING_STATUS.UNDEFINED, stackingRule: STACKING_RULES.NON_STACKABLE, documentationRequired: true, scopeShield: true },
  B2B_SPECIAL_HANDLING: { modifierId: 'B2B_SPECIAL_HANDLING', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C], name: 'Bulk / Specialty Item Handling', trigger: 'predefined item category requires handling outside ordinary scope', fieldMetric: 'special_item_category', pricingMethod: PRICING_METHODS.PER_UNIT, amount: null, status: PRICING_STATUS.UNDEFINED, stackingRule: STACKING_RULES.NON_STACKABLE, documentationRequired: true, scopeShield: true },
  B2B_HEAVY_SOIL: { modifierId: 'B2B_HEAVY_SOIL', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C], name: 'Heavy Soil / Severe Condition', trigger: 'documented condition materially exceeds standard labor allowance', fieldMetric: 'condition_evidence', pricingMethod: PRICING_METHODS.CUSTOM_QUOTE, amount: null, status: PRICING_STATUS.UNDEFINED, stackingRule: STACKING_RULES.REPLACES_PARENT, documentationRequired: true, scopeShield: true },
  B2B_PET_MESS: { modifierId: 'B2B_PET_MESS', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C], name: 'Severe Pet Mess / Contamination', trigger: 'pet waste, urine, contamination, or treatment beyond routine cleaning', fieldMetric: 'pet_condition_evidence', pricingMethod: PRICING_METHODS.CUSTOM_QUOTE, amount: null, status: PRICING_STATUS.UNDEFINED, stackingRule: STACKING_RULES.REPLACES_PARENT, documentationRequired: true, scopeShield: true },
  B2B_SECOND_TRIP: { modifierId: 'B2B_SECOND_TRIP', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C], name: 'Second Trip / Incomplete Access Fee', trigger: 'a second arrival is required for a documented work-order/site condition', fieldMetric: 'dispatch_count', pricingMethod: PRICING_METHODS.FLAT, amount: 85, status: PRICING_STATUS.LOCKED, stackingRule: STACKING_RULES.NON_STACKABLE, documentationRequired: true, scopeShield: true },
  B2B_ACCESS_WAIT: { modifierId: 'B2B_ACCESS_WAIT', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C], name: 'Access Wait Time', trigger: 'crew waits more than 15 minutes for required access or site readiness', fieldMetric: 'wait_minutes', pricingMethod: PRICING_METHODS.FLAT, amount: 85, status: PRICING_STATUS.LOCKED, stackingRule: STACKING_RULES.NON_STACKABLE, documentationRequired: true, scopeShield: true },
  B2B_MATERIALS_COST_PLUS: { modifierId: 'B2B_MATERIALS_COST_PLUS', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C, PRICING_CHANNELS.B2G], name: 'Materials Cost Plus 10%', trigger: 'Dani Declares purchases approved materials on behalf of client', fieldMetric: 'material_cost', pricingMethod: PRICING_METHODS.PERCENT, amount: 0.10, status: PRICING_STATUS.LOCKED, stackingRule: STACKING_RULES.STACKABLE, documentationRequired: true },
  B2B_RUSH: { modifierId: 'B2B_RUSH', channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C], name: 'Rush / Priority Scheduling', trigger: 'client requests service inside the standard lead-time window', fieldMetric: 'requested_lead_time', pricingMethod: PRICING_METHODS.CUSTOM_QUOTE, amount: null, status: PRICING_STATUS.UNDEFINED, stackingRule: STACKING_RULES.NON_STACKABLE, documentationRequired: true },
};

export const STACKING_GOVERNANCE_2026 = {
  mutuallyExclusive: [
    ['B2B_EXCESS_DEBRIS', 'B2B_SPECIAL_HANDLING'],
    ['B2B_HEAVY_SOIL', 'B2B_PET_MESS'],
    ['B2B_SECOND_TRIP', 'B2B_ACCESS_WAIT'],
  ],
  replacesParent: ['B2B_HEAVY_SOIL', 'B2B_PET_MESS'],
  requiresEvidence: ['B2B_EXCESS_DEBRIS', 'B2B_SPECIAL_HANDLING', 'B2B_HEAVY_SOIL', 'B2B_PET_MESS', 'B2B_SECOND_TRIP', 'B2B_ACCESS_WAIT', 'B2B_MATERIALS_COST_PLUS', 'B2B_RUSH'],
};

export function canStackModifiers(modifierIds) {
  const ids = [...new Set(modifierIds || [])];
  return !STACKING_GOVERNANCE_2026.mutuallyExclusive.some((pair) => pair.every((id) => ids.includes(id)));
}
