import { getCommercialRecord, isCanonicalActive } from '../../config/commercialRegistry';

const roundMoney = (value) => Number(Number(value).toFixed(2));

export function resolveB2CCustomerPrice({
  baseServiceId,
  isVerifiedResident = false,
  hasHeavySoilTier2 = false,
}) {
  const record = getCommercialRecord(baseServiceId);
  if (!record || !isCanonicalActive(baseServiceId) || record.channel !== 'B2C_RETAIL') {
    throw new Error('Commercial Block: Unauthorized or malformed B2C service token.');
  }

  let calculatedPrice = record.baseCustomerPrice;

  if (hasHeavySoilTier2) {
    if (!record.allowedModifiers.includes('SVR-SOIL-T2')) {
      throw new Error('Structural Error: Selected service class rejects soil severity modification.');
    }
    calculatedPrice += 150;
  }

  if (isVerifiedResident && record.residentDiscountEligible) {
    calculatedPrice *= 0.85;
  }

  return roundMoney(calculatedPrice);
}

export function resolveB2BTurnPrice({
  baseServiceId,
  bedrooms,
  bathrooms,
  totalSquareFootage,
}) {
  const record = getCommercialRecord(baseServiceId);
  const allowedTurnIds = ['B2B-TURN-ROUGH', 'B2B-TURN-FINAL', 'B2B-TURN-DETAIL'];

  if (!record || !isCanonicalActive(baseServiceId) || !allowedTurnIds.includes(baseServiceId)) {
    throw new Error('Commercial Block: Invalid or deprecated portfolio token lookup.');
  }

  if (!Number.isFinite(bedrooms) || !Number.isFinite(bathrooms) || !Number.isFinite(totalSquareFootage)) {
    throw new Error('Commercial Block: B2B footprint dimensions must be numeric.');
  }

  let finalPrice = record.baseCustomerPrice;

  if (bedrooms === 1 && bathrooms === 1) finalPrice -= 50;
  else if (bedrooms === 3 && bathrooms === 2) finalPrice += 100;
  else if (bedrooms === 4 && bathrooms === 3) finalPrice += 225;

  if (totalSquareFootage > 1100) {
    finalPrice += (totalSquareFootage - 1100) * 0.15;
  }

  return roundMoney(finalPrice);
}

export function resolveCommercialPrice(payload) {
  const record = getCommercialRecord(payload?.baseServiceId);
  if (!record || record.status !== 'CANONICAL_ACTIVE') {
    throw new Error('Commercial Block: Service is unavailable or deprecated.');
  }

  if (record.channel === 'B2C_RETAIL') return resolveB2CCustomerPrice(payload);

  if (record.channel === 'B2B_VOLUME' && payload?.bedrooms != null) {
    return resolveB2BTurnPrice(payload);
  }

  if (record.model === 'FIXED_FLAT' || record.model === 'RETAINER_SUITE') {
    return roundMoney(record.baseCustomerPrice);
  }

  if (record.model === 'BESPOKE_SOW') {
    return null;
  }

  throw new Error('Commercial Block: No governed resolver exists for this service class.');
}
