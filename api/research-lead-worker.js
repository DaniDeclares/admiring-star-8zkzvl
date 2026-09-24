import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const MAX_BATCH = 25;
const URL_RE = /^https:\/\/[^\s]+$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value) { return typeof value === 'string' ? value.trim() : ''; }
function fail(res, status, error, details) { return res.status(status).json({ success: false, error, ...(details ? { details } : {}) }); }

export default async function handler(req, res) {
  try {
    const auth = await authenticatePortalRequest(req);
    if (auth.error) return fail(res, auth.status, auth.error);
    const denied = requireRole(auth, ['admin','owner','staff_admin','staff']);
    if (denied) return fail(res, denied.status, denied.error);
    const { supabase, user } = auth;

    if (req.method === 'GET') {
      const limit = Math.min(Math.max(Number(req.query?.limit) || 5, 1), MAX_BATCH);
      const { data, error } = await supabase
        .from('dd_research_leads')
        .select('id,channel_code,company_name,market,address,research_priority,research_profile,research_claims,verification_status,promotion_status,source_document,verified_company_name,verified_email,verified_phone,verified_website,verification_source_url,verification_evidence,verified_at,promoted_sales_queue_id,promoted_at,updated_at')
        .eq('promotion_status','RESEARCH_ONLY')
        .order('research_priority',{ ascending: true })
        .order('updated_at',{ ascending: true })
        .limit(limit);
      if (error) throw error;
      return res.status(200).json({
        success: true,
        worker: 'DANI_LEAD_SCOUT',
        mode: 'RESEARCH_ONLY',
        outreachAuthorized: false,
        leads: data || []
      });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow','GET, POST');
      return fail(res,405,'Method not allowed');
    }

    const action = clean(req.body?.action).toUpperCase();
    if (action === 'PROMOTE_BATCH') {
      const { data, error } = await supabase.rpc('dd_promote_verified_research_leads_batch',{ p_limit: Math.min(Number(req.body?.limit) || 25, MAX_BATCH) });
      // private-schema RPC is intentionally unavailable through PostgREST.
      // Cron is authoritative for batch promotion; individual promotion below is available server-side.
      if (error) return fail(res,409,'Batch promotion is cron-controlled',{ code: error.code });
      return res.status(200).json({ success:true, result:data });
    }

    if (action !== 'VERIFY') return fail(res,400,'Unsupported action');

    const id = clean(req.body?.researchLeadId);
    const sourceUrl = clean(req.body?.sourceUrl);
    const verifiedEmail = clean(req.body?.verifiedEmail).toLowerCase();
    const verifiedPhone = clean(req.body?.verifiedPhone);
    const verifiedWebsite = clean(req.body?.verifiedWebsite);
    const verifiedCompanyName = clean(req.body?.verifiedCompanyName);
    const evidence = req.body?.evidence;

    if (!id) return fail(res,422,'researchLeadId is required');
    if (!URL_RE.test(sourceUrl)) return fail(res,422,'A valid HTTPS sourceUrl is required');
    if (!verifiedEmail && !verifiedPhone) return fail(res,422,'At least one verified business contact route is required');
    if (verifiedEmail && !EMAIL_RE.test(verifiedEmail)) return fail(res,422,'verifiedEmail is invalid');
    if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence) || Object.keys(evidence).length === 0) {
      return fail(res,422,'Structured verification evidence is required');
    }

    const { data: lead, error: leadError } = await supabase
      .from('dd_research_leads')
      .select('id,promotion_status')
      .eq('id',id)
      .maybeSingle();
    if (leadError) throw leadError;
    if (!lead) return fail(res,404,'Research lead not found');
    if (lead.promotion_status !== 'RESEARCH_ONLY') return fail(res,409,'Research lead is no longer in research staging');

    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from('dd_research_leads')
      .update({
        verified_company_name: verifiedCompanyName || null,
        verified_email: verifiedEmail || null,
        verified_phone: verifiedPhone || null,
        verified_website: verifiedWebsite || null,
        verification_source_url: sourceUrl,
        verification_evidence: {
          ...evidence,
          submitted_by: user.id,
          worker: 'DANI_LEAD_SCOUT',
          submitted_at: now
        },
        verification_status: 'VERIFIED',
        verified_at: now,
        updated_at: now
      })
      .eq('id',id)
      .eq('promotion_status','RESEARCH_ONLY')
      .select('id,verification_status,promotion_status')
      .single();
    if (updateError) throw updateError;

    const { data: promotion, error: promotionError } = await supabase.rpc('dd_promote_verified_research_lead',{ p_research_lead_id:id });
    if (promotionError) throw promotionError;

    return res.status(200).json({
      success:true,
      worker:'DANI_LEAD_SCOUT',
      verified:updated,
      promotion,
      outreachAuthorized:false,
      note:'Promotion creates or matches canonical sales only; it does not authorize outreach.'
    });
  } catch (error) {
    return fail(res,500,error?.message || 'Research worker failed');
  }
}
