// Convert a customer-entered Eastern wall time to an unambiguous UTC instant.
// Do not depend on the visitor's browser timezone or a fixed seasonal offset.
// Reject the spring DST gap and fall DST fold until the customer chooses a new time.
const TIMEZONE = 'America/New_York';
const easternClock = new Intl.DateTimeFormat('en-US', {
  timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

function easternWallParts(instant) {
  return Object.fromEntries(
    easternClock.formatToParts(instant)
      .filter(part => ['year', 'month', 'day', 'hour', 'minute'].includes(part.type))
      .map(part => [part.type, part.value])
  );
}

export function easternRequestedStartAt(date, time) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date || '') || !/^([01]\\d|2[0-3]):[0-5]\\d$/.test(time || '')) {
    throw new Error('Enter a valid requested date and time.');
  }

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const reconstructed = new Date(wallAsUtc);
  if (reconstructed.getUTCFullYear() !== year ||
      reconstructed.getUTCMonth() !== month - 1 ||
      reconstructed.getUTCDate() !== day) {
    throw new Error('Enter a valid requested date and time.');
  }

  const target = { year: String(year).padStart(4, '0'), month: String(month).padStart(2, '0'),
    day: String(day).padStart(2, '0'), hour: String(hour).padStart(2, '0'), minute: String(minute).padStart(2, '0') };

  // New York uses UTC-05:00 in winter and UTC-04:00 in summer.
  // Round-trip both offsets through IANA timezone rules to determine the
  // actual offset for this specific date (including DST transition days).
  const matches = [4, 5].map(hours => new Date(wallAsUtc + hours * 60 * 60 * 1000))
    .filter(candidate => {
      const parts = easternWallParts(candidate);
      return Object.keys(target).every(key => parts[key] === target[key]);
    });

  if (matches.length !== 1) {
    throw new Error(matches.length === 0
      ? 'That Eastern time does not exist because clocks move forward. Choose another time.'
      : 'That Eastern time occurs twice because clocks move back. Choose another time.');
  }
  return matches[0].toISOString();
}
