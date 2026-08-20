import { PRICING_CHANNELS, PRICING_STATUS } from './canonicalPricing2026';
import { getAllB2BOffers, getB2BOffer } from './b2bCommercialCatalog2026';
import { B2B_MODIFIERS_2026, canStackModifiers } from './b2bModifierMatrix2026';
import { resolveB2BOffer } from './b2bPricingResolver2026';
import { B2B_SUBCHANNELS } from './b2bChannelPolicy2026';

describe('PR B B2B commercial pricing spine', () => {
  test('contains the full commercial family inventory', () => {
    const capabilityIds = new Set(getAllB2BOffers().map((offer) => offer.capabilityId));
    ['PROPERTY_TURNOVER', 'COMMERCIAL_HANDYMAN', 'PROPERTY_CONDITION_REPORT', 'ADMIN_SUPPORT', 'SOP_MANUAL_SETUP', 'MOBILE_NOTARY', 'LISTING_SUPPORT', 'CORPORATE_EVENT_SUPPORT', 'NFC_SMARTTAP_CARD', 'WELCOME_PACKAGE', 'PROPERTY_STARTUP_KIT', 'PROPERTY_SUPPORT_RETAINER', 'CUSTOM_PROJECT', 'GOV_CUSTODIAL_FACILITY'].forEach((id) => expect(capabilityIds.has(id)).toBe(true));
  });

  test('requires an explicit commercial subchannel before returning a B2B price', () => {
    const result = resolveB2BOffer('B2B-FAC-HANDYMAN');
    expect(result.amount).toBeNull();
    expect(result.reason).toBe('SUBCHANNEL_REQUIRED');
  });

  test('resolves the approved B2B apartment standard-turn price only for B2B-APT', () => {
    const apartment = resolveB2BOffer('B2B-APT-TURN-STANDARD', { channel: PRICING_CHANNELS.B2B, commercialSubchannel: B2B_SUBCHANNELS.APT });
    const realtor = resolveB2BOffer('B2B-APT-TURN-STANDARD', { channel: PRICING_CHANNELS.B2B, commercialSubchannel: B2B_SUBCHANNELS.RE });
    expect(apartment.status).toBe(PRICING_STATUS.LOCKED);
    expect(apartment.amount).toBe(350);
    expect(realtor.amount).toBeNull();
    expect(realtor.reason).toBe('SUBCHANNEL_NOT_AUTHORIZED');
  });

  test('resolves locked maintenance rates without inheriting B2C discounts', () => {
    const dispatch = resolveB2BOffer('B2B-FAC-DISPATCH', { commercialSubchannel: B2B_SUBCHANNELS.APT });
    const handyman = resolveB2BOffer('B2B-FAC-HANDYMAN', { commercialSubchannel: B2B_SUBCHANNELS.RE });
    expect(dispatch.amount).toBe(85);
    expect(handyman.amount).toBe(55);
    expect(handyman.disclaimers.length).toBeGreaterThan(0);
  });

  test('does not invent unresolved STR pricing', () => {
    const result = resolveB2BOffer('B2B-APT-TURN-STR', { commercialSubchannel: B2B_SUBCHANNELS.APT });
    expect(result.status).toBe(PRICING_STATUS.UNDEFINED);
    expect(result.amount).toBeNull();
  });

  test('locks approved B2B starting rates', () => {
    expect(resolveB2BOffer('B2B-NOT-APOSTILLE', { commercialSubchannel: B2B_SUBCHANNELS.RE }).amount).toBe(175);
    expect(resolveB2BOffer('B2B-NOT-FINGERPRINT', { commercialSubchannel: B2B_SUBCHANNELS.SHARED }).amount).toBe(35);
    expect(resolveB2BOffer('B2B-CREATIVE-NFC-SET', { commercialSubchannel: B2B_SUBCHANNELS.RE }).amount).toBe(75);
  });

  test('does not derive a tumbler unit price from a package price', () => {
    const offer = getB2BOffer('03-TUM');
    const result = resolveB2BOffer('03-TUM', { commercialSubchannel: B2B_SUBCHANNELS.RE });
    expect(offer.baseRate).toBeNull();
    expect(result.amount).toBeNull();
    expect(result.reason).toBe('PRICING_UNDEFINED_PENDING');
  });

  test('government offers remain solicitation/SOW pricing', () => {
    const result = resolveB2BOffer('B2G-561720-S201', { channel: PRICING_CHANNELS.B2G, commercialSubchannel: B2B_SUBCHANNELS.GOVERNMENT });
    expect(result.status).toBe(PRICING_STATUS.UNDEFINED);
    expect(result.amount).toBeNull();
    expect(result.reason).toBe('PRICING_UNDEFINED_PENDING');
    expect(result.disclaimers.map((d) => d.id)).toContain('GOVERNMENT_PROCUREMENT');
  });

  test('proposed enterprise package pricing never reaches customer-facing output', () => {
    const result = resolveB2BOffer('B2B-ENT-RE-TRANSACTION-SUITE', { commercialSubchannel: B2B_SUBCHANNELS.RE });
    expect(result.status).toBe(PRICING_STATUS.UNDEFINED);
    expect(result.amount).toBeNull();
    expect(result.reason).toBe('PRICING_PROPOSED_PENDING');
  });

  test('locked scope-shield modifiers calculate only when explicitly triggered', () => {
    const result = resolveB2BOffer('B2B-APT-TURN-STANDARD', { commercialSubchannel: B2B_SUBCHANNELS.APT, modifierIds: ['B2B_SECOND_TRIP'] });
    expect(result.status).toBe(PRICING_STATUS.LOCKED);
    expect(result.amount).toBe(435);
  });

  test('materials markup requires explicit cost context', () => {
    const missingContext = resolveB2BOffer('B2B-FAC-HANDYMAN', { commercialSubchannel: B2B_SUBCHANNELS.APT, modifierIds: ['B2B_MATERIALS_COST_PLUS'] });
    const priced = resolveB2BOffer('B2B-FAC-HANDYMAN', { commercialSubchannel: B2B_SUBCHANNELS.APT, modifierIds: ['B2B_MATERIALS_COST_PLUS'], modifierContext: { materialCost: 100 } });
    expect(missingContext.reason).toBe('MODIFIER_CONTEXT_REQUIRED');
    expect(priced.amount).toBe(65);
  });

  test('unresolved modifiers never silently price a job', () => {
    const result = resolveB2BOffer('B2B-APT-TURN-STANDARD', { commercialSubchannel: B2B_SUBCHANNELS.APT, modifierIds: ['B2B_EXCESS_DEBRIS'] });
    expect(result.status).toBe(PRICING_STATUS.UNDEFINED);
    expect(result.amount).toBeNull();
  });

  test('modifiers cannot be attached outside their declared scope', () => {
    const result = resolveB2BOffer('B2B-RE-LISTING', { commercialSubchannel: B2B_SUBCHANNELS.RE, modifierIds: ['B2B_SECOND_TRIP'] });
    expect(result.amount).toBeNull();
    expect(result.reason).toBe('MODIFIER_NOT_APPLICABLE_TO_OFFER');
  });

  test('mutually exclusive condition modifiers cannot stack', () => {
    expect(canStackModifiers(['B2B_EXCESS_DEBRIS', 'B2B_SPECIAL_HANDLING'])).toBe(false);
    expect(canStackModifiers(['B2B_SECOND_TRIP', 'B2B_ACCESS_WAIT'])).toBe(false);
    expect(canStackModifiers(['B2B_ADDITIONAL_BEDROOM', 'B2B_ADDITIONAL_BATHROOM'])).toBe(true);
  });
});
