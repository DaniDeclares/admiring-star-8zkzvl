import prisma from '../lib/prisma.js';

const CRON_SECRET = process.env.CRON_SECRET;

async function sendEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('RESEND_NOT_CONFIGURED');
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: payload.to, subject: payload.subject || 'Dani Declares Update', html: payload.html || `<p>${payload.text || ''}</p>` }) });
  if (!response.ok) throw new Error(`RESEND_${response.status}`);
}

async function sendSms(payload) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) throw new Error('TWILIO_NOT_CONFIGURED');
  const body = new URLSearchParams({ To: payload.to, From: from, Body: payload.text || payload.message || 'Dani Declares update.' });
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body });
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
  if (CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}` && req.headers['x-cron-secret'] !== CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const items = await prisma.$queryRaw`
      select id, event_key, event_type, channel, aggregate_type, aggregate_id, payload, attempts
      from public.dd_event_outbox
      where status in ('PENDING','FAILED') and available_at <= now()
      order by created_at limit 20
    `;
    const results = [];
    for (const item of items) {
      try {
        const claimed = await prisma.$executeRaw`
          update public.dd_event_outbox
          set status = 'PROCESSING', attempts = attempts + 1, updated_at = now()
          where id = ${item.id}::uuid and status in ('PENDING','FAILED')
        `;
        if (!claimed) continue;
        await deliver(item);
        await prisma.$executeRaw`
          update public.dd_event_outbox set status = 'PROCESSED', processed_at = now(), updated_at = now(), last_error = null where id = ${item.id}::uuid
        `;
        results.push({ eventKey: item.event_key, status: 'PROCESSED' });
      } catch (error) {
        const delayMinutes = Math.min(60, 2 ** Math.min(Number(item.attempts || 0), 5));
        await prisma.$executeRaw`
          update public.dd_event_outbox
          set status = 'FAILED', last_error = ${String(error.message || error)}, available_at = now() + (${delayMinutes} * interval '1 minute'), updated_at = now()
          where id = ${item.id}::uuid
        `;
        results.push({ eventKey: item.event_key, status: 'FAILED', error: String(error.message || error) });
      }
    }
    return res.status(200).json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error('Outbox worker failed:', error);
    return res.status(500).json({ error: 'Outbox processing failed' });
  }
}
