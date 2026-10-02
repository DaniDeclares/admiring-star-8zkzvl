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

function firstMoney(text='') {
  const matches = [...String(text).matchAll(/\$\s*([0-9]+(?:,[0-9]{3})*(?:\.\d{1,2})?)/g)]
    .map(m => Number(m[1].replace(/,/g,'')))
    .filter(Number.isFinite);
  return matches.length ? Math.max(...matches) : null;
}
function firstDistanceMiles(text='') {
  const m=String(text).match(/approximately\s+(\d+(?:\.\d+)?)\s+miles?|\b(\d+(?:\.\d+)?)\s+miles?\s+(?:away|from you)/i);
  return m ? Number(m[1] || m[2]) : null;
}
function firstDurationMinutes(text='') {
  const minute=String(text).match(/\b(\d{1,3})\s*(?:minute|min)\b/i);
  if(minute) return Number(minute[1]);
  const hour=String(text).match(/\b(\d+(?:\.\d+)?)\s*(?:hour|hr)\b/i);
  return hour ? Math.round(Number(hour[1])*60) : null;
}
function transportationNeedsActualCost(profile, miles) {
  if (!miles || miles<=0) return false;
  const transport=String(profile?.vehicle_equipment||'').toLowerCase();
  if (!transport) return true;
  return /rideshare|uber|lyft|bus|marta|rail|borrow|friend|family|no car|no vehicle/.test(transport);
}
function scoreOpportunityEconomics({ subject, body, profile }) {
  const text=`${subject||''} ${body||''}`;
  const gross=firstMoney(text);
  const oneWayMiles=firstDistanceMiles(text);
  const durationMinutes=firstDurationMinutes(text);
  const upfrontSpend=hasAny(text.toLowerCase(),[
    /activation required/,/subscription required/,/membership required/,/pay (?:a|the) fee/,
    /purchase required/,/deposit required/,/wallet deposit/,/buy .* first/
  ]);
  const isRemote=hasAny(text.toLowerCase(),[/\bremote\b/,/online survey/,/complete on your own/,/virtual/]);
  const radius=Number(profile?.service_radius_miles);
  const outsideRadius=Number.isFinite(oneWayMiles)&&Number.isFinite(radius)&&oneWayMiles>radius;
  const needsTransportCost=!isRemote && transportationNeedsActualCost(profile,oneWayMiles);
  const grossHourly=gross && durationMinutes ? Number((gross*60/durationMinutes).toFixed(2)) : null;

  let state='INSUFFICIENT_ECONOMICS_DATA';
  let reason='Compensation, time, travel, or cost inputs are incomplete.';
  if (upfrontSpend) {
    state='BLOCKED_UPFRONT_SPEND';
    reason='Opportunity requires spend/activation before earnings are established.';
  } else if (outsideRadius && !profile?.willing_outside_radius) {
    state='BLOCKED_OUTSIDE_NORMAL_RADIUS';
    reason='Travel exceeds the stored normal service radius and outside-radius work is not authorized.';
  } else if (needsTransportCost) {
    state='NEEDS_ACTUAL_TRANSPORT_COST';
    reason='Travel is required but the current transportation mode needs a real trip cost before net economics can be judged.';
  } else if (gross!==null && (isRemote || oneWayMiles===0 || oneWayMiles===null)) {
    state=durationMinutes ? 'ECONOMICS_REVIEW_READY' : 'NEEDS_TIME_ESTIMATE';
    reason=durationMinutes ? 'Gross compensation and task time are known; compare against owner-time threshold.' : 'Compensation is known but total time is not.';
  } else if (gross!==null && oneWayMiles!==null) {
    state='NEEDS_TRAVEL_COST';
    reason='Gross compensation and distance are known; actual round-trip travel cost is still required.';
  }
  return {
    state, reason,
    gross_compensation_usd:gross,
    one_way_miles:oneWayMiles,
    task_minutes:durationMinutes,
    gross_hourly_usd:grossHourly,
    remote_or_virtual:isRemote,
    upfront_spend_required:upfrontSpend,
    normal_service_radius_miles:Number.isFinite(radius)?radius:null,
    outside_normal_radius:outsideRadius,
    transportation_mode_known:Boolean(profile?.vehicle_equipment),
    transportation_cost_required:needsTransportCost || (oneWayMiles!==null && oneWayMiles>0),
    net_value_usd:null,
    net_hourly_usd:null,
    rule:'NEVER_TREAT_GROSS_AS_NET'
  };
}

async function loadOwnerOpportunityProfile(supabase, ownEmail) {
  if (!ownEmail) return null;
  const { data, error } = await supabase.from('dd_provider_applications')
    .select('service_radius_miles,vehicle_equipment,willing_outside_radius,availability,physical_address,dispatch_location_verified_at')
    .ilike('contact_email', ownEmail)
    .order('submitted_at',{ascending:false})
    .limit(1)
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  return {
    service_radius_miles:data.service_radius_miles,
    vehicle_equipment:data.vehicle_equipment,
    willing_outside_radius:data.willing_outside_radius,
    availability:data.availability,
    has_private_dispatch_origin:Boolean(data.physical_address),
    dispatch_origin_verified_at:data.dispatch_location_verified_at||null
  };
}
function classifyMessage({ from, subject, body, labelIds, direction, ownerProfile }) {
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

  const monetizable=hasAny(text,[
    /pay offer/,/gift card/,/compensation/,/paid study/,/paid research/,/look available/,
    /signing request/,/hiring/,/job opening/,/independent contractor/,/bounty/,/cash back/,
    /refund/,/rebate/,/commission/,/payout/
  ]);
  const economics=monetizable ? scoreOpportunityEconomics({subject,body,profile:ownerProfile}) : null;
  if (economics && ['BLOCKED_UPFRONT_SPEND','BLOCKED_OUTSIDE_NORMAL_RADIUS'].includes(economics.state)) {
    priority='LOW';
    requiresAttention=false;
    reason=economics.reason;
  } else if (economics && economics.state==='NEEDS_ACTUAL_TRANSPORT_COST') {
    priority='NORMAL';
    requiresAttention=true;
    reason=economics.reason;
  }

  return {
    bucket,
    routing_label: ROUTING_LABELS[bucket] || ROUTING_LABELS.RESEARCH,
    priority,
    requires_attention: requiresAttention,
    attention_reason: reason,
    automated,
    classifier: 'gmail_reconciliation_v3_economics',
    source_label_ids: labelIds || [],
    monetizable_opportunity: monetizable,
    opportunity_economics: economics,
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

async function processMessage({ supabase, connection, accessToken, ownEmail, ownerProfile, item, processedLabelId }) {
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
  const classification = classifyMessage({ from, subject, body: excerpt, labelIds: message.labelIds || [], direction, ownerProfile });

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
  const ownerProfile = await loadOwnerOpportunityProfile(supabase, ownEmail);
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
      const result = await processMessage({ supabase, connection, accessToken, ownEmail, ownerProfile, item, processedLabelId });
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
