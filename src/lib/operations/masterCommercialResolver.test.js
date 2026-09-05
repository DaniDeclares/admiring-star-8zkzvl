import { getCommercialRecord } from '../../config/commercialRegistry';
import {
  resolveB2CCustomerPrice,
  resolveCommercialPrice,
} from './masterCommercialResolver';

describe('master commercial registry', () => {
  test('uses current canonical launch service identities and blocks deprecated offers', () => {
    expect(getCommercialRecord('DNI-01A-009').baseCustomerPrice).toBe(59);
    expect(() => resolveB2CCustomerPrice({ baseServiceId: 'B2C-CLEAN-DEEP-LEGACY-H' })).toThrow(/Commercial Block/);
  });

  test('requires an explicit CH01 resident subchannel', () => {
    expect(resolveB2CCustomerPrice({
      baseServiceId: 'DNI-01A-009',
      residentSubchannel: 'CH01-A',
      isVerifiedResident: false,
      hasHeavySoilTier2: false,
    })).toBe(59);

    expect(() => resolveB2CCustomerPrice({
      baseServiceId: 'DNI-01A-009',
      residentSubchannel: 'CH01-C',
    })).toThrow(/resident subchannel/);
  });

  test('fails closed when CH01-B has no governed apartment-resident price', () => {
    expect(() => resolveB2CCustomerPrice({
      baseServiceId: 'DNI-01A-009',
      residentSubchannel: 'CH01-B',
    })).toThrow(/apartment resident price is not governed/);
  });

  test('rejects a severity modifier on a service that does not allow it', () => {
    expect(() => resolveB2CCustomerPrice({
      baseServiceId: 'DNI-01A-009',
      residentSubchannel: 'CH01-A',
      isVerifiedResident: false,
      hasHeavySoilTier2: true,
    })).toThrow(/rejects soil severity/);
  });

  test('resolves the current fixed-flat launch offer through the commercial resolver', () => {
    expect(resolveCommercialPrice({
      baseServiceId: 'DNI-01A-009',
      residentSubchannel: 'CH01-A',
    })).toBe(59);
  });
});
