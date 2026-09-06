import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const STAFF_ROLES = ['admin', 'owner', 'staff_admin', 'staff'];

export default async function handler(req, res) {
  try {
    const context = await authenticatePortalRequest(req);
    if (context.error) return res.status(context.status).json({ success: false, error: context.error });
    const guard = requireRole(context, STAFF_ROLES);
    if (guard && !context.isStaff) return res.status(guard.status).json({ success: false, error: guard.error });
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

    const body = req.body || {};

    // Canonical dispatch resolver path.
    if (body.jobId || body.serviceId || body.capabilityKey || body.zipCode) {
      const { jobId, requestId, serviceId, capabilityKey, zipCode, offerExpiryMinutes = 30 } = body;
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
    }

    // Fulfillment instantiation path.
    const { requestId } = body;
    if (!requestId) return res.status(400).json({ success: false, error: 'requestId is required.' });
    const { data, error } = await context.supabase.rpc('dd_create_fulfillment_from_request', { p_request_id: requestId });
    if (error) throw error;
    const fulfillment = Array.isArray(data) ? data[0] : data;
    if (!fulfillment?.work_order_id || !fulfillment?.job_id) {
      return res.status(422).json({ success: false, error: 'Fulfillment instantiation did not return a work order and job.' });
    }
    const { error: eventError } = await context.supabase.from('dd_dispatch_events').insert({
      job_id: fulfillment.job_id,
      actor_id: context.user.id,
      event_type: 'FULFILLMENT_INSTANTIATED',
      description: `Fulfillment instantiated from request ${requestId}.`,
      metadata: fulfillment,
    });
    if (eventError) throw eventError;
    return res.status(200).json({ success: true, fulfillment });
  } catch (error) {
    console.error('Portal fulfillment/dispatch error:', error);
    return res.status(500).json({ success: false, error: 'Fulfillment or dispatch operation failed.' });
  }
}
