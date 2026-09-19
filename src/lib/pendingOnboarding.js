// Bridges the gap between supabase.auth.signUp() and the moment a real
// authenticated session exists. When email confirmation is required,
// signUp() returns no session, so any insert attempted immediately after
// signup (dd_portal_identities, dd_provider_applications,
// dd_portal_onboarding_intakes) is sent unauthenticated and RLS correctly
// rejects it -- that's the "new row violates row-level security policy"
// error.
//
// The durable record now lives server-side, in public.dd_provider_intake_staging
// (see supabase/migrations/20260919141500_provider_intake_staging_and_identity_grant_hardening.sql),
// not in localStorage. localStorage here is only a same-browser convenience
// cache of the staging id -- it lets a same-tab confirmation resume without
// re-parsing the URL, but it is never the only place the intake payload
// lives, so a confirmation link opened in a different browser/device still
// works: the staging id travels in the emailRedirectTo query string instead.
const PENDING_KEY = 'dd_pending_onboarding_v1';

export function savePendingOnboardingHint(stagingId, email) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify({ stagingId, email }));
  } catch (e) {
    // localStorage can be unavailable (private browsing, storage full) --
    // harmless here since the query-string staging id is authoritative.
  }
}

export function getPendingOnboardingHint() {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearPendingOnboardingHint() {
  try { window.localStorage.removeItem(PENDING_KEY); } catch (e) { /* ignore */ }
}

async function hashInviteToken(token) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Called from PortalAccessPage BEFORE supabase.auth.signUp(), so the intake
// payload is durable (server-side) the moment the applicant submits, not
// only after they confirm their email. Returns the staging row's id, which
// the caller embeds in emailRedirectTo.
export async function createProviderIntakeStaging(supabase, { email, kind, payload }) {
  const { data, error } = await supabase.rpc('dd_create_provider_intake_staging', {
    p_email: email,
    p_kind: kind,
    p_payload: payload,
  });
  if (error) return { stagingId: null, error: error.message };
  savePendingOnboardingHint(data, email);
  return { stagingId: data, error: null };
}

// PortalLoginPage calls this from two places on the same page load: its own
// getSession() check, and the onAuthStateChange listener (which Supabase
// fires immediately with the current session on subscribe). Without a guard,
// both run concurrently. The actual dedupe now happens inside the
// dd_consume_provider_intake_staging RPC itself (a single atomic
// UPDATE ... WHERE status='pending'), so a concurrent second call is a
// harmless no-op rather than a duplicate submission -- but we still avoid
// firing the RPC twice in the same tab needlessly.
let inFlightCompletion = null;

// Runs once a real authenticated session exists. Safe to call on EVERY
// login/session event, even with no stagingId at all: the RPC always also
// falls back to looking up any still-pending staging row by the caller's own
// confirmed email (see dd_consume_provider_intake_staging_impl), which is
// what lets onboarding recover even when the original confirmation link's
// query string never arrives -- e.g. this app's PKCE auth flow rejects a
// confirmation link opened in a different browser/device outright
// (exchangeCodeForSession fails before this function is ever reached), and
// the applicant's eventual successful sign-in (a fresh link, or a password
// login) may carry no staging id at all. It's still a cheap no-op for the
// overwhelming majority of logins that have no pending intake.
export async function completeStagedOnboarding(supabase, session, stagingId) {
  if (!session?.user) return { attempted: false };
  const resolvedId = stagingId || getPendingOnboardingHint()?.stagingId || null;

  if (inFlightCompletion) return inFlightCompletion;
  inFlightCompletion = runCompletion(supabase, resolvedId).finally(() => {
    inFlightCompletion = null;
  });
  return inFlightCompletion;
}

async function runCompletion(supabase, stagingId) {
  const { data, error } = await supabase.rpc('dd_consume_provider_intake_staging', {
    p_staging_id: stagingId,
  });
  if (error) return { attempted: true, success: false, error: `Portal setup needs attention: ${error.message}` };
  if (!data?.attempted) return { attempted: false };
  if (!data.success) return { attempted: true, success: false, error: data.error || 'Portal setup needs attention.' };
  clearPendingOnboardingHint();
  return { attempted: true, success: true };
}

export { hashInviteToken };
