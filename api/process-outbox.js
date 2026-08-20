import prisma from '../lib/prisma.js';

const CRON_SECRET = process.env.CRON_SECRET;
const MAX_RETRIES = Number(process.env.NOTIFICATION_MAX_RETRIES || 5);
const BATCH_SIZE = Math.min(100, Math.max(1, Number(process.env.NOTIFICATION_BATCH_SIZE || 20)));

async function sendEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.NOTIFICATION_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('RESEND_NOT_CONFIGURED');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject || 'Dani Declares Update',
      html: payload.html || `<p>${payload.text || ''}</p>`,
    }),
  });
  if (!response.ok) throw new Error(`RESEND_${response.status}`);
}

async function sendSms(payload) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) throw new Error('TWILIO_NOT_CONFIGURED');
  const body = new URLSearchParams({
    To: payload.to,
    From: from,
    Body: payload.text || payload.message || 'Dani Declares update.',
  });
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`TWILIO_${response.status}`);
}

async function deliver(item) {
  if (item.channel === 'EMAIL') return sendEmail(item.payload || {});
  if (item.channel === 'SMS') return sendSms(item.payload || {});
  if (item.channel === 'INTERNAL') return;
  throw new Error(`UNSUPPORTED_OUTBOX_CHANNEL:${item.channel}`);
}

export default async function handler(req, res) {
  if (!['POST', 'GET'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}` && req.headers['x-cron-secret'] !== CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const items = await prisma.$queryRaw`
      select id, event_key, event_type, channel, aggregate_type, aggregate_id, payload, attempts
      from public.dd_event_outbox
      where status in ('PENDING','FAILED')
        and available_at <= now()
        and attempts < ${MAX_RETRIES}
      order by created_at
      limit ${BATCH_SIZE}
      for update skip locked
    `;

    const results = [];
    for (const item of items) {
      try {
        const claimed = await prisma.$executeRaw`
          update public.dd_event_outbox
          set status = 'PROCESSING', attempts = attempts + 1, updated_at = now()
          where id = ${item.id}::uuid and status in ('PENDING','FAILED') and attempts < ${MAX_RETRIES}
        `;
        if (!claimed) continue;

        await deliver(item);
        await prisma.$executeRaw`
          update public.dd_event_outbox
          set status = 'PROCESSED', processed_at = now(), updated_at = now(), last_error = null
          where id = ${item.id}::uuid
        `;
        results.push({ eventKey: item.event_key, status: 'PROCESSED' });
      } catch (error) {
        const attempts = Number(item.attempts || 0) + 1;
        const terminal = attempts >= MAX_RETRIES;
        const delayMinutes = Math.min(60, 2 ** Math.min(attempts, 5));
        await prisma.$executeRaw`
          update public.dd_event_outbox
          set status = ${terminal ? 'FAILED' : 'FAILED'},
              last_error = ${String(error.message || error)},
              available_at = ${terminal ? new Date() : new Date(Date.now() + delayMinutes * 60 * 1000)},
              updated_at = now()
          where id = ${item.id}::uuid
        `;
        results.push({ eventKey: item.event_key, status: 'FAILED', terminal, error: String(error.message || error) });
      }
    }

    return res.status(200).json({ success: true, processed: results.length, maxRetries: MAX_RETRIES, results });
  } catch (error) {
    console.error('Outbox worker failed:', error);
    return res.status(500).json({ error: 'Outbox processing failed' });
  }
}
