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

  // DNI-01A-009 is deliberately fail-closed (status: FULFILLMENT_GATED) in the
  // live static registry as of 4014b6b "fail closed on static commercial
  // registry authority" -- that file is legacy compatibility metadata only,
  // not the runtime commercial authority (Supabase is). The tests below exist
  // to exercise resolveB2CCustomerPrice/resolveCommercialPrice's own
  // subchannel/pricing/modifier branching, not the registry's current
  // activation flag, so they stub activation rather than depending on it.
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
    // resolveCommercialPrice checks record.status directly rather than going
    // through isCanonicalActive, so this one test also needs
    // getCommercialRecord stubbed to report CANONICAL_ACTIVE.
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
