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
    const { error: providerError } = await supabase
      .from('dd_provider_applications')
      .insert({ ...pending.providerPayload, applicant_user_id: userId });
    if (providerError) return { attempted: true, success: false, error: `Provider application needs attention: ${providerError.message}` };
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
