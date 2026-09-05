import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const STAFF_ROLES = ['admin', 'owner', 'staff_admin', 'staff'];

export default async function handler(req, res) {
  try {
    const context = await authenticatePortalRequest(req);
    if (context.error) return res.status(context.status).json({ success: false, error: context.error });
    const guard = requireRole(context, STAFF_ROLES);
    if (guard && !context.isStaff) return res.status(guard.status).json({ success: false, error: guard.error });
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

    const { jobId, requestId, serviceId, capabilityKey, zipCode, offerExpiryMinutes = 30 } = req.body || {};
    if (!jobId && !requestId) return res.status(400).json({ success: false, error: 'jobId or requestId is required.' });

    const { data, error } = await context.supabase.rpc('dd_route_work_order', {
      p_request_id: requestId || null,
      p_job_id: jobId || null,
      p_service_id: serviceId || null,
      p_capability_key: capabilityKey || null,
      p_zip_code: zipCode || null,
      p_offer_expiry_minutes: Number(offerExpiryMinutes) || 30,
    });
    if (error) throw error;

    const routing = Array.isArray(data) ? data[0] : data;
    return res.status(200).json({ success: true, routing });
  } catch (error) {
    console.error('Portal dispatch error:', error);
    return res.status(500).json({ success: false, error: 'Dispatch routing failed.' });
  }
}
