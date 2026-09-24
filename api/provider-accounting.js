import { authenticatePortalRequest } from './_portalAuth.js';

function fail(res, error, status = 400) {
  return res.status(status).json({ success: false, error });
}

export default async function handler(req, res) {
  try {
    const context = await authenticatePortalRequest(req);
    if (context.error) return fail(res, context.error, context.status);
    if (context.role !== 'provider') return fail(res, 'Provider account required.', 403);

    if (req.method === 'GET') {
      const { data, error } = await context.supabase.rpc('dd_get_my_accounting_workspace');
      if (error) {
        const status = /ACCOUNTING_CAPABILITY_REQUIRED/.test(error.message || '') ? 403 : 400;
        return fail(res, error.message || 'Could not load accounting workspace.', status);
      }
      return res.status(200).json({ success: true, workspace: data });
    }

    if (req.method === 'POST') {
      const { sourceType, sourceId, reviewStatus, reviewerNote, proposedTreatment } = req.body || {};
      if (!sourceType || !sourceId || !reviewStatus) return fail(res, 'sourceType, sourceId and reviewStatus are required.', 422);
      const { data, error } = await context.supabase.rpc('dd_review_my_accounting_item', {
        p_source_type: sourceType,
        p_source_id: String(sourceId),
        p_review_status: reviewStatus,
        p_reviewer_note: reviewerNote || null,
        p_proposed_treatment: proposedTreatment || {}
      });
      if (error) {
        const status = /OWNER_DECISION_REQUIRED|ACCOUNTING_CAPABILITY_REQUIRED/.test(error.message || '') ? 403 : 400;
        return fail(res, error.message || 'Could not record accounting review.', status);
      }
      return res.status(200).json({ success: true, review: data });
    }

    return fail(res, 'Method not allowed.', 405);
  } catch (error) {
    return fail(res, error.message || 'Accounting workspace error.', 500);
  }
}
