import prisma from '../lib/prisma.js';

const CRON_SECRET = process.env.CRON_SECRET;
const MAX_RETRIES = Number(process.env.NOTIFICATION_MAX_RETRIES || 5);
const BATCH_SIZE = Math.min(25, Math.max(1, Number(process.env.PROVIDER_ROUTING_BATCH_SIZE || 10)));

function authorized(req) {
  if (!CRON_SECRET) return false;
  return req.headers.authorization === `Bearer ${CRON_SECRET}` || req.headers['x-cron-secret'] === CRON_SECRET;
}

async function sendSms(to, text) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !apiKeySid || !apiKeySecret || !from) throw new Error('TWILIO_NOT_CONFIGURED');

  const body = new URLSearchParams({ To: to, From: from, Body: text });
  const auth = Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`TWILIO_${response.status}`);
}

async function sendEmail(to, subject, text) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.NOTIFICATION_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('RESEND_NOT_CONFIGURED');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!response.ok) throw new Error(`RESEND_${response.status}`);
}

function buildProviderMessage(route) {
  const lines = [
    `DANI DECLARES work order ${route.job_id || route.routing_id}`,
    `Service: ${route.service_name || route.service_needed || 'Service request'}`,
    route.location_address ? `Location: ${route.location_address}` : null,
    route.timeline ? `Requested timing: ${route.timeline}` : null,
    route.priority ? `Priority: ${route.priority}` : null,
    '',
    'Reply through your provider workflow to ACCEPT or DECLINE this assignment.',
  ];
  return lines.filter(Boolean).join('\n');
}

async function claimRoute(routeId) {
  const rows = await prisma.$queryRaw`
    update private.dd_work_order_routing
    set notification_status = 'SENDING',
        notification_attempts = notification_attempts + 1,
        updated_at = now()
    where id = ${routeId}::uuid
      and offer_status = 'OFFERED'
      and notification_status = 'PENDING'
      and notification_attempts < ${MAX_RETRIES}
    returning id
  `;
  return Boolean(rows[0]);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const routes = await prisma.$queryRaw`
      select
        r.id as routing_id,
        r.job_id,
        r.assignment_id,
        r.notification_attempts,
        r.selected_provider_org_id,
        r.selected_provider_id,
        r.capability_key,
        r.service_id,
        r.location_zip,
        d.channel,
        d.destination,
        sr.service_needed,
        sr.location_address,
        sr.timeline,
        sr.priority,
        s.name as service_name
      from private.dd_work_order_routing r
      join lateral (
        select channel, destination
        from private.dd_provider_routing_destinations d
        where d.provider_org_id = r.selected_provider_org_id
          and d.is_active = true
          and d.channel in ('SMS', 'EMAIL')
        order by case when d.channel = 'SMS' then 1 else 2 end, d.created_at
        limit 1
      ) d on true
      left join public.dd_jobs j on j.id = r.job_id
      left join public.service_requests sr on sr.id = coalesce(j.service_request_id, r.request_id)
      left join public.services s on s.id = coalesce(r.service_id, sr.service_id)
      where r.offer_status = 'OFFERED'
        and r.notification_status = 'PENDING'
        and r.notification_attempts < ${MAX_RETRIES}
        -- Never notify a provider unless the complete authorization boundary is met.
        and exists (
          select 1
          from public.dd_provider_organizations po
          where po.id = r.selected_provider_org_id
            and po.is_active = true
            and po.network_access_level in ('AUTHORIZED', 'PREFERRED', 'STRATEGIC')
            and po.accepts_new_work = true
            and po.capacity_status = 'AVAILABLE'
            and po.agreement_status in ('EXECUTED', 'ACTIVE')
            and po.compliance_status = 'VERIFIED'
            and po.permission_status in ('APPROVED', 'AUTHORIZED', 'PERMISSION_GRANTED')
            and po.qualification_status in ('QUALIFIED', 'VERIFIED')
        )
        and exists (
          select 1
          from public.dd_provider_capabilities pc
          where pc.provider_org_id = r.selected_provider_org_id
            and pc.is_authorized = true
            and (r.service_id is null or pc.service_id = r.service_id)
            and (r.capability_key is null or pc.capability_key = r.capability_key)
        )
        and exists (
          select 1
          from public.dd_provider_coverage cov
          where cov.provider_org_id = r.selected_provider_org_id
            and (
              r.location_zip is null
              or cov.zip_code = r.location_zip
              or cov.territory_id = r.location_zip
            )
        )
      order by r.created_at
      limit ${BATCH_SIZE}
    `;

    const results = [];
    for (const route of routes) {
      if (!(await claimRoute(route.routing_id))) continue;
      try {
        const message = buildProviderMessage(route);
        if (route.channel === 'SMS') {
          await sendSms(route.destination, message);
        } else {
          await sendEmail(route.destination, `DANI DECLARES work order ${route.job_id || route.routing_id}`, message);
        }

        await prisma.$executeRaw`
          update private.dd_work_order_routing
          set notification_status = 'SENT', notified_at = now(), last_notification_error = null, updated_at = now()
          where id = ${route.routing_id}::uuid
        `;
        results.push({ routingId: route.routing_id, status: 'SENT', channel: route.channel });
      } catch (error) {
        const terminal = Number(route.notification_attempts || 0) + 1 >= MAX_RETRIES;
        await prisma.$executeRaw`
          update private.dd_work_order_routing
          set notification_status = ${terminal ? 'FAILED' : 'PENDING'},
              last_notification_error = ${String(error.message || error)},
              updated_at = now()
          where id = ${route.routing_id}::uuid
        `;
        results.push({ routingId: route.routing_id, status: terminal ? 'FAILED' : 'RETRY', error: String(error.message || error) });
      }
    }

    return res.status(200).json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error('Provider routing notification worker failed:', error);
    return res.status(500).json({ error: 'Provider routing notification worker failed' });
  }
}
