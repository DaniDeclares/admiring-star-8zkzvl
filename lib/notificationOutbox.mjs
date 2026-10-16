import crypto from 'node:crypto';

const fail = (code, outcome = 'REJECTED') => Object.assign(new Error(code), { code, outcome });
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
export const emailFingerprint = body => crypto.createHash('sha256').update(JSON.stringify(canonical(body))).digest('hex');

function prepare(item, env, renderEmail) {
  const payload = item.payload || {};
  if (item.channel === 'INTERNAL') return null; // Existing internal handler has no external side effect.
  if (item.channel === 'EMAIL') {
    if (!env.RESEND_API_KEY) throw fail('RESEND_NOT_CONFIGURED', 'CONFIGURATION_BLOCKED');
    const configured = env.RESEND_FROM_EMAIL || env.NOTIFICATION_FROM_EMAIL;
    const body = item.frozen_request || {
      from: configured && !configured.endsWith('@resend.dev') ? configured : 'notifications@danideclares.com',
      to: payload.to, subject: payload.subject || 'Dani Declares Update',
      html: payload.html || renderEmail({ template: payload.template, data: payload.templateData, fallbackText: payload.text || '' }),
    };
    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    if (!recipients.length || recipients.some(to => typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))
      || typeof body.html !== 'string' || !body.html || typeof body.subject !== 'string') throw fail('EMAIL_PAYLOAD_INVALID');
    if (item.request_fingerprint && item.request_fingerprint !== emailFingerprint(body)) throw fail('FROZEN_REQUEST_MISMATCH');
    return body;
  }
  if (item.channel === 'SMS') {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_API_KEY_SID || !env.TWILIO_API_KEY_SECRET
      || !(env.TWILIO_FROM_NUMBER || env.TWILIO_PHONE_NUMBER)) throw fail('TWILIO_NOT_CONFIGURED', 'CONFIGURATION_BLOCKED');
    if (typeof payload.to !== 'string' || !/^\+[1-9]\d{7,14}$/.test(payload.to)) throw fail('SMS_PAYLOAD_INVALID');
    return new URLSearchParams({ To: payload.to, From: env.TWILIO_FROM_NUMBER || env.TWILIO_PHONE_NUMBER,
      Body: payload.text || payload.message || 'Dani Declares update.' });
  }
  throw fail('UNSUPPORTED_OUTBOX_CHANNEL');
}

async function dispatch(item, body, env, fetchImpl) {
  if (item.channel === 'INTERNAL') return { outcome: 'COMPLETED', emailId: null, smsId: null };
  const email = item.channel === 'EMAIL';
  const response = await fetchImpl(email ? 'https://api.resend.com/emails'
    : `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: email ? {
      Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json',
      'User-Agent': 'DANI-notification-worker',
      'Idempotency-Key': `dd-${crypto.createHash('sha256').update(item.event_key).digest('hex').slice(0, 60)}`,
    } : { Authorization: `Basic ${Buffer.from(`${env.TWILIO_API_KEY_SID}:${env.TWILIO_API_KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded' },
    body: email ? JSON.stringify(body) : body,
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    // Never retain arbitrary provider bodies, recipient details or network errors.
    const terminal = [400, 401, 403, 404, 422].includes(response.status);
    throw fail(`${email ? 'RESEND' : 'TWILIO'}_${response.status}`, terminal ? 'REJECTED' : 'UNCERTAIN');
  }
  const receipt = await response.json().catch(() => ({}));
  const id = email ? receipt.id : receipt.sid;
  if (typeof id !== 'string' || !id) throw fail('PROVIDER_ACCEPTANCE_UNCERTAIN', 'UNCERTAIN');
  return { outcome: 'ACCEPTED', emailId: email ? id : null, smsId: email ? null : id };
}

export async function processNotificationOutbox({ db, env = process.env, fetchImpl = globalThis.fetch, renderEmail }) {
  const maxRetries = Number(env.NOTIFICATION_MAX_RETRIES || 5);
  const batchSize = Math.min(100, Math.max(1, Number(env.NOTIFICATION_BATCH_SIZE || 20)));
  const items = await db.$queryRaw`
    with eligible as (
      select id, status as previous_status, claimed_at as previous_claimed_at
      from public.dd_event_outbox
      where (status in ('PENDING','FAILED') and available_at <= now() and attempts < ${maxRetries}
          and (delivery_outcome is null or delivery_outcome = 'RETRYABLE'))
        or (status = 'PROCESSING' and (claimed_at is null or claimed_at < now() - interval '10 minutes'))
      order by created_at limit ${batchSize} for update skip locked
    )
    update public.dd_event_outbox o
    set status = 'PROCESSING', attempts = o.attempts + 1,
      claim_token = gen_random_uuid(), claimed_at = now(), updated_at = now()
    from eligible where o.id = eligible.id
    returning o.*, eligible.previous_status, eligible.previous_claimed_at
  `;
  const results = [];
  for (const item of items) {
    const transition = async query => {
      const rows = await query();
      if (rows.length !== 1) throw fail('CLAIM_LOST', 'CLAIM_LOST');
    };
    let intentSaved = false;
    try {
      // Evidence belongs to its transport. An email receipt cannot complete SMS.
      const accepted = item.channel === 'EMAIL' ? item.provider_email_id : item.channel === 'SMS' ? item.provider_sms_id : null;
      if (accepted) {
        await transition(() => db.$queryRaw`
          update public.dd_event_outbox set status='PROCESSED', delivery_outcome='ACCEPTED',
            processed_at=now(), updated_at=now(), last_error=null
          where id=${item.id}::uuid and claim_token=${item.claim_token}::uuid and status='PROCESSING' returning id
        `);
        results.push({ eventKey:item.event_key, status:'RECONCILED' });
        continue;
      }
      const priorIntent = item.channel === 'EMAIL' ? item.first_attempt_at : item.channel === 'SMS' ? item.sms_attempt_started_at : null;
      const legacyAmbiguous = item.channel !== 'INTERNAL' && !priorIntent &&
        ((item.previous_status === 'PROCESSING' && !item.previous_claimed_at)
        || (item.previous_status === 'FAILED' && !item.delivery_outcome && item.attempts > 1));
      if (priorIntent || legacyAmbiguous) throw fail('RECONCILIATION_REQUIRED', 'UNCERTAIN');
      // Configuration and payload validation precede the durable dispatch intent.
      const body = prepare(item, env, renderEmail);
      if (item.channel === 'EMAIL') {
        await transition(() => db.$queryRaw`
          update public.dd_event_outbox set notification_identity=coalesce(notification_identity,event_key),
            frozen_request=coalesce(frozen_request,${JSON.stringify(body)}::jsonb),
            request_fingerprint=coalesce(request_fingerprint,${emailFingerprint(body)}),
            first_attempt_at=now(), updated_at=now()
          where id=${item.id}::uuid and claim_token=${item.claim_token}::uuid and status='PROCESSING'
            and first_attempt_at is null and (delivery_outcome is null or delivery_outcome='RETRYABLE') returning id
        `);
        intentSaved = true;
      } else if (item.channel === 'SMS') {
        await transition(() => db.$queryRaw`
          update public.dd_event_outbox set sms_attempt_started_at=now(), updated_at=now()
          where id=${item.id}::uuid and claim_token=${item.claim_token}::uuid and status='PROCESSING'
            and sms_attempt_started_at is null and (delivery_outcome is null or delivery_outcome='RETRYABLE') returning id
        `);
        intentSaved = true;
      }
      const receipt = await dispatch(item, body, env, fetchImpl);
      await transition(() => db.$queryRaw`
        update public.dd_event_outbox set provider_email_id=${receipt.emailId}, provider_sms_id=${receipt.smsId},
          delivery_outcome=${receipt.outcome}, status='PROCESSED', processed_at=now(), last_error=null, updated_at=now()
        where id=${item.id}::uuid and claim_token=${item.claim_token}::uuid and status='PROCESSING' returning id
      `);
      results.push({ eventKey:item.event_key, status:'PROCESSED' });
    } catch (error) {
      if (error.outcome === 'CLAIM_LOST') {
        results.push({ eventKey:item.event_key, status:'CLAIM_LOST' });
        continue;
      }
      const outcome = error.outcome || (intentSaved ? 'UNCERTAIN' : 'RETRYABLE');
      const code = error.code && error.outcome ? error.code : 'OUTBOX_OPERATION_FAILED';
      try {
        await transition(() => db.$queryRaw`
          update public.dd_event_outbox set status='FAILED', delivery_outcome=${outcome}, last_error=${code},
            available_at=now() + interval '5 minutes', updated_at=now()
          where id=${item.id}::uuid and claim_token=${item.claim_token}::uuid and status='PROCESSING' returning id
        `);
        results.push({ eventKey:item.event_key, status:'FAILED', outcome });
      } catch (persistError) {
        if (persistError.outcome !== 'CLAIM_LOST') throw persistError;
        results.push({ eventKey:item.event_key, status:'CLAIM_LOST' });
      }
    }
  }
  return { results, maxRetries };
}

// Explicit, per-record recovery only. Never clears evidence or resets attempt history.
// The operator must run this after correcting configuration, with the worker's environment.
export async function resumeConfigurationBlocked({ db, id, env = process.env, renderEmail }) {
  const [item] = await db.$queryRaw`select * from public.dd_event_outbox where id=${id}::uuid`;
  if (!item || item.status !== 'FAILED' || item.delivery_outcome !== 'CONFIGURATION_BLOCKED') throw fail('NOT_CONFIGURATION_BLOCKED');
  prepare(item, env, renderEmail);
  const rows = await db.$queryRaw`
    update public.dd_event_outbox set status='PENDING', delivery_outcome='RETRYABLE', available_at=now(), updated_at=now()
    where id=${id}::uuid and status='FAILED' and delivery_outcome='CONFIGURATION_BLOCKED'
      and first_attempt_at is null and sms_attempt_started_at is null
      and provider_email_id is null and provider_sms_id is null
      and attempts < ${Number(env.NOTIFICATION_MAX_RETRIES || 5)} returning id
  `;
  if (rows.length !== 1) throw fail('CONFIGURATION_RECOVERY_REFUSED');
}
