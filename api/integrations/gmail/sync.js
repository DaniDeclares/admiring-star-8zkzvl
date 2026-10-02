import { createClient } from '@supabase/supabase-js';
import { decryptSecret, encryptSecret, ENVIRONMENT, logIntegrationEvent, requireStaff } from '../../_integrationOAuth.js';

function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is missing.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function header(headers, name) {
  return (headers || []).find(h => String(h.name || '').toLowerCase() === name.toLowerCase())?.value || '';
}
function addresses(value) {
  return String(value || '').split(',').map(v => v.trim()).filter(Boolean);
}
function emailOnly(value) {
  const m = String(value || '').match(/<([^>]+)>/);
  return (m ? m[1] : value || '').trim().toLowerCase();
}

const RECENT_BATCH = 100;
const BACKLOG_BATCH = 25;
const PROCESSED_LABEL = 'DANI/00 Processed';
const ROUTING_LABELS = {
  SALES: 'DANI/01 Revenue & Sales',
  FINANCE: 'DANI/05 Finance',
  SYSTEMS: 'DANI/08 Systems & Engineering',
  RESEARCH: 'DANI/09 Research & Market Intelligence',
  COMPLIANCE: 'DANI/06 Compliance & Insurance',
  OPERATIONS: 'DANI/10 Operations & Service',
};

function decodeBase64Url(value = '') {
  if (!value) return '';
  return Buffer.from(String(value).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}
function stripHtml(value = '') {
  return String(value)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
function extractBody(payload) {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) return decodeBase64Url(payload.body.data);
  if (payload.mimeType === 'text/html' && payload.body?.data) return stripHtml(decodeBase64Url(payload.body.data));
  for (const part of payload.parts || []) {
    const text = extractBody(part);
    if (text) return text;
  }
  return '';
}
function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}
function classifyMessage({ from, subject, body, labelIds, direction }) {
  const text = `${from} ${subject || ''} ${body || ''}`.toLowerCase();
  const automated = hasAny(text, [
    /no-?reply@/, /noreply@/, /mailer-daemon/, /notifications@github\.com/,
    /facebookmail\.com/, /linkedin\.com/, /unsubscribe/,
  ]);
  let bucket = 'RESEARCH';
  let priority = 'NORMAL';
  let requiresAttention = direction === 'INBOUND' && !automated;
  let reason = requiresAttention ? 'Inbound business email requires triage.' : null;

  if (hasAny(text, [/invoice/, /payment/, /debit card/, /bank account/, /paypal/, /stripe/, /refund/, /transfer/, /balance/, /charge/, /billing/, /smart pay/])) bucket = 'FINANCE';
  if (hasAny(text, [/github/, /netlify/, /vercel/, /supabase/, /deployment/, /workflow run/, /run failed/, /oauth/, /security alert/, /new login/, /dmarc/, /api/, /integration/])) bucket = 'SYSTEMS';
  if (hasAny(text, [/insurance/, /policy/, /compliance/, /legal terms/, /privacy policy/, /certificate/, /license/, /bond/, /netvendor/])) bucket = 'COMPLIANCE';
  if (hasAny(text, [/research/, /survey/, /study/, /gift card/, /market intelligence/, /weekly update/, /webinar/, /grant landscape/, /newsletter/, /job alert/, /hiring/, /opportunity/])) bucket = 'RESEARCH';
  if (hasAny(text, [/turnover/, /property manager/, /leasing/, /community manager/, /vendor opportunit/, /quote/, /pilot/, /lead/, /prospect/, /customer/, /client/, /sales/, /wegolook/, /look available/, /referral/])) bucket = 'SALES';
  if (hasAny(text, [/job scheduled/, /appointment/, /service request/, /provider/, /dispatch/, /work order/, /maintenance request/])) bucket = 'OPERATIONS';

  const urgent = hasAny(text, [
    /urgent/, /deadline/, /expires? (today|tomorrow|in \d+ day)/, /failed/, /blocked/,
    /declined/, /past due/, /action required/, /verify your/, /security alert/, /new login/,
    /suspended/, /cancelled/, /canceled/,
  ]);
  if (urgent) {
    priority = 'URGENT';
    requiresAttention = direction === 'INBOUND';
    reason = 'Inbound email contains a deadline, failure, security, or action-required signal.';
  } else if (requiresAttention && bucket === 'SALES') {
    priority = 'HIGH';
    reason = 'Inbound sales or relationship email requires review.';
  }
  if (automated && !urgent) requiresAttention = false;

  return {
    bucket,
    routing_label: ROUTING_LABELS[bucket] || ROUTING_LABELS.RESEARCH,
    priority,
    requires_attention: requiresAttention,
    attention_reason: reason,
    automated,
    classifier: 'gmail_reconciliation_v2',
    source_label_ids: labelIds || [],
  };
}

async function refreshAccessToken(supabase, connection) {
  const refreshToken = decryptSecret(connection.refresh_token_ciphertext);
  if (!refreshToken) throw new Error('GMAIL_REFRESH_TOKEN_MISSING');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('GOOGLE_OAUTH_CONFIGURATION_MISSING');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    })
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error(body.error_description || body.error || 'GMAIL_TOKEN_REFRESH_FAILED');
  const expiresAt = body.expires_in ? new Date(Date.now() + Number(body.expires_in) * 1000).toISOString() : null;
  const encrypted = encryptSecret(body.access_token);
  const { error } = await supabase.from('dd_integration_connections').update({
    access_token_ciphertext: encrypted,
    token_expires_at: expiresAt,
    last_error: null,
    updated_at: new Date().toISOString()
  }).eq('id', connection.id);
  if (error) throw error;
  return body.access_token;
}

async function gmailJson(url, accessToken, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: 'Bearer ' + accessToken }
  });
  const body = response.status === 204 ? {} : await response.json();
  if (!response.ok) {
    const error = new Error(body?.error?.message || 'GMAIL_API_FAILED');
    error.status = response.status;
    throw error;
  }
  return body;
}

async function ensureLabel(accessToken, name) {
  const list = await gmailJson('https://gmail.googleapis.com/gmail/v1/users/me/labels', accessToken);
  const existing = (list.labels || []).find(label => label.name === name);
  if (existing) return existing.id;
  const created = await gmailJson('https://gmail.googleapis.com/gmail/v1/users/me/labels', accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, labelListVisibility: 'labelShow', messageListVisibility: 'show' })
  });
  return created.id;
}

async function modifyMessage(accessToken, messageId, { addLabelIds = [], markRead = false } = {}) {
  return gmailJson(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + encodeURIComponent(messageId) + '/modify',
    accessToken,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addLabelIds: [...new Set(addLabelIds.filter(Boolean))],
        removeLabelIds: markRead ? ['UNREAD'] : []
      })
    }
  );
}

async function listMessages(accessToken, query, maxResults) {
  return gmailJson(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=' + maxResults + '&q=' + encodeURIComponent(query),
    accessToken
  );
}

async function processMessage({ supabase, connection, accessToken, ownEmail, item, processedLabelId }) {
  const message = await gmailJson(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + encodeURIComponent(item.id) + '?format=full',
    accessToken
  );
  if ((message.labelIds || []).includes(processedLabelId)) return { skipped: true };

  const headers = message.payload?.headers || [];
  const from = emailOnly(header(headers, 'From'));
  const toRaw = header(headers, 'To');
  const direction = ownEmail && from === ownEmail ? 'OUTBOUND' : 'INBOUND';
  const receivedAt = message.internalDate ? new Date(Number(message.internalDate)).toISOString() : new Date().toISOString();
  const subject = header(headers, 'Subject') || null;
  const body = extractBody(message.payload) || message.snippet || '';
  const excerpt = body.slice(0, 5000);
  const classification = classifyMessage({ from, subject, body: excerpt, labelIds: message.labelIds || [], direction });

  const { data: eventId, error } = await supabase.rpc('dd_ingest_email_communication', {
    p_external_message_id: message.id,
    p_external_thread_id: message.threadId || null,
    p_direction: direction,
    p_sender_address: from,
    p_recipient_addresses: addresses(toRaw),
    p_subject: subject,
    p_body_excerpt: excerpt || null,
    p_received_at: receivedAt,
    p_raw_metadata: {
      history_id: message.historyId || null,
      label_ids: message.labelIds || [],
      gmail_connection_id: connection.id,
      account_email: ownEmail || null,
      reconciliation_version: 2
    }
  });
  if (error) throw error;

  const { error: updateError } = await supabase.from('dd_communication_events').update({
    priority: classification.priority,
    requires_attention: classification.requires_attention,
    attention_reason: classification.attention_reason,
    classification,
    processed_at: new Date().toISOString()
  }).eq('id', eventId);
  if (updateError) throw updateError;

  if (!classification.requires_attention) {
    await supabase.from('dd_owner_attention_queue')
      .update({ status: 'SUPERSEDED', resolved_at: new Date().toISOString() })
      .eq('source_table', 'dd_communication_events')
      .eq('source_record_id', String(eventId))
      .eq('status', 'OPEN');
  }

  const routeLabelId = await ensureLabel(accessToken, classification.routing_label);
  await modifyMessage(accessToken, message.id, {
    addLabelIds: [processedLabelId, routeLabelId],
    markRead: direction === 'INBOUND'
  });

  return {
    skipped: false,
    bucket: classification.bucket,
    requiresAttention: classification.requires_attention
  };
}

async function syncConnection(supabase, connection) {
  let accessToken = connection.access_token_ciphertext ? decryptSecret(connection.access_token_ciphertext) : null;
  const expiring = !connection.token_expires_at || new Date(connection.token_expires_at).getTime() < Date.now() + 60_000;
  if (!accessToken || expiring) accessToken = await refreshAccessToken(supabase, connection);

  const ownEmail = String(connection.token_metadata?.email || '').toLowerCase();
  const processedLabelId = await ensureLabel(accessToken, PROCESSED_LABEL);
  const stats = { recent: 0, backlog: 0, skipped: 0, attention: 0, buckets: {} };
  const runs = [
    { kind: 'recent', query: `newer_than:2d -in:spam -in:trash -label:"${PROCESSED_LABEL}"`, max: RECENT_BATCH },
    { kind: 'backlog', query: `older_than:2d -in:spam -in:trash -label:"${PROCESSED_LABEL}"`, max: BACKLOG_BATCH }
  ];

  for (const run of runs) {
    let list;
    try {
      list = await listMessages(accessToken, run.query, run.max);
    } catch (error) {
      if (error.status !== 401) throw error;
      accessToken = await refreshAccessToken(supabase, connection);
      list = await listMessages(accessToken, run.query, run.max);
    }

    for (const item of list.messages || []) {
      const result = await processMessage({ supabase, connection, accessToken, ownEmail, item, processedLabelId });
      if (result.skipped) {
        stats.skipped += 1;
        continue;
      }
      stats[run.kind] += 1;
      stats.buckets[result.bucket] = (stats.buckets[result.bucket] || 0) + 1;
      if (result.requiresAttention) stats.attention += 1;
    }
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase.from('dd_integration_connections').update({
    last_sync_at: now,
    last_error: null,
    updated_at: now
  }).eq('id', connection.id);
  if (updateError) throw updateError;

  await logIntegrationEvent({
    supabase,
    adapterCode: 'GMAIL',
    connectionId: connection.id,
    direction: 'INBOUND',
    eventType: 'MAILBOX_SYNC',
    status: 'PROCESSED',
    payload: {
      reconciliation_version: 2,
      recent_processed: stats.recent,
      backlog_processed: stats.backlog,
      skipped: stats.skipped,
      attention: stats.attention,
      buckets: stats.buckets
    }
  });
  return stats;
}

export default async function handler(req, res) {
  if (!['GET','POST'].includes(req.method)) return res.status(405).json({ success: false, error: 'Method not allowed' });
  const supabase = adminClient();
  try {
    const cronAuthorized = process.env.CRON_SECRET && req.headers.authorization === 'Bearer ' + process.env.CRON_SECRET;
    if (!cronAuthorized) await requireStaff(req);

    const { data: connections, error } = await supabase.from('dd_integration_connections')
      .select('*')
      .eq('adapter_code', 'GMAIL')
      .eq('environment', ENVIRONMENT)
      .eq('connection_status', 'CONNECTED');
    if (error) throw error;
    if (!connections?.length) return res.status(200).json({ success: true, connected: false, processed: 0 });

    const totals = { recent: 0, backlog: 0, skipped: 0, attention: 0, buckets: {} };
    for (const connection of connections) {
      try {
        const stats = await syncConnection(supabase, connection);
        totals.recent += stats.recent;
        totals.backlog += stats.backlog;
        totals.skipped += stats.skipped;
        totals.attention += stats.attention;
        for (const [bucket, count] of Object.entries(stats.buckets)) {
          totals.buckets[bucket] = (totals.buckets[bucket] || 0) + count;
        }
      } catch (error) {
        await supabase.from('dd_integration_connections').update({
          last_error: error.message || 'GMAIL_SYNC_FAILED',
          updated_at: new Date().toISOString()
        }).eq('id', connection.id);
        await logIntegrationEvent({
          supabase,
          adapterCode: 'GMAIL',
          connectionId: connection.id,
          direction: 'INBOUND',
          eventType: 'MAILBOX_SYNC',
          status: 'FAILED',
          errorMessage: error.message || 'GMAIL_SYNC_FAILED'
        });
        throw error;
      }
    }
    return res.status(200).json({
      success: true,
      connected: true,
      processed: totals.recent + totals.backlog,
      ...totals
    });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, error: error.message || 'GMAIL_SYNC_FAILED' });
  }
}
