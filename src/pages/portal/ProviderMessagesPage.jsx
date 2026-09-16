import React, { useState } from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, formatDate, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

export default function ProviderMessagesPage() {
  const { session, snapshot, loading, error, message, load, act } = useProviderWorkspace();
  const [drafts, setDrafts] = useState({});
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const isApproved = snapshot.application?.application_status === 'APPROVED';
  const jobs = Array.from(new Map((snapshot.assignments || []).map(a => a.job).filter(Boolean).map(job => [job.id, job])).values());
  const messagesByJob = new Map();
  (snapshot.messages || []).forEach(m => { if (!messagesByJob.has(m.job_id)) messagesByJob.set(m.job_id, []); messagesByJob.get(m.job_id).push(m); });
  const send = async (jobId) => {
    const body = (drafts[jobId] || '').trim();
    if (!body) return;
    await act('send_message', { jobId, body });
    setDrafts(prev => ({ ...prev, [jobId]: '' }));
  };
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Messages</h1><p>Conversation with DANI DECLARES staff and customers, tied to each job you're assigned.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    <ProviderNav isApprovedProvider={isApproved} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {!isApproved ? <LockedCard title="Messages">Messaging unlocks once your application is approved.</LockedCard> :
      jobs.length ? jobs.map(job => <Card key={job.id} title={job.job_title || 'Job'}>
        <div className="portal-message-list">{(messagesByJob.get(job.id) || []).length ? messagesByJob.get(job.id).map(m => <div key={m.id} className="portal-message"><small>{m.sender_role} · {formatDate(m.created_at)}</small><p>{m.body}</p></div>) : <Empty>No messages on this job yet.</Empty>}</div>
        <div className="portal-message-compose"><textarea rows="2" value={drafts[job.id] || ''} onChange={e => setDrafts(prev => ({ ...prev, [job.id]: e.target.value }))} placeholder="Write a message about this job…" /><button onClick={() => send(job.id)}>Send</button></div>
      </Card>) : <Empty>Messages will appear here once you have an assigned job.</Empty>}
  </main>;
}
