import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const STAFF_ROLES = ['admin', 'owner', 'staff_admin', 'staff'];

function ok(res, data) { return res.status(200).json({ success: true, ...data }); }
function fail(res, error, status = 400) { return res.status(status).json({ success: false, error }); }

async function getApplications(supabase) {
  const { data: applications, error } = await supabase
    .from('dd_provider_applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const ids = (applications || []).map(row => row.id);
  if (!ids.length) return [];

  const [{ data: capabilities, error: capError }, { data: documents, error: docError }] = await Promise.all([
    supabase.from('dd_provider_application_capabilities').select('*').in('application_id', ids).order('created_at', { ascending: true }),
    supabase.from('dd_provider_application_documents').select('id, application_id, capability_id, document_type, verification_status, issuing_authority, document_number, jurisdiction, issue_date, expiration_date, reviewer_notes, uploaded_at, verified_at, verified_by').in('application_id', ids).order('uploaded_at', { ascending: true }),
  ]);
  if (capError) throw capError;
  if (docError) throw docError;

  const capsByApp = new Map();
  for (const cap of capabilities || []) capsByApp.set(cap.application_id, [...(capsByApp.get(cap.application_id) || []), cap]);
  const docsByApp = new Map();
  for (const doc of documents || []) docsByApp.set(doc.application_id, [...(docsByApp.get(doc.application_id) || []), doc]);

  return (applications || []).map(app => ({ ...app, capabilities: capsByApp.get(app.id) || [], documents: docsByApp.get(app.id) || [] }));
}

export default async function handler(req, res) {
  try {
    const context = await authenticatePortalRequest(req);
    if (context.error) return fail(res, context.error, context.status);
    const guard = requireRole(context, STAFF_ROLES);
    if (guard && !context.isStaff) return fail(res, guard.error, guard.status);

    if (req.method === 'GET') return ok(res, { applications: await getApplications(context.supabase) });
    if (req.method !== 'POST') return fail(res, 'Method not allowed', 405);

    const { action, applicationId } = req.body || {};
    if (!applicationId) return fail(res, 'applicationId is required.');

    if (action === 'approve_and_activate') {
      const { data, error } = await context.supabase.rpc('dd_approve_provider_application', {
        p_application_id: applicationId,
        p_actor_id: context.user.id,
      });
      if (error) throw error;
      return ok(res, { result: data });
    }

    if (action === 'set_review_status') {
      const status = String(req.body?.status || '').toUpperCase();
      const allowed = new Set(['UNDER_REVIEW', 'NEEDS_INFO', 'REJECTED']);
      if (!allowed.has(status)) return fail(res, 'Unsupported review status.');
      const { data: application, error: fetchError } = await context.supabase.from('dd_provider_applications').select('id, application_status').eq('id', applicationId).single();
      if (fetchError || !application) return fail(res, 'Application not found.', 404);
      const { error } = await context.supabase.from('dd_provider_applications').update({ application_status: status, reviewed_at: new Date().toISOString(), reviewed_by: context.user.id, updated_at: new Date().toISOString() }).eq('id', applicationId);
      if (error) throw error;
      await context.supabase.from('dd_provider_application_events').insert({ application_id: applicationId, event_type: `STATUS_${status}`, from_status: application.application_status, to_status: status, actor_id: context.user.id, notes: req.body?.notes || null });
      return ok(res, { applicationId, status });
    }

    if (action === 'verify_capability') {
      const capabilityId = req.body?.capabilityId;
      const decision = String(req.body?.decision || '').toUpperCase();
      if (!capabilityId || !['AUTHORIZED', 'REJECTED'].includes(decision)) return fail(res, 'capabilityId and AUTHORIZED/REJECTED are required.');
      const next = decision === 'AUTHORIZED'
        ? { authorization_status: 'AUTHORIZED', evidence_status: 'VERIFIED', requirement_status: 'VERIFIED' }
        : { authorization_status: 'REVOKED', evidence_status: 'REJECTED', requirement_status: 'REJECTED' };
      const { error } = await context.supabase.from('dd_provider_application_capabilities').update(next).eq('id', capabilityId).eq('application_id', applicationId);
      if (error) throw error;
      return ok(res, { capabilityId, status: decision });
    }

    if (action === 'verify_document') {
      const documentId = req.body?.documentId;
      const decision = String(req.body?.decision || '').toUpperCase();
      if (!documentId || !['VERIFIED', 'REJECTED'].includes(decision)) return fail(res, 'documentId and VERIFIED/REJECTED are required.');
      const next = decision === 'VERIFIED'
        ? { verification_status: 'VERIFIED', verified_at: new Date().toISOString(), verified_by: context.user.id, reviewer_notes: req.body?.notes || null }
        : { verification_status: 'REJECTED', verified_at: null, verified_by: context.user.id, reviewer_notes: req.body?.notes || null };
      const { error } = await context.supabase.from('dd_provider_application_documents').update(next).eq('id', documentId).eq('application_id', applicationId);
      if (error) throw error;
      return ok(res, { documentId, status: decision });
    }

    return fail(res, 'Unsupported action.');
  } catch (error) {
    return fail(res, error?.message || 'Provider application operation failed.', 500);
  }
}
