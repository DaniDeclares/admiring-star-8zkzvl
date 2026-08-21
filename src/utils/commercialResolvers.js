import { getCommercialRecord, CHANNEL_TYPES } from '../config/commercialRegistry';

const roundMoney = (value) => Number(Number(value).toFixed(2));

export function resolveB2CCustomerPrice({ baseServiceId, isVerifiedResident = false, hasHeavySoilTier2 = false }) {
  const record = getCommercialRecord(baseServiceId);
  if (!record || record.status !== 'CANONICAL_ACTIVE' || record.channel !== CHANNEL_TYPES.B2C_RETAIL) {
    throw new Error('Commercial Block: unauthorized or deprecated B2C service token.');
  }

  let price = record.baseCustomerPrice;

  if (hasHeavySoilTier2) {
    if (!record.allowedModifiers.includes('SVR-SOIL-T2')) {
      throw new Error('Commercial Block: selected service does not allow soil severity modification.');
    }
    price += 150;
  }

  if (isVerifiedResident && record.residentDiscountEligible) {
    price *= 0.85;
  }

  return roundMoney(price);
}

export function resolveB2BTurnPrice({ baseServiceId, bedrooms, bathrooms, totalSquareFootage }) {
  const allowed = ['B2B-TURN-ROUGH', 'B2B-TURN-FINAL', 'B2B-TURN-DETAIL'];
  if (!allowed.includes(baseServiceId)) {
    throw new Error('Commercial Block: invalid B2B turnover token.');
  }

  const record = getCommercialRecord(baseServiceId);
  if (!record || record.status !== 'CANONICAL_ACTIVE' || record.channel !== CHANNEL_TYPES.B2B_VOLUME) {
    throw new Error('Commercial Block: invalid or deprecated B2B turnover token.');
  }

  let price = record.baseCustomerPrice;

  if (bedrooms === 1 && bathrooms === 1) price -= 50;
  else if (bedrooms === 3 && bathrooms === 2) price += 100;
  else if (bedrooms === 4 && bathrooms === 3) price += 225;

  if (totalSquareFootage > 1100) {
    price += (totalSquareFootage - 1100) * 0.15;
  }

  return roundMoney(price);
}

export function assertCommercialAuthority(serviceId) {
  const record = getCommercialRecord(serviceId);
  if (!record || record.status !== 'CANONICAL_ACTIVE') {
    throw new Error('Commercial Block: service is unavailable or deprecated.');
  }
  return Object.freeze({
    serviceId: record.serviceId,
    customerPrice: record.baseCustomerPrice,
    channel: record.channel,
    executionMode: record.stripeExecutionMode,
    fulfillmentLane: record.providerIsolationLane,
  });
}

// Provider Wall: providers receive fulfillment instructions and approved payout terms;
// they never become a source of public pricing or marketing copy.
export function assertProviderWall({ actorType, writesCustomerPrice = false, writesCustomerMarketing = false }) {
  if (actorType === 'PROVIDER' && (writesCustomerPrice || writesCustomerMarketing)) {
    throw new Error('Provider Wall: providers cannot write customer-facing price or marketing authority.');
  }
  return true;
}
