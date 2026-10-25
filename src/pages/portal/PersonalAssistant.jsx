import React, { useEffect, useMemo, useRef, useState } from 'react';
import { assistantDay, ASSISTANT_TIMEZONE, ASSISTANT_WORK_LINKS } from '../../lib/operations/personalAssistant2026.js';
import './PersonalAssistant.css';

const stamp = value => new Intl.DateTimeFormat('en-US', { timeZone: ASSISTANT_TIMEZONE,
  weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(value));
const clockText = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** Owner-only UI companion. Personal inputs remain in memory and never enter business APIs. */
export default function PersonalAssistant({ session, clockState, clockBusy, onBreak, onResume, onClockOut }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [focus, setFocus] = useState(null);
  const [reviewed, setReviewed] = useState([]);
  const [school, setSchool] = useState('');
  const [schoolDraft, setSchoolDraft] = useState('');
  const [help, setHelp] = useState(false);
  const [timer, setTimer] = useState(null);
  const identity = session?.user?.id || session?.access_token;
  const lastIdentity = useRef(identity);
  useEffect(() => {
    if (lastIdentity.current !== identity) {
      setSchool(''); setSchoolDraft(''); setFocus(null); setReviewed([]); setTimer(null); setSnapshot(null); setLoadedAt(null);
      lastIdentity.current = identity;
    }
  }, [identity]);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  useEffect(() => {
    if (!session?.access_token) return;
    const controller = new AbortController();
    setLoading(true); setError(''); setSnapshot(null); setLoadedAt(null);
    fetch('/api/portal-operations?ownerDashboard=1', {
      headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store', signal: controller.signal,
    }).then(async response => {
      const body = await response.json();
      if (!response.ok || body.success !== true) throw new Error(body.error || 'Your HQ information could not load.');
      if (!controller.signal.aborted) { setSnapshot(body); setLoadedAt(Date.now()); }
    }).catch(e => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [session?.access_token, refresh]);
  const day = useMemo(() => assistantDay(snapshot, new Date(now)), [snapshot, now]);
  const paused = clockState === 'paused';
  // Pause the focus countdown with the existing server clock. No extra clock punches.
  useEffect(() => {
    if (clockState !== 'running' && timer?.end) setTimer({ remaining: Math.max(0, Math.ceil((timer.end - Date.now()) / 1000)) });
    else if (clockState === 'running' && timer?.remaining) setTimer({ end: Date.now() + timer.remaining * 1000 });
  }, [clockState, timer]);
  const seconds = timer?.end ? Math.max(0, Math.ceil((timer.end - now) / 1000)) : timer?.remaining ?? null;
  const stale = loadedAt && now - loadedAt > 5 * 60 * 1000;
  const canGuide = snapshot && !error && !stale && day.phase === 'work';
  const next = canGuide && (day.dueSoon ? {
    key: `appointment:${day.dueSoon.id}`, title: `Prepare for ${day.dueSoon.title}`,
    instruction: `${stamp(day.dueSoon.start)}. Check the recorded status, arrival details and your attendance decision before leaving.`,
    href: day.dueSoon.href, source: day.dueSoon.source,
  } : day.attention.filter(row => !reviewed.includes(row.id)).map(row => ({ ...row, key: row.id }))[0]);
  const selected = canGuide ? focus || next : null;
  const choose = item => { setFocus(item); setHelp(false); setTimer(null); };
  const advance = () => { if (selected) setReviewed(rows => [...rows, selected.key]); setFocus(null); setTimer(null); setHelp(false); };
  const greeting = { before: 'Your day starts at 9.', work: 'Dani, let’s take the next step.', wrap: 'Let’s finish the day well.', closed: 'Your workday is over.', weekend: 'Your weekend is protected.' }[day.phase];
  if (!session?.access_token) return null;
  return <section className="portal-card personal-assistant" aria-label="Your personal assistant">
    <header className="pa-header"><div><p className="portal-eyebrow">Your personal assistant</p><h2>{greeting}</h2><p>One thing at a time. Monday–Friday, 9 a.m.–5 p.m. Eastern.</p></div><button type="button" disabled={loading} onClick={() => setRefresh(n => n + 1)}>Refresh my day</button></header>
    {loading && <p role="status">Getting your current HQ records…</p>}
    {error && <p className="portal-alert" role="alert">{error} Refresh to try again. I can’t tell what is due from an unavailable source.</p>}
    {stale && <p className="portal-alert" role="status">Your snapshot is over five minutes old. Refresh before choosing the next action.</p>}
    {loadedAt && <p className="pa-source">HQ snapshot checked {stamp(loadedAt)}. Calendar, school and external task feeds are not fully connected here.</p>}
    {!!day.degraded.length && <p className="portal-alert">Some HQ sources are unavailable. Check their original records before acting.</p>}
    {(day.phase === 'closed' || day.phase === 'wrap') && <div className="pa-focus"><h3>Your wrap-up</h3><ol><li>Save the work you touched in its original record.</li><li>Record any real outcome or blocker there.</li><li>Leave tomorrow’s next action, then clock out.</li></ol><p>{reviewed.length} item(s) reviewed in this tab. This does not mark business tasks complete.</p><button type="button" disabled={clockBusy || clockState === 'out'} onClick={onClockOut}>Save my time & clock out</button><p className="pa-source">Only the existing time ledger is saved by this button. No background work is started.</p></div>}
    {day.phase === 'weekend' && <p>Existing commitments stay recorded. Review an event and explicitly decide attendance; no routine work is scheduled for you here.</p>}
    {day.phase === 'before' && <p>Check upcoming commitments below. Your guided work blocks begin at 9 a.m.</p>}
    {day.phase === 'work' && <>
      <div className="pa-focus"><p className="portal-eyebrow">Do this now</p><h3 aria-live="polite">{selected?.title || (canGuide ? 'Choose one focus for this block.' : 'Refresh your day to get started.')}</h3><p>{selected?.instruction || (canGuide ? 'The loaded owner-attention list has no next item for you. You can still choose marketing, products, event preparation or school below.' : 'I’ll use your saved HQ records and clearly show what is missing.')}</p>
        {selected && <><p className="pa-source">Source: {selected.source}</p><a className="pa-open" href={selected.href || '#owner-work-clock'} {...(selected.href?.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>Open the work →</a>
          <div className="pa-actions"><button type="button" disabled={clockState !== 'running'} onClick={() => { setNow(Date.now()); setTimer({ end: Date.now() + 600000 }); }}>Focus for 10 minutes</button><button type="button" onClick={() => setHelp(v => !v)}>I’m stuck</button><button type="button" onClick={advance}>Ready for the next item</button></div>
          {clockState === 'out' && <p>Use the clock below to start recording work time.</p>}
          {help && <div className="pa-help"><strong>Let’s make it smaller.</strong><ol><li>Open the source record.</li><li>Find the one decision, file or reply that is needed.</li><li>Do the smallest permitted step. If blocked, save the exact blocker in that record.</li></ol><p>You don’t have to solve the whole project in this block.</p></div>}
        </>}
        {seconds !== null && <p className="pa-timer" aria-live={seconds === 0 ? 'polite' : 'off'}>{seconds === 0 ? 'Time to check in. Save your progress, continue, or take a break.' : `${clockText(seconds)} ${paused ? '· paused' : 'remaining'}`}</p>}
      </div>
      <div className="pa-actions"><button type="button" disabled={clockBusy || clockState !== 'running'} onClick={onBreak}>Take a break</button><button type="button" disabled={clockBusy || !paused} onClick={onResume}>I’m back</button></div>
      <div className="pa-choices">{ASSISTANT_WORK_LINKS.map(item => <button type="button" key={item.key} disabled={!canGuide} onClick={() => choose(item)}>{item.title}</button>)}</div>
      <details><summary>School or a private focus</summary><p>This stays only in this tab and clears on reload or sign-out. It is not sent to DANI’s business systems or treated as an imported school assignment.</p><form onSubmit={event => { event.preventDefault(); if (!schoolDraft.trim() || !canGuide) return; setSchool(schoolDraft.trim()); choose({ key: 'private-focus', title: schoolDraft.trim(), instruction: 'Open your assignment or materials. Identify the next small step, and work on that for one focus block.', source: 'Entered by you in this tab' }); }}><label htmlFor="pa-school">What do you need to work on?</label><input id="pa-school" maxLength={200} value={schoolDraft} onChange={event => setSchoolDraft(event.target.value)} /><button type="submit" disabled={!canGuide || !schoolDraft.trim()}>Help me focus on this</button></form>{school && <button type="button" onClick={() => { setSchool(''); setSchoolDraft(''); if (focus?.key === 'private-focus') setFocus(null); }}>Clear private focus</button>}</details>
    </>}
    <details id="assistant-appointments"><summary>Upcoming commitments & preparation</summary><p>These are the loaded DANI appointments and dated event records, not a complete personal calendar. Their presence does not approve attendance.</p>{day.appointments.map(row => <div className="pa-appointment" key={row.id}><strong>{row.title}</strong><span>{stamp(row.start)} · {row.status}</span>{row.outsideHours && <span>Outside your usual hours — attendance decision needed.</span>}<a href={row.href}>Review appointment & preparation →</a></div>)}{day.preparation.map(row => <div className="pa-appointment" key={row.id}><strong>{row.title}</strong><span>{row.date} · confirm arrival and program times</span><p>{row.instruction}</p><span>Prepare during work hours; attendance remains your decision.</span><a href="#attention">Review the source event →</a></div>)}{!loading && !day.appointments.length && !day.preparation.length && <p>No upcoming commitments were returned in this snapshot. Check your calendar for other commitments.</p>}</details>
  </section>;
}
