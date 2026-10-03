/**
 * DANI relationship classification helpers.
 *
 * Classification describes relationship and intent. It does NOT:
 * - change HubSpot deal stage
 * - authorize outreach
 * - replace #525 identity resolution or #527 context contract
 *
 * Example:
 *   Larry Watkins → direct_buyer_candidate, research_before_outreach, in_market, CH03
 *   Brad Strawbridge → strategic_partner, relationship_first, in_market, CH05
 *   Jacob Garrett → referral_source, nurture, out_of_market, CH04
 */

export const RELATIONSHIP_ROLES = [
  'direct_buyer_candidate',
  'strategic_partner',
  'referral_source',
  'competitive_intel',
  'network',
  'existing_customer',
  'existing_partner',
  'do_not_contact',
];

export const ENGAGEMENT_POSTURES = [
  'research_before_outreach',
  'relationship_first',
  'nurture',
  'active_account_research',
  'owner_decision',
  'no_outreach',
];

export const MARKET_FITS = ['in_market', 'adjacent', 'out_of_market'];

/**
 * Apply classification via the durable RPC.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object} params
 */
export async function classifySalesRelationship(supabase, {
  salesQueueId,
  relationshipRole,
  engagementPosture,
  marketFit,
  primaryChannel = null,
  evidence = {},
  classifiedBy = 'system',
}) {
  if (!salesQueueId) throw new Error('salesQueueId is required');
  if (!RELATIONSHIP_ROLES.includes(relationshipRole)) {
    throw new Error(`Invalid relationshipRole: ${relationshipRole}`);
  }
  if (!ENGAGEMENT_POSTURES.includes(engagementPosture)) {
    throw new Error(`Invalid engagementPosture: ${engagementPosture}`);
  }
  if (!MARKET_FITS.includes(marketFit)) {
    throw new Error(`Invalid marketFit: ${marketFit}`);
  }

  const { data, error } = await supabase.rpc('dd_classify_sales_relationship', {
    p_sales_queue_id: salesQueueId,
    p_relationship_role: relationshipRole,
    p_engagement_posture: engagementPosture,
    p_market_fit: marketFit,
    p_primary_channel: primaryChannel,
    p_evidence: evidence,
    p_classified_by: classifiedBy,
  });

  if (error) throw error;
  return data;
}

/** Suggested classification presets from research patterns */
export const CLASSIFICATION_PRESETS = {
  commercialStrategicAtlanta: {
    relationshipRole: 'direct_buyer_candidate',
    engagementPosture: 'research_before_outreach',
    marketFit: 'in_market',
    primaryChannel: 'CH03',
  },
  contractorEcosystemPartner: {
    relationshipRole: 'strategic_partner',
    engagementPosture: 'relationship_first',
    marketFit: 'in_market',
    primaryChannel: 'CH05',
  },
  outOfMarketReferralSource: {
    relationshipRole: 'referral_source',
    engagementPosture: 'nurture',
    marketFit: 'out_of_market',
    primaryChannel: 'CH04',
  },
};
