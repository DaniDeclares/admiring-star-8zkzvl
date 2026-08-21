import { getCommercialRecord } from '../../config/commercialRegistry';
import {
  resolveB2CCustomerPrice,
  resolveB2BTurnPrice,
  resolveCommercialPrice,
} from './masterCommercialResolver';

describe('master commercial registry', () => {
  test('uses canonical serviceId fields and blocks deprecated offers', () => {
    expect(getCommercialRecord('B2C-CLEAN-DEEP-2B2B').baseCustomerPrice).toBe(325);
    expect(() => resolveB2CCustomerPrice({ baseServiceId: 'B2C-CLEAN-DEEP-LEGACY-H' })).toThrow(/Commercial Block/);
  });

  test('applies the resident 15% perk after the heavy-soil surcharge', () => {
    expect(resolveB2CCustomerPrice({
      baseServiceId: 'B2C-CLEAN-STD-2B2B',
      isVerifiedResident: true,
      hasHeavySoilTier2: true,
    })).toBe(255);
  });

  test('rejects a severity modifier on a service that does not allow it', () => {
    expect(() => resolveB2CCustomerPrice({
      baseServiceId: 'B2C-NOTARY-POA',
      isVerifiedResident: false,
      hasHeavySoilTier2: true,
    })).toThrow(/rejects soil severity/);
  });

  test('calculates B2B footprint adjustments from the 2BR/2BA 1100 sqft anchor', () => {
    expect(resolveB2BTurnPrice({
      baseServiceId: 'B2B-TURN-ROUGH',
      bedrooms: 1,
      bathrooms: 1,
      totalSquareFootage: 1100,
    })).toBe(400);

    expect(resolveB2BTurnPrice({
      baseServiceId: 'B2B-TURN-FINAL',
      bedrooms: 3,
      bathrooms: 2,
      totalSquareFootage: 1200,
    })).toBe(765);

    expect(resolveB2BTurnPrice({
      baseServiceId: 'B2B-TURN-DETAIL',
      bedrooms: 4,
      bathrooms: 3,
      totalSquareFootage: 1500,
    })).toBe(1475);
  });

  test('does not invent a price for bespoke SOW offers', () => {
    expect(resolveCommercialPrice({ baseServiceId: 'B2C-EVNT-FULL' })).toBeNull();
  });
});
