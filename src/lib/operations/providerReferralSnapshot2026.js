// Server-only projection for the authenticated provider snapshot. Never issues a
// referral identity, activates a program, assigns work, or calculates compensation.
export async function getProviderReferralSnapshot(supabase, providerId) {
  if (!providerId) return { status: 'NOT_AVAILABLE' };
  try {
    const provider = await supabase.from('dd_providers').select('id,is_active').eq('id', providerId).maybeSingle();
    if (provider.error) throw provider.error;
    if (!provider.data?.is_active) return { status: 'NOT_AVAILABLE' };

    const identity = await supabase.from('dd_referral_identities')
      .select('referral_code,program_id').eq('referrer_type', 'PROVIDER')
      .eq('referrer_provider_id', providerId).eq('status', 'ACTIVE')
      .order('created_at', { ascending: true }).limit(1).maybeSingle();
    if (identity.error) throw identity.error;
    if (!identity.data) return { status: 'NOT_ISSUED' };

    const program = await supabase.from('dd_incentive_programs')
      .select('program_key,program_status,owner_approved,terms_summary')
      .eq('id', identity.data.program_id).maybeSingle();
    if (program.error) throw program.error;
    if (program.data?.program_key !== 'PROVIDER_CUSTOMER_REFERRAL_ATTRIBUTION_2026' ||
        program.data?.program_status !== 'ACTIVE' || program.data?.owner_approved !== true) {
      return { status: 'NOT_AVAILABLE' };
    }
    const code = identity.data.referral_code;
    if (typeof code !== 'string' || !code.trim() || code.length > 200) return { status: 'UNAVAILABLE' };
    const referrals = await supabase.from('dd_referrals').select('id', { count: 'exact', head: true })
      .eq('referrer_provider_id', providerId).eq('program_id', identity.data.program_id)
      .eq('referred_party_type', 'CLIENT');
    if (referrals.error) throw referrals.error;
    return {
      status: 'AVAILABLE', code,
      shareUrl: 'https://danideclares.com/request-service?ref=' + encodeURIComponent(code),
      attributedInquiries: Number.isInteger(referrals.count) ? referrals.count : null,
      terms: program.data.terms_summary || null,
    };
  } catch (_error) {
    // Optional referral data must not break assignments, onboarding or financials.
    // Do not expose server/database errors or manufacture a zero inquiry count.
    return { status: 'UNAVAILABLE' };
  }
}
