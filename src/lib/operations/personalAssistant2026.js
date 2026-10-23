import { ownerAttentionNow } from './ownerAttentionRank2026.js';

export const ASSISTANT_TIMEZONE = 'America/New_York';

export function ownerDayParts(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: ASSISTANT_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map(part => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, weekday: parts.weekday,
    minute: Number(parts.hour) * 60 + Number(parts.minute),
    weekend: parts.weekday === 'Sat' || parts.weekday === 'Sun' };
}

const validTime = value => value && Number.isFinite(new Date(value).getTime());
const terminal = value => /^(CANCELLED|CANCELED|COMPLETED|DECLINED|NO_SHOW)$/.test(String(value || '').toUpperCase());

/** A presentation of existing authority, not a new business ranking or task queue. */
export function assistantDay(snapshot, now = new Date()) {
  const day = ownerDayParts(now);
  const weekendProtected = day.weekend && day.date >= '2026-10-26';
  const phase = weekendProtected ? 'weekend' : day.minute < 540 ? 'before' : day.minute >= 1020 ? 'closed' : day.minute >= 990 ? 'wrap' : 'work';
  const jobs = new Map((snapshot?.jobs || []).map(job => [job.id, job]));
  const appointments = (snapshot?.appointments || []).filter(row => {
    if (!validTime(row.starts_at) || terminal(row.appointment_status)) return false;
    const end = validTime(row.ends_at) ? new Date(row.ends_at) : new Date(row.starts_at);
    return end >= now;
  }).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)).slice(0, 8).map(row => ({
    id: row.id, title: jobs.get(row.job_id)?.job_title || 'Recorded appointment',
    start: row.starts_at, end: row.ends_at,
    status: row.appointment_status || 'Status not supplied',
    outsideHours: (() => { const p = ownerDayParts(new Date(row.starts_at)); return p.weekend || p.minute < 540 || p.minute >= 1020; })(),
    source: 'Existing appointment record', href: '/portal/operations',
  }));
  const attention = ownerAttentionNow(snapshot?.ownerAttention || []).map(row => ({
    id: row.id, title: row.reason || 'Review owner decision',
    instruction: row.metadata?.governor?.next_action || row.recommended_action || 'Open the source and review what is needed.',
    href: '#attention', source: 'Existing owner attention',
  }));
  const dueSoon = appointments.find(row => {
    const minutes = (new Date(row.start) - now) / 60000;
    return minutes <= 30 && ownerDayParts(new Date(row.start)).date === day.date;
  });
  const preparation = (snapshot?.ownerAttention || []).filter(row => {
    const date = row.metadata?.date;
    return String(row.status || 'OPEN').toUpperCase() === 'OPEN'
      && /^\d{4}-\d{2}-\d{2}$/.test(date || '') && validTime(`${date}T12:00:00Z`) && date >= day.date
      && !(snapshot?.appointments || []).some(a => a.job_id && a.job_id === row.source_record_id);
  }).map(row => ({ id: row.id, title: row.metadata?.name || row.reason || 'Recorded event',
    date: row.metadata.date, instruction: row.recommended_action || 'Check the organizer instructions and prepare during work hours.' }));
  return { ...day, phase, appointments, preparation, attention, dueSoon,
    degraded: snapshot?.platformDiagnostics?.degradedSources || [] };
}

export const ASSISTANT_WORK_LINKS = [
  { key: 'marketing', title: 'Marketing', instruction: 'Open the existing campaign task. Work its next permitted action and keep the distribution receipt.', href: 'https://app.asana.com/1/1218540418974397/task/1218769775620576', source: 'Existing campaign task' },
  { key: 'products', title: 'Products & delivery', instruction: 'Review existing paid work and product delivery. Keep held products out of promotion until cleared.', href: '/portal/operations', source: 'Existing Operations workspace' },
  { key: 'events', title: 'Event preparation', instruction: 'Check the upcoming appointments below, then prepare materials and logistics during work hours. Attendance remains a separate decision.', href: '#assistant-appointments', source: 'Loaded appointment records; calendar coverage is incomplete' },
];
