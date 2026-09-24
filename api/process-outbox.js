import crypto from 'node:crypto';
import prisma from '../lib/prisma.js';
import { renderTransactionalEmail } from './daniTransactionalEmailTemplates.js';

const CRON_SECRET = process.env.CRON_SECRET;
const MAX_RETRIES = Number(process.env.NOTIFICATION_MAX_RETRIES || 5);
const BATCH_SIZE = Math.min(100, Math.max(1, Number(process.env.NOTIFICATION_BATCH_SIZE || 20)));
const DEFAULT_RESEND_FROM = 'notifications@danideclares.com';

async function sendEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  const configuredFrom = process.env.RESEND_FROM_EMAIL || process.env.NOTIFICATION_FROM_EMAIL;
  // Resend's onboarding sender is test-only. Never allow it into production delivery.
  const from = configuredFrom && !configuredFrom.endsWith('@resend.dev')
    ? configuredFrom
    : DEFAULT_RESEND_FROM;
  if (!apiKey) throw new Error('RESEND_NOT_CONFIGURED');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject || 'Dani Declares Update',
      html: payload.html || renderTransactionalEmail({
        template: payload.template,
        data: payload.templateData,
        fallbackText: payload.text || '',
      }),
    }),
  });
  if (!response.ok) throw new Error(`RESEND_${response.status}`);
}

async function sendSms(payload) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const from = process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !apiKeySid || !apiKeySecret || !from) throw new Error('TWILIO_NOT_CONFIGURED');
  const body = new URLSearchParams({
    To: payload.to,
    From: from,
    Body: payload.text || payload.message || 'Dani Declares update.',
  });
  const auth = Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
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

function cleanResearchText(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function evaluateResearchSignals(text, signals) {
  const haystack = String(text || '').toLowerCase();
  return (Array.isArray(signals) ? signals : []).map(signal => {
    const all = Array.isArray(signal?.all) ? signal.all : [];
    const any = Array.isArray(signal?.any) ? signal.any : [];
    const matched =
      all.every(term => haystack.includes(String(term).toLowerCase())) &&
      (any.length === 0 || any.some(term => haystack.includes(String(term).toLowerCase())));
    return { signal: signal?.signal || 'unnamed', matched, all, any };
  });
}

async function processResearchSources() {
  const sources = await prisma.$queryRaw`
    select id, program_key, work_key, source_key, source_title, source_url,
           authority_level, temporal_class, expected_signals, check_interval_minutes,
           last_content_hash
    from public.dd_research_sources
    where status = 'ACTIVE' and next_check_at <= now()
    order by next_check_at asc
    limit 4
    for update skip locked
  `;

  const output = [];
  for (const source of sources) {
    try {
      await prisma.$executeRaw`
        update public.dd_research_sources
        set next_check_at = now() + make_interval(mins => ${Number(source.check_interval_minutes || 360)}),
            updated_at = now()
        where id = ${source.id}::uuid
      `;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(source.source_url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'DANI-Research-Watcher/1.0 (+https://danideclares.com)',
          Accept: 'text/html,text/plain,application/json,application/pdf;q=0.8,*/*;q=0.5',
        },
      });
      clearTimeout(timeout);

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      const isText = contentType.includes('text/') || contentType.includes('json') || contentType.includes('xml');
      const cleanText = isText ? cleanResearchText(buffer.toString('utf8')) : '';
      const matchedSignals = evaluateResearchSignals(cleanText, source.expected_signals);
      const changed = Boolean(source.last_content_hash && source.last_content_hash !== contentHash);
      const excerpt = cleanText
        ? cleanText.slice(0, 6000)
        : `[${contentType || 'binary'} source; ${buffer.length} bytes; content hash recorded]`;

      await prisma.$executeRaw`
        insert into public.dd_research_source_snapshots
          (source_id,http_status,content_hash,content_length,changed,matched_signals,excerpt,metadata)
        values
          (${source.id}::uuid,${response.status},${contentHash},${buffer.length},${changed},
           ${JSON.stringify(matchedSignals)}::jsonb,${excerpt},
           ${JSON.stringify({ finalUrl: response.url, contentType })}::jsonb)
      `;

      await prisma.$executeRaw`
        update public.dd_research_sources
        set last_checked_at = now(), last_http_status = ${response.status},
            last_content_hash = ${contentHash},
            last_changed_at = case when ${changed} then now() else last_changed_at end,
            consecutive_failures = 0, last_error = null, updated_at = now()
        where id = ${source.id}::uuid
      `;

      if (source.work_key) {
        await prisma.$executeRaw`
          update public.dd_research_work_queue
          set attempts = attempts + 1, last_researched_at = now(), updated_at = now(),
              next_action = case
                when ${changed} then 'Source changed; review latest snapshot before advancing this gate.'
                else next_action
              end
          where work_key = ${source.work_key}
        `;
      }

      for (const signal of matchedSignals.filter(item => item.matched)) {
        const claimKey = `WATCH_${source.source_key}_${signal.signal}`.slice(0, 250);
        const evidenceStatus = source.temporal_class === 'HISTORICAL' ? 'HISTORICAL' : 'CONFIRMED';
        const claimText = `Automated source check matched the configured "${signal.signal}" evidence signal on ${source.source_title}.`;
        await prisma.$executeRaw`
          insert into public.dd_research_evidence
            (program_key,claim_key,claim_text,evidence_status,source_title,source_url,
             authority_level,effective_as_of,notes,metadata,updated_at)
          values
            (${source.program_key},${claimKey},${claimText},${evidenceStatus},
             ${source.source_title},${source.source_url},${source.authority_level},
             current_date,'Deterministic source watcher signal; parent work gate still requires its full evidence contract.',
             ${JSON.stringify({ sourceKey: source.source_key, signal: signal.signal, automated: true })}::jsonb,now())
          on conflict(program_key,claim_key,source_title) do update set
            claim_text=excluded.claim_text,
            evidence_status=excluded.evidence_status,
            source_url=excluded.source_url,
            effective_as_of=excluded.effective_as_of,
            notes=excluded.notes,
            metadata=excluded.metadata,
            updated_at=now()
        `;
      }

      output.push({
        sourceKey: source.source_key,
        status: response.ok ? 'CHECKED' : `HTTP_${response.status}`,
        changed,
        matchedSignals: matchedSignals.filter(item => item.matched).map(item => item.signal),
      });
    } catch (error) {
      const message = String(error?.name === 'AbortError' ? 'FETCH_TIMEOUT' : (error?.message || error));
      await prisma.$executeRaw`
        update public.dd_research_sources
        set last_checked_at = now(),
            consecutive_failures = consecutive_failures + 1,
            last_error = ${message},
            next_check_at = now() + interval '60 minutes',
            updated_at = now()
        where id = ${source.id}::uuid
      `;
      if (source.work_key) {
        await prisma.$executeRaw`
          update public.dd_research_work_queue
          set attempts = attempts + 1, last_researched_at = now(), updated_at = now()
          where work_key = ${source.work_key}
        `;
      }
      output.push({ sourceKey: source.source_key, status: 'FAILED', error: message });
    }
  }
  return output;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!CRON_SECRET) return res.status(503).json({ error: 'Outbox worker is not configured' });
  const authorization = req.headers.authorization;
  const headerSecret = req.headers['x-cron-secret'];
  if (authorization !== `Bearer ${CRON_SECRET}` && headerSecret !== CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const items = await prisma.$queryRaw`
      select id, event_key, event_type, channel, aggregate_type, aggregate_id, payload, attempts
      from public.dd_event_outbox
      where status in ('PENDING','FAILED') and available_at <= now() and attempts < ${MAX_RETRIES}
      order by created_at limit ${BATCH_SIZE} for update skip locked
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
          update public.dd_event_outbox set status = 'PROCESSED', processed_at = now(), updated_at = now(), last_error = null where id = ${item.id}::uuid
        `;
        results.push({ eventKey: item.event_key, status: 'PROCESSED' });
      } catch (error) {
        const attempts = Number(item.attempts || 0) + 1;
        const terminal = attempts >= MAX_RETRIES;
        const delayMinutes = Math.min(60, 2 ** Math.min(attempts, 5));
        await prisma.$executeRaw`
          update public.dd_event_outbox set status = 'FAILED', last_error = ${String(error.message || error)}, available_at = ${terminal ? new Date() : new Date(Date.now() + delayMinutes * 60 * 1000)}, updated_at = now() where id = ${item.id}::uuid
        `;
        results.push({ eventKey: item.event_key, status: 'FAILED', terminal, error: String(error.message || error) });
      }
    }
    let researchResults = [];
    try {
      researchResults = await processResearchSources();
    } catch (researchError) {
      console.error('Research watcher failed:', researchError);
      researchResults = [{ status: 'FAILED', error: String(researchError?.message || researchError) }];
    }
    return res.status(200).json({ success: true, processed: results.length, maxRetries: MAX_RETRIES, results, research: { checked: researchResults.length, results: researchResults } });
  } catch (error) {
    console.error('Outbox worker failed:', error);
    return res.status(500).json({ error: 'Outbox processing failed' });
  }
}
