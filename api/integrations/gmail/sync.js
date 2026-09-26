import { createClient } from '@supabase/supabase-js';
import { decryptSecret, encryptSecret, ENVIRONMENT, logIntegrationEvent, requireStaff } from '../../_integrationOAuth.js';
import { classifyGmailMessage } from '../../../src/lib/operations/gmailMailboxPolicy2026.js';
import { normalizeGmailMessage } from './gmailIntelligenceIngestion.js';

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

async function gmailJson(url, accessToken) {
  const response = await fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body?.error?.message || 'GMAIL_API_FAILED');
    error.status = response.status;
    throw error;
  }
  return body;
}

async function syncConnection(supabase, connection) {
  let accessToken = connection.access_token_ciphertext ? decryptSecret(connection.access_token_ciphertext) : null;
  const expiring = !connection.token_expires_at || new Date(connection.token_expires_at).getTime() < Date.now() + 60_000;
  if (!accessToken || expiring) accessToken = await refreshAccessToken(supabase, connection);

  const ownEmail = String(connection.token_metadata?.email || '').toLowerCase();
  const query = encodeURIComponent('newer_than:2d -in:spam -in:trash');
  let list;
  try {
    list = await gmailJson('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=' + query, accessToken);
  } catch (error) {
    if (error.status !== 401) throw error;
    accessToken = await refreshAccessToken(supabase, connection);
    list = await gmailJson('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=' + query, accessToken);
  }

  let ingested = 0;
  let intelligenceQueued = 0;
  for (const item of list.messages || []) {
    const message = await gmailJson(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + encodeURIComponent(item.id) + '?format=full',
      accessToken
    );
    const headers = message.payload?.headers || [];
    const fromRaw = header(headers, 'From');
    const toRaw = header(headers, 'To');
    const from = emailOnly(fromRaw);
    const direction = ownEmail && from === ownEmail ? 'OUTBOUND' : 'INBOUND';
    const receivedAt = message.internalDate ? new Date(Number(message.internalDate)).toISOString() : new Date().toISOString();
    const { error } = await supabase.rpc('dd_ingest_email_communication', {
      p_external_message_id: message.id,
      p_external_thread_id: message.threadId || null,
      p_direction: direction,
      p_sender_address: from,
      p_recipient_addresses: addresses(toRaw),
      p_subject: header(headers, 'Subject') || null,
      p_body_excerpt: message.snippet || null,
      p_received_at: receivedAt,
      p_raw_metadata: {
        history_id: message.historyId || null,
        label_ids: message.labelIds || [],
        gmail_connection_id: connection.id,
        account_email: ownEmail || null
      }
    });
    if (error) throw error;
    const sorting = classifyGmailMessage({ accountEmail: ownEmail, subject: header(headers, 'Subject'), snippet: message.snippet || '', from });
    if (!sorting.internalOnly && (sorting.intelligenceEligible || sorting.needsReview)) {
      const normalized = normalizeGmailMessage({ message, accountEmail: ownEmail, sorting });
      const observation = [normalized.subject, normalized.snippet, ...normalized.bodies.filter(b => b.mimeType === 'text/plain').map(b => b.text)].filter(Boolean).join(' — ').slice(0, 12000) || 'Gmail message collected for intelligence review';
      const { error: intelligenceError } = await supabase.from('dd_learning_evidence_intake').upsert({ evidence_key: `GMAIL:${connection.id}:${message.id}`, evidence_origin: 'RESEARCH', domain: 'SUPPORT_CONVERSATION', source_system: 'GMAIL', source_reference: message.id, observation, evidence_payload: normalized, authority_class: 'EVIDENCE', requires_new_test: true, status: 'NEW', updated_at: new Date().toISOString() }, { onConflict: 'evidence_key' });
      if (intelligenceError) throw intelligenceError;
      intelligenceQueued += 1;
    }
    ingested += 1;
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase.from('dd_integration_connections').update({
    last_sync_at: now,
    last_error: null,
    updated_at: now
  }).eq('id', connection.id);
  if (updateError) throw updateError;
  await logIntegrationEvent({
    supabase, adapterCode: 'GMAIL', connectionId: connection.id, direction: 'INBOUND',
    eventType: 'MAILBOX_SYNC', status: 'PROCESSED', payload: { messages_scanned: ingested, intelligence_items_queued: intelligenceQueued }
  });
  return { ingested, intelligenceQueued };
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
    if (!connections?.length) return res.status(200).json({ success: true, connected: false, ingested: 0 });

    let total = 0;
    let intelligenceQueued = 0;
    for (const connection of connections) {
      try {
        const result = await syncConnection(supabase, connection);
        total += result.ingested;
        intelligenceQueued += result.intelligenceQueued;
      } catch (error) {
        await supabase.from('dd_integration_connections').update({
          last_error: error.message || 'GMAIL_SYNC_FAILED',
          updated_at: new Date().toISOString()
        }).eq('id', connection.id);
        await logIntegrationEvent({
          supabase, adapterCode: 'GMAIL', connectionId: connection.id, direction: 'INBOUND',
          eventType: 'MAILBOX_SYNC', status: 'FAILED', errorMessage: error.message || 'GMAIL_SYNC_FAILED'
        });
        throw error;
      }
    }
    return res.status(200).json({ success: true, connected: true, ingested: total, intelligence_queued: intelligenceQueued });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, error: error.message || 'GMAIL_SYNC_FAILED' });
  }
}
