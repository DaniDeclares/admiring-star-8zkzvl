import prisma from '../lib/prisma.js';
import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const STAFF_ROLES = ['admin', 'owner', 'staff_admin', 'staff'];

function fail(res, error, status = 400) {
  return res.status(status).json({ success: false, error });
}

function ok(res, data) {
  return res.status(200).json({ success: true, ...data });
}

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 'Method not allowed', 405);

  const context = await authenticatePortalRequest(req);
  if (context.error) return fail(res, context.error, context.status);
  const guard = requireRole(context, STAFF_ROLES);
  if (guard && !context.isStaff) return fail(res, guard.error, guard.status);

  const body = req.body || {};
  const { requestId = null, jobId = null, serviceId = null, capabilityKey = null, zipCode = null, offerExpiryMinutes = 30 } = body;

  if (requestId && !isUuid(requestId)) return fail(res, 'requestId must be a UUID.');
  if (jobId && !isUuid(jobId)) return fail(res, 'jobId must be a UUID.');
  if (serviceId && !isUuid(serviceId)) return fail(res, 'serviceId must be a UUID.');
  if (!requestId && !jobId) return fail(res, 'requestId or jobId is required.');

  try {
    const rows = await prisma.$queryRaw`
      select *
      from public.dd_route_work_order(
        ${requestId ? `${requestId}` : null}::uuid,
        ${jobId ? `${jobId}` : null}::uuid,
        ${serviceId ? `${serviceId}` : null}::uuid,
        ${capabilityKey || null}::text,
        ${zipCode || null}::text,
        ${Math.max(1, Number(offerExpiryMinutes) || 30)}::integer
      )
    `;

    const route = rows[0];
    if (!route) return fail(res, 'Routing engine returned no result.', 422);

    if (route.assignment_id) {
      await prisma.$executeRaw`
        insert into public.dd_event_outbox
          (event_key, event_type, channel, aggregate_type, aggregate_id, payload, status, attempts, available_at, created_at, updated_at)
        values
          (
            ${`provider-assignment:${route.assignment_id}`},
            'PROVIDER_ASSIGNMENT_OFFERED',
            'INTERNAL',
            'provider_assignment',
            ${route.assignment_id}::uuid,
            ${JSON.stringify({ routingId: route.routing_id, assignmentId: route.assignment_id })}::jsonb,
            'PENDING', 0, now(), now(), now()
          )
        on conflict (event_key) do nothing
      `;
    }

    return ok(res, {
      routingId: route.routing_id,
      assignmentId: route.assignment_id,
      offerStatus: route.offer_status,
      routingReason: route.routing_reason,
    });
  } catch (error) {
    console.error('Provider routing failed:', error);
    return fail(res, 'Provider routing failed.');
  }
}
