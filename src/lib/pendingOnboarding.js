// Bridges the gap between supabase.auth.signUp() and the moment a real
// authenticated session exists. When email confirmation is required,
// signUp() returns no session, so any insert attempted immediately after
// signup (dd_portal_identities, dd_provider_applications,
// dd_portal_onboarding_intakes) is sent unauthenticated and RLS correctly
// rejects it -- that's the "new row violates row-level security policy"
// error. Instead of writing those rows before a session exists, we stash
// the payload here and finish the writes the moment a real session shows
// up (password login or magic-link/email-confirmation redirect).
const PENDING_KEY = 'dd_pending_onboarding_v1';

export function savePendingOnboarding(payload) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch (e) {
    // localStorage can be unavailable (private browsing, storage full); the
    // user will just need to re-run onboarding after confirming their email.
  }
}

export function getPendingOnboarding() {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearPendingOnboarding() {
  try { window.localStorage.removeItem(PENDING_KEY); } catch (e) { /* ignore */ }
}

async function hashInviteToken(token) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// PortalLoginPage calls this from two places on the same page load: its own
// getSession() check, and the onAuthStateChange listener (which Supabase
// fires immediately with the current session on subscribe). Without a guard,
// both run concurrently -- both pass the identity step below (idempotent by
// design) and both then insert the provider application / onboarding intake
// a second time. That's a real duplicate submission, not just a benign race,
// so only one completion can be in flight at a time; a concurrent call joins
// the one already running instead of starting its own.
let inFlightCompletion = null;

// Runs once a real authenticated session exists. Safe to call on every
// login/session event -- it's a no-op when there is nothing pending, and
// it clears the pending record on success so it never runs twice.
export async function completePendingOnboarding(supabase, session) {
  const pending = getPendingOnboarding();
  if (!pending || !session?.user) return { attempted: false };
  if ((pending.email || '').trim().toLowerCase() !== (session.user.email || '').trim().toLowerCase()) {
    // Different account than the one that queued this -- don't cross-wire records.
    return { attempted: false };
  }

  if (inFlightCompletion) return inFlightCompletion;
  inFlightCompletion = runCompletion(supabase, session, pending).finally(() => {
    inFlightCompletion = null;
  });
  return inFlightCompletion;
}

async function runCompletion(supabase, session, pending) {
  const userId = session.user.id;
  const identityPayload = { ...pending.identityPayload, auth_user_id: userId };
  let identityId;
  const { data: identity, error: identityError } = await supabase
    .from('dd_portal_identities')
    .insert(identityPayload)
    .select('id')
    .single();
  if (identityError) {
    // A prior attempt can have created the identity and then failed on a
    // later step (e.g. the provider-application insert), leaving nothing
    // cleared. Retrying then re-attempts this insert and hits the unique
    // constraint on auth_user_id -- that's a sign of partial completion,
    // not a real failure, so look up the existing row and carry on instead
    // of leaving the user permanently stuck on this step.
    if (identityError.code === '23505') {
      const { data: existing, error: lookupError } = await supabase
        .from('dd_portal_identities')
        .select('id')
        .eq('auth_user_id', userId)
        .maybeSingle();
      if (lookupError || !existing) return { attempted: true, success: false, error: `Portal setup needs attention: ${identityError.message}` };
      identityId = existing.id;
    } else {
      return { attempted: true, success: false, error: `Portal setup needs attention: ${identityError.message}` };
    }
  } else {
    identityId = identity.id;
  }

  if (pending.kind === 'apartment_resident' && pending.inviteTokenHash) {
    const { data: consumed, error: consumeError } = await supabase.rpc('dd_consume_apartment_resident_invite', {
      p_token_hash: pending.inviteTokenHash,
      p_portal_identity_id: identityId,
      p_auth_user_id: userId,
    });
    if (consumeError || !consumed) {
      return { attempted: true, success: false, error: 'Your account is set up, but the property invitation could not be attached. Please contact your property management team for a new resident invitation.' };
    }
  }

  if (pending.kind === 'provider' && pending.providerPayload) {
    // No unique constraint on applicant_user_id here (unlike the identity
    // table above), so a sequential retry after a real failure -- e.g. the
    // capability insert below failing -- would otherwise create a second
    // application row instead of erroring. Reuse an existing application
    // for this user rather than blindly inserting another one.
    let applicationId;
    const { data: existingApplication } = await supabase
      .from('dd_provider_applications')
      .select('id')
      .eq('applicant_user_id', userId)
      .maybeSingle();
    if (existingApplication) {
      applicationId = existingApplication.id;
    } else {
      const { data: application, error: providerError } = await supabase
        .from('dd_provider_applications')
        .insert({ ...pending.providerPayload, applicant_user_id: userId })
        .select('id')
        .single();
      if (providerError) return { attempted: true, success: false, error: `Provider application needs attention: ${providerError.message}` };
      applicationId = application.id;
    }

    if (pending.capabilityPayloads?.length) {
      const { data: existingCapabilities } = await supabase
        .from('dd_provider_application_capabilities')
        .select('id')
        .eq('application_id', applicationId)
        .limit(1);
      if (!existingCapabilities?.length) {
        const { error: capabilityError } = await supabase
          .from('dd_provider_application_capabilities')
          .insert(pending.capabilityPayloads.map(capability => ({ ...capability, application_id: applicationId })));
        if (capabilityError) return { attempted: true, success: false, error: `Provider capabilities need attention: ${capabilityError.message}` };
      }
    }
  } else if (pending.intakePayload) {
    const { error: intakeError } = await supabase
      .from('dd_portal_onboarding_intakes')
      .insert({ ...pending.intakePayload, auth_user_id: userId });
    if (intakeError) return { attempted: true, success: false, error: `Onboarding data needs attention: ${intakeError.message}` };
  }

  clearPendingOnboarding();
  return { attempted: true, success: true };
}

export { hashInviteToken };
