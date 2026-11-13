// Christmas banner uses Eastern Standard Time for December 2026 boundaries.
export const CHRISTMAS_START = Date.parse('2026-12-25T00:00:00-05:00');
export const CHRISTMAS_END = Date.parse('2026-12-26T00:00:00-05:00');

export function holidayBannerState(now = Date.now()) {
  if (now >= CHRISTMAS_END) return { phase: 'hidden', days: 0 };
  if (now >= CHRISTMAS_START) return { phase: 'christmas', days: 0 };
  return { phase: 'countdown', days: Math.ceil((CHRISTMAS_START - now) / 86400000) };
}
