import { easternRequestedStartAt } from './easternRequestedStartAt2026';

describe('customer-entered Eastern request times', () => {
  test('winter standard time', () => {
    expect(easternRequestedStartAt('2026-11-20', '10:00')).toBe('2026-11-20T15:00:00.000Z');
  });
  test('summer daylight time', () => {
    expect(easternRequestedStartAt('2026-07-20', '10:00')).toBe('2026-07-20T14:00:00.000Z');
  });
  test('spring-forward nonexistent hour is rejected', () => {
    expect(() => easternRequestedStartAt('2027-03-14', '02:30')).toThrow(/does not exist/);
  });
  test('fall-back ambiguous hour is rejected', () => {
    expect(() => easternRequestedStartAt('2026-11-01', '01:30')).toThrow(/occurs twice/);
  });
  test('adjacent transition times remain valid', () => {
    expect(easternRequestedStartAt('2027-03-14', '03:30')).toBe('2027-03-14T07:30:00.000Z');
    expect(easternRequestedStartAt('2026-11-01', '02:30')).toBe('2026-11-01T07:30:00.000Z');
  });
  test('invalid dates cannot roll into another month', () => {
    expect(() => easternRequestedStartAt('2026-02-30', '10:00')).toThrow(/valid/);
  });
});
