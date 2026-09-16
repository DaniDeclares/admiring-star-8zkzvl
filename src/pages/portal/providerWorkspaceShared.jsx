import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';

export function Card({ title, children }) { return <section className="portal-card"><h2>{title}</h2>{children}</section>; }
export function Empty({ children = 'Nothing is waiting here.' }) { return <p className="portal-empty">{children}</p>; }
export function formatDate(value) { if (!value) return 'Not scheduled'; return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
export function statusLabel(value) { return value ? value.replaceAll('_', ' ') : 'Not started'; }
export function Requirement({ label, ok, detail }) { return <div className="portal-requirement"><span className={`portal-requirement-dot ${ok ? 'ok' : 'pending'}`} />{label}<small>{detail}</small></div>; }
export function LockedCard({ title, children }) { return <Card title={title}><p className="portal-note">{children} <Link to="/portal">Check your application status</Link>.</p></Card>; }

// Mirrors the exact gates staff review at /portal/provider-approval (and that
// dd_approve_provider_application enforces server-side) so this never becomes
// a second, competing source of truth about what "approved" requires.
export function buildProviderRequirements(application, capabilities) {
  const caps = capabilities || [];
  return [
    { label: 'Services selected', ok: caps.length > 0, detail: caps.length ? `${caps.length} selected` : 'None selected yet' },
    { label: 'Services authorized', ok: caps.length > 0 && caps.every(c => c.authorization_status === 'AUTHORIZED' && c.evidence_status === 'VERIFIED' && ['VERIFIED', 'NOT_REQUIRED'].includes(c.requirement_status)), detail: 'Reviewed by DANI DECLARES staff' },
    { label: 'Tax document', ok: ['VERIFIED', 'NOT_REQUIRED'].includes(application?.tax_form_status), detail: statusLabel(application?.tax_form_status) },
    { label: 'Insurance', ok: ['VERIFIED', 'NOT_REQUIRED'].includes(application?.insurance_status), detail: statusLabel(application?.insurance_status) },
    { label: 'Identity verification', ok: application?.identity_status === 'VERIFIED', detail: statusLabel(application?.identity_status) },
    { label: 'Signed agreement', ok: application?.agreement_status === 'EXECUTED', detail: statusLabel(application?.agreement_status) },
    { label: 'Background check', ok: ['CLEARED', 'NOT_REQUIRED'].includes(application?.background_check_status), detail: statusLabel(application?.background_check_status) },
    { label: 'Compliance review', ok: application?.compliance_status === 'VERIFIED', detail: statusLabel(application?.compliance_status) },
  ];
}

// Shared session/snapshot fetch + mutation logic for every /portal/* page.
// Each page calls this independently rather than sharing a layout/context --
// that means one fetch per page navigation instead of one per app session,
// but it keeps every page a self-contained route (works on direct link/
// refresh, no nested-router plumbing) which matters more here than shaving
// a request off a tab switch.
export function useProviderWorkspace() {
  const [session, setSession] = useState(null); const [snapshot, setSnapshot] = useState(null); const [loading, setLoading] = useState(true); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError(''); const { data } = await supabase.auth.getSession();
    if (!data.session) { setError('Please sign in to access your DANI DECLARES workspace.'); setLoading(false); return; }
    setSession(data.session); const response = await fetch('/api/portal-operations', { headers: { Authorization: `Bearer ${data.session.access_token}` } }); const body = await response.json();
    if (!response.ok || !body.success) setError(body.error || 'Portal data could not be loaded.'); else setSnapshot(body); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!session) return undefined; const timer = window.setInterval(load, 30000); const refreshOnFocus = () => { if (document.visibilityState === 'visible') load(); }; document.addEventListener('visibilitychange', refreshOnFocus); return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refreshOnFocus); }; }, [session, load]);
  const act = async (action, payload) => {
    setMessage(''); setError(''); if (!session) return; const response = await fetch('/api/portal-operations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action, ...payload }) }); const body = await response.json();
    if (!response.ok || !body.success) setError(body.error || 'Action failed.'); else { setMessage('Updated successfully.'); await load(); }
  };
  const uploadEvidence = async (task, file) => {
    if (!file || !session) return; setError(''); setMessage('Preparing secure evidence upload…');
    const response = await fetch('/api/portal-operations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action: 'create_evidence_upload', jobId: task.job_id, taskId: task.id, fileName: file.name, contentType: file.type, evidenceType: 'FIELD_PHOTO', fileMetadata: { size: file.size, type: file.type } }) }); const body = await response.json();
    if (!response.ok || !body.success) return setError(body.error || 'Could not prepare evidence upload.');
    const { error: uploadError } = await supabase.storage.from('dd-job-evidence').uploadToSignedUrl(body.path, body.token, file); if (uploadError) return setError(uploadError.message || 'Evidence upload failed.');
    const finalize = await fetch('/api/portal-operations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action: 'finalize_evidence', ...body.finalizePayload }) }); const finalizeBody = await finalize.json();
    if (!finalize.ok || !finalizeBody.success) return setError(finalizeBody.error || 'Evidence record could not be finalized.'); setMessage('Evidence uploaded and attached to the task.'); await load();
  };
  return { session, snapshot, loading, error, message, load, act, uploadEvidence };
}
