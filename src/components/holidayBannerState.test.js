import { CHRISTMAS_START, CHRISTMAS_END, holidayBannerState } from './holidayBannerState';

test('countdown remains visible immediately before Christmas in Eastern time', () => {
  expect(holidayBannerState(CHRISTMAS_START - 1)).toEqual({ phase: 'countdown', days: 1 });
});
test('Christmas greeting appears at midnight Eastern December 25', () => {
  expect(holidayBannerState(CHRISTMAS_START)).toEqual({ phase: 'christmas', days: 0 });
  expect(holidayBannerState(CHRISTMAS_END - 1)).toEqual({ phase: 'christmas', days: 0 });
});
test('banner disappears at midnight Eastern December 26', () => {
  expect(holidayBannerState(CHRISTMAS_END)).toEqual({ phase: 'hidden', days: 0 });
});
test('countdown has no timezone dependency', () => {
  expect(holidayBannerState(Date.parse('2026-12-24T00:00:00-05:00'))).toEqual({ phase: 'countdown', days: 1 });
});
