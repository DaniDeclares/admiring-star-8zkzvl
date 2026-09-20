import React, { useMemo, useState } from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, formatDate, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

function getLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      position => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy
      }),
      () => resolve({}),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 7000 }
    );
  });
}

const ACTIONS = {
  OFFERED: [{ label: 'View assignment', event: 'ASSIGNMENT_VIEWED' }],
  ACCEPTED: [
    { label: 'On my way', event: 'EN_ROUTE' },
    { label: 'Arrived', event: 'ARRIVED' },
    { label: 'Start work', event: 'WORK_STARTED' },
    { label: 'Pause', event: 'WORK_PAUSED' },
    { label: 'Resume', event: 'WORK_RESUMED' },
    { label: 'Complete work', event: 'WORK_COMPLETED' }
  ]
};

export default function ProviderFieldPage() {
  const { session, snapshot, loading, error, message, load, act } = useProviderWorkspace();
  const [busy, setBusy] = useState({});
  const [localError, setLocalError] = useState('');

  const jobs = useMemo(() => {
    const assignments = (snapshot?.assignments || []).filter(a => ['OFFERED','ACCEPTED'].includes(a.assignment_status));
    const seen = new Set();
    return assignments.filter(a => {
      if (seen.has(a.job_id)) return false;
      seen.add(a.job_id);
      return true;
    }).map(a => ({ ...a, job: a.job || (snapshot.jobs || []).find(j => j.id === a.job_id) }));
  }, [snapshot]);

  const sendEvent = async (assignment, eventType) => {
    const key = assignment.id + eventType;
    setBusy(prev => ({ ...prev, [key]: true }));
    setLocalError('');
    try {
      const location = await getLocation();
      await act('field_event', {
        jobId: assignment.job_id,
        assignmentId: assignment.id,
        eventType,
        ...location
      });
    } finally {
      setBusy(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) return <main className="portal-shell"><p>Loading DANI FIELD…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;

  const isApproved = snapshot.application?.application_status === 'APPROVED';
  const isSigned = snapshot.application?.agreement_status === 'EXECUTED';

  return <main className="portal-shell">
    <header className="portal-hero">
      <div>
        <p className="portal-eyebrow">DANI FIELD</p>
        <h1>Your field day</h1>
        <p>Assignments, navigation, status updates, time evidence, checklists and closeout — in one DANI-owned field workspace.</p>
      </div>
      <div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div>
    </header>
    <ProviderNav isApprovedProvider={isApproved} agreementSigned={isSigned} />
    {error && <div className="portal-alert" role="alert">{error}</div>}
    {localError && <div className="portal-alert" role="alert">{localError}</div>}
    {message && <div className="portal-success" role="status">{message}</div>}

    {!isApproved ? <LockedCard title="DANI FIELD">Your field workspace unlocks once your provider application is approved.</LockedCard> : <>
      <div className="portal-summary-grid">
        <div className="portal-summary-tile"><strong>{jobs.filter(j => j.assignment_status === 'OFFERED').length}</strong><span>Offers awaiting response</span></div>
        <div className="portal-summary-tile"><strong>{jobs.filter(j => j.assignment_status === 'ACCEPTED').length}</strong><span>Accepted jobs</span></div>
        <div className="portal-summary-tile"><strong>{(snapshot.tasks || []).filter(t => t.status !== 'COMPLETED').length}</strong><span>Open checklist items</span></div>
        <div className="portal-summary-tile"><strong>{(snapshot.evidence || []).filter(e => e.verification_status === 'PENDING').length}</strong><span>Evidence pending QA</span></div>
      </div>

      {jobs.length ? jobs.map(assignment => {
        const job = assignment.job || {};
        const actions = ACTIONS[assignment.assignment_status] || [];
        return <Card key={assignment.id} title={job.job_title || 'Assigned work'}>
          <div className="portal-row">
            <div>
              <strong>{job.location_address || 'Location on file'}</strong>
              <small>{assignment.assignment_status} · {job.sla_due_at ? `SLA due ${formatDate(job.sla_due_at)}` : 'No SLA deadline shown'}</small>
              {job.scope_summary && <small>{job.scope_summary}</small>}
            </div>
            {job.location_address && <a className="portal-primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location_address)}`} target="_blank" rel="noreferrer">Navigate</a>}
          </div>
          <div className="portal-actions" style={{ flexWrap: 'wrap', marginTop: 12 }}>
            {assignment.assignment_status === 'OFFERED' ? <>
              <button onClick={() => act('assignment_response',{assignmentId:assignment.id,decision:'ACCEPT')}>Accept assignment</button>
              <button className="secondary" onClick={() => act('assignment_response',{assignmentId:assignment.id,decision:'REJECT',reason:'Provider declined assignment.'})}>Decline</button>
            </> : actions.map(action => {
              const key = assignment.id + action.event;
              return <button key={action.event} disabled={busy[key]} onClick={() => sendEvent(assignment, action.event)}>{busy[key] ? 'Updating…' : action.label}</button>;
            })}
          </div>
        </Card>;
      }) : <Card title="Today"><Empty>No dispatched work is waiting for you.</Empty></Card>}

      <Card title="Field operating standard">
        <p className="portal-note">Use DANI FIELD for every dispatch event, arrival/status update, required checklist item, evidence upload and completion handoff. Location is optional evidence and requires your device permission; DANI does not require continuous tracking to perform the workflow.</p>
      </Card>
    </>}
  </main>;
}
