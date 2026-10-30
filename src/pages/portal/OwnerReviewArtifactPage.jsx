import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const KEY = 'ASANA:1219397649342143:CH02-owner-review-20261028';
export function decodeReviewSource(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
export function OwnerReviewContent({ artifact }) {
  const source = decodeReviewSource(artifact.contentBase64);
  return (
    <article className="portal-shell">
      <Link to="/portal/hq">Back to Owner HQ</Link>
      <h1>Worker result — owner review</h1>
      <p><strong>Document:</strong> {artifact.filename}</p>
      <p><strong>Assignment:</strong> {artifact.assignmentId}</p>
      <p><strong>Review:</strong> {artifact.reviewStatus}</p>
      <p><strong>Recipient eligibility:</strong>{' '}{artifact.recipientEligibility}</p>
      <p><strong>Outgoing email:</strong>{' '}{artifact.outboundStatus}</p>
      <p><strong>Source SHA-256:</strong>{' '}<code>{artifact.sha256}</code></p>
      <p>Internal owner review only. Viewing this result does not authorize outreach.</p>
      <h2>Exact saved source</h2>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit', lineHeight: 1.6 }}>{source}</pre>
    </article>
  );
}
export function OwnerReviewLoader() {
  const [state, setState] = useState({ loading: true, error: '', artifact: null });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session?.access_token) throw new Error('NO_SESSION');
        const response = await fetch(
          '/api/owner-review-artifacts?artifactKey=' + encodeURIComponent(KEY),
          { method: 'GET', cache: 'no-store', signal: controller.signal,
            headers: { Authorization: `Bearer ${data.session.access_token}` } }
        );
        if (!response.ok) throw new Error('RETRIEVAL_FAILED');
        const result = await response.json();
        if (!result.artifact) throw new Error('MISSING_ARTIFACT');
        if (!controller.signal.aborted) setState({ loading: false, error: '', artifact: result.artifact });
      } catch {
        if (!controller.signal.aborted) setState({ loading: false, error: 'Owner review is unavailable.', artifact: null });
      }
    }
    load();
    return () => controller.abort();
  }, []);
  if (state.loading) return <p>Loading owner review…</p>;
  if (state.error) return <p role="alert">{state.error}</p>;
  try { return <OwnerReviewContent artifact={state.artifact} />; }
  catch { return <p role="alert">Saved content could not be displayed.</p>; }
}
export default function OwnerReviewArtifactPage() {
  return <RequireStaffAuth><OwnerReviewLoader /></RequireStaffAuth>;
}
