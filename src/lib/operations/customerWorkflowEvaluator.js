import { evaluateSalesAutomationAction, WORKFLOW_ACTION } from './reusableSalesAutomationPolicy';

/**
 * DANI native workflow recipe evaluator (planning only).
 * No network, database, email, payment, or dispatch side effects.
 * Callers MUST obtain authenticatedTenantId and identityAuthorized from server-side auth,
 * not from editable workflow/event payloads.
 */
const SIGNALS = Object.freeze([
  'INQUIRY_RECEIVED', 'CONTACT_REPLIED', 'DEAL_STAGE_CHANGED',
  'QUOTE_ACCEPTED', 'PAYMENT_VERIFIED', 'JOB_COMPLETED', 'QA_APPROVED',
  'RENEWAL_DUE',
]);
const FIELDS = Object.freeze(['channel', 'buyerVerified', 'offerLiveReady',
  'contactPermitted', 'dealStage', 'paymentVerified', 'qaApproved', 'priority']);
const OPERATORS = Object.freeze(['EQ', 'IN', 'GT', 'EXISTS']);
const ACTIONS = new Set(Object.values(WORKFLOW_ACTION));
const internalId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const primitive = value => value === null || ['string','number','boolean'].includes(typeof value);
const comparable = value => typeof value === 'number' && Number.isFinite(value);

export function validateCustomerWorkflow(recipe) {
  const errors = [];
  if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) return ['INVALID_RECIPE'];
  if (!internalId(recipe.id)) errors.push('INVALID_RECIPE_ID');
  if (!internalId(recipe.tenantId)) errors.push('INVALID_TENANT_ID');
  if (!SIGNALS.includes(recipe.trigger)) errors.push('INVALID_TRIGGER');
  if (!ACTIONS.has(recipe.action)) errors.push('UNKNOWN_ACTION');
  if (recipe.enabled !== true) errors.push('NOT_ENABLED');
  if (!Array.isArray(recipe.conditions) || recipe.conditions.length > 12) errors.push('INVALID_CONDITIONS');
  else for (const c of recipe.conditions) {
    if (!c || !FIELDS.includes(c.field) || !OPERATORS.includes(c.operator)) {
      errors.push('UNSUPPORTED_CONDITION'); continue;
    }
    if (c.operator === 'IN') {
      if (!Array.isArray(c.value) || c.value.length < 1 || c.value.length > 20 ||
        !c.value.every(primitive)) errors.push('INVALID_CONDITION_VALUE');
    } else if (c.operator === 'GT') {
      if (!comparable(c.value)) errors.push('INVALID_CONDITION_VALUE');
    } else if (c.operator !== 'EXISTS' && !primitive(c.value)) errors.push('INVALID_CONDITION_VALUE');
  }
  return [...new Set(errors)];
}

function matches(condition, attributes) {
  const has = own(attributes, condition.field);
  const actual = has ? attributes[condition.field] : undefined;
  if (condition.operator === 'EXISTS') return has && actual !== null && actual !== undefined;
  if (condition.operator === 'EQ') return actual === condition.value;
  if (condition.operator === 'IN') return condition.value.includes(actual);
  if (condition.operator === 'GT') return comparable(actual) && actual > condition.value;
  return false;
}

export function evaluateCustomerWorkflow(recipe, event, auth = {}) {
  const reasons = validateCustomerWorkflow(recipe);
  if (!event || typeof event !== 'object' || Array.isArray(event) ||
      !internalId(event.id)) reasons.push('INVALID_EVENT');
  if (recipe?.tenantId !== event?.tenantId || auth.authenticatedTenantId !== recipe?.tenantId ||
      auth.identityAuthorized !== true || auth.tenantMembershipVerified !== true) reasons.push('TENANT_SCOPE_NOT_VERIFIED');
  if (event?.signal !== recipe?.trigger) reasons.push('TRIGGER_MISMATCH');
  if (!event?.attributes || typeof event.attributes !== 'object' ||
      Array.isArray(event.attributes)) reasons.push('INVALID_ATTRIBUTES');
  if (reasons.length) return Object.freeze({ eligible:false, reasons:Object.freeze([...new Set(reasons)]), candidate:null });
  if (!recipe.conditions.every(c => matches(c, event.attributes))) {
    return Object.freeze({ eligible:false, reasons:Object.freeze(['CONDITIONS_NOT_MET']), candidate:null });
  }
  const policy = evaluateSalesAutomationAction({
    action:recipe.action,
    tenantId:recipe.tenantId,
    recordTenantId:event.tenantId,
    source:event.source,
    evidence:event.evidence || {},
    claimsCollectedRevenue:event.claimsCollectedRevenue === true,
  },auth);
  if (!policy.allowed) {
    return Object.freeze({ eligible:false, reasons:policy.reasons, candidate:null });
  }
  // Stable dedupe key for existing outbox/queue adapter; not a dispatch command.
  const key = [recipe.tenantId,recipe.id,event.id,recipe.action].join(':');
  return Object.freeze({
    eligible:true,
    reasons:Object.freeze([]),
    candidate:Object.freeze({ action:recipe.action, tenantId:recipe.tenantId,
      recipeId:recipe.id, eventId:event.id, idempotencyKey:key,
      status:'PROPOSED_ONLY', effect:'NO_SIDE_EFFECTS' }),
  });
}

export function evaluateCustomerWorkflows(recipes, event, auth) {
  if (!Array.isArray(recipes) || recipes.length > 100) throw new TypeError('recipes must be an array of at most 100');
  return recipes.map(recipe => evaluateCustomerWorkflow(recipe,event,auth));
}
