import * as commercialRegistry from '../../config/commercialRegistry';
import {
  resolveB2CCustomerPrice,
  resolveCommercialPrice,
} from './masterCommercialResolver';

describe('master commercial registry', () => {
  test('uses current canonical launch service identities and blocks deprecated offers', () => {
    expect(commercialRegistry.getCommercialRecord('DNI-01A-009').baseCustomerPrice).toBe(59);
    expect(() => resolveB2CCustomerPrice({ baseServiceId: 'B2C-CLEAN-DEEP-LEGACY-H' })).toThrow(/Commercial Block/);
  });

  describe('resolver behavior for an active B2C launch offer', () => {
    let isCanonicalActiveSpy;
    beforeEach(() => {
      isCanonicalActiveSpy = jest
        .spyOn(commercialRegistry, 'isCanonicalActive')
        .mockImplementation((idOrRecord) => {
          const id = typeof idOrRecord === 'string' ? idOrRecord : idOrRecord?.serviceId;
          return id === 'DNI-01A-009';
        });
    });
    afterEach(() => {
      isCanonicalActiveSpy.mockRestore();
    });

    runResolverBehaviorTests();
  });
});

function runResolverBehaviorTests() {
  test('keeps CH01-A at regular/direct resident pricing even when a resident identity is verified', () => {
    expect(resolveB2CCustomerPrice({
      baseServiceId: 'DNI-01A-009',
      residentSubchannel: 'CH01-A',
      isVerifiedResident: true,
      hasHeavySoilTier2: false,
    })).toBe(59);

    expect(() => resolveB2CCustomerPrice({
      baseServiceId: 'DNI-01A-009',
      residentSubchannel: 'CH01-C',
    })).toThrow(/resident subchannel/);
  });

  test('requires verified property-resident identity before CH01-B pricing', () => {
    expect(() => resolveB2CCustomerPrice({
      baseServiceId: 'DNI-01A-009',
      residentSubchannel: 'CH01-B',
      isVerifiedResident: false,
    })).toThrow(/verified apartment\/property resident relationship/);
  });

  test('fails closed when verified CH01-B has no governed apartment-resident price', () => {
    expect(() => resolveB2CCustomerPrice({
      baseServiceId: 'DNI-01A-009',
      residentSubchannel: 'CH01-B',
      isVerifiedResident: true,
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
    const realRecord = jest.requireActual('../../config/commercialRegistry').getCommercialRecord('DNI-01A-009');
    const getCommercialRecordSpy = jest
      .spyOn(commercialRegistry, 'getCommercialRecord')
      .mockImplementation((id) => (id === 'DNI-01A-009' ? { ...realRecord, status: 'CANONICAL_ACTIVE' } : realRecord));

    try {
      expect(resolveCommercialPrice({
        baseServiceId: 'DNI-01A-009',
        residentSubchannel: 'CH01-A',
      })).toBe(59);
    } finally {
      getCommercialRecordSpy.mockRestore();
    }
  });
}
