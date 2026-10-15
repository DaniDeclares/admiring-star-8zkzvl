import { CHANNELS, CH01_SUBCHANNELS, COMMERCIAL_OBJECT_TYPES, DIVISIONS } from './canonicalCatalogRegistry';

describe('canonical catalog authority invariants', () => {
  test('preserves 13 divisions and seven commercial object types', () => {
    expect(DIVISIONS).toHaveLength(13);
    expect(new Set(DIVISIONS.map(({ id }) => id)).size).toBe(13);
    expect(COMMERCIAL_OBJECT_TYPES).toEqual([
      'SERV', 'PROD', 'DIGITAL', 'KIT', 'RET', 'EVENT', 'WORK-ORDER',
    ]);
  });

  test('preserves exactly five owner-confirmed channels with no CH06', () => {
    expect(CHANNELS.map(({ id }) => id)).toEqual(['CH01', 'CH02', 'CH03', 'CH04', 'CH05']);
    expect(CHANNELS.some(({ id }) => id === 'CH06')).toBe(false);
  });

  test('CH01-A is property-activated and CH01-B is direct', () => {
    expect(CH01_SUBCHANNELS).toEqual([
      { id: 'CH01-A', name: 'Property-Activated Residents' },
      { id: 'CH01-B', name: 'Direct Residents' },
    ]);
  });
});
