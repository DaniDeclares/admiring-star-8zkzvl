// Partner / "Build With Me" participation interest intake.
//
// Records interest only, in the existing dd_partner_inquiries table, then hands it to the
// existing owner surfaces: an OPEN item in dd_owner_attention_queue (Owner HQ "Danielle
// queue", domain PROVIDER_OPERATIONS) and an operator email intent in dd_event_outbox
// (delivered by /api/process-outbox). It never creates a provider, capability or job.
import { normalizeInterestSubmission, providerApplicationLink } from '../src/lib/buildWithMeInterest.js';

const MAX_PER_EMAIL_PER_DAY = 3;

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {};
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

const ERROR_TEXT = {
  NAME_REQUIRED: 'Please tell us your name.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  PHONE_INVALID: 'Please check the phone number.',
  PARTICIPATION_INTEREST_REQUIRED: 'Please choose how you would like to take part.',
  INTEREST_AREA_INVALID: 'Please choose from the listed areas.',
  SKILLS_REQUIRED: 'Please tell us what you bring: skills, equipment or experience.',
  CONSENT_REQUIRED: 'Please confirm we may contact you about your interest.',
};

export default async function handler(req, res) {
  return handlePartnerInterest(req, res);
}

async function defaultAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Exported for tests: the database client is injectable.
export async function handlePartnerInterest(req, res, { adminClient = defaultAdminClient, env = process.env } = {}) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'This action is not available.' });
  let body;
  try { body = await readBody(req); } catch { return res.status(400).json({ error: 'We could not read your submission.' }); }

  // Honeypot: real visitors never see or fill this field.
  if (String(body?.website || '').trim()) return res.status(200).json({ success: true });

  const normalized = normalizeInterestSubmission(body);
  if (!normalized.ok) {
    return res.status(400).json({ error: ERROR_TEXT[normalized.errors[0]] || 'Please check the form and try again.', errors: normalized.errors });
  }
  const record = normalized.record;
  const nextStep = record.participation_interest === 'SERVICE_PROVIDER' ? providerApplicationLink({ campaign_code: record.campaign_code, ...record.utm }) : null;

  const admin = await adminClient();
  if (!admin) return res.status(500).json({ error: 'Interest storage is unavailable right now. Please email vendors@danideclares.com.' });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent, error: recentError } = await admin.from('dd_partner_inquiries').select('id').eq('email', record.email).gte('created_at', since).order('created_at', { ascending: false }).limit(MAX_PER_EMAIL_PER_DAY);
  if (recentError) { console.error('Partner interest lookup failed', recentError.message); return res.status(500).json({ error: 'We could not save your interest right now. Please try again shortly.' }); }
  if ((recent || []).length >= MAX_PER_EMAIL_PER_DAY) {
    return res.status(200).json({ success: true, inquiryId: recent[0].id, duplicate: true, nextStep });
  }

  const { data, error } = await admin.from('dd_partner_inquiries').insert(record).select('id').single();
  if (error) { console.error('Partner interest persistence failed', error.message); return res.status(500).json({ error: 'We could not save your interest right now. Please try again shortly.' }); }

  // Owner-facing receipts. A failure here never loses the saved interest; it is logged and
  // the record remains in dd_partner_inquiries for recovery.
  const summary = `${record.interest_area}: ${record.name}${record.location_area ? ` (${record.location_area})` : ''}`;
  const attention = await admin.from('dd_owner_attention_queue').insert({
    domain: 'PROVIDER_OPERATIONS',
    source_table: 'dd_partner_inquiries',
    source_record_id: data.id,
    reason: `New Build With Me interest — ${summary}`.slice(0, 300),
    priority: 'NORMAL',
    recommended_action: 'Review interest. Invite service providers to the full provider application; reply to makers/partners. No work or income has been promised.',
    metadata: { source: record.source, campaign_code: record.campaign_code, participation_interest: record.participation_interest, interest_areas: record.interest_areas },
  });
  if (attention.error) console.error('Owner attention enqueue failed', attention.error.message);

  if (env.NOTIFICATION_EMAIL) {
    const text = [
      'New DANI DECLARES participation interest (interest only, not a verified provider)',
      `Name: ${record.name}`,
      `Email: ${record.email}`,
      `Phone: ${record.phone || 'not provided'}`,
      `Wants to take part as: ${record.interest_area}`,
      `Areas: ${record.interest_areas.join(', ') || 'not specified'}`,
      `Location: ${record.location_area || 'not provided'}`,
      `What they bring: ${record.skills_and_equipment}`,
      `Message: ${record.message || '—'}`,
      `Campaign: ${record.campaign_code || 'none'} ${Object.entries(record.utm).map(([k, v]) => `${k}=${v}`).join(' ')}`,
      `Consent recorded: ${record.consent_at}`,
      `Inquiry ID: ${data.id}`,
    ].join('\n');
    const outbox = await admin.from('dd_event_outbox').insert({
      event_key: `partner-interest-operator-email:${data.id}`,
      event_type: 'PARTNER_INTEREST_RECEIVED',
      channel: 'EMAIL',
      aggregate_type: 'PARTNER_INQUIRY',
      aggregate_id: data.id,
      payload: { to: env.NOTIFICATION_EMAIL, subject: `Build With Me interest — ${summary}`.slice(0, 180), text },
    });
    if (outbox.error) console.error('Partner interest notification enqueue failed', outbox.error.message);
  }

  return res.status(200).json({ success: true, inquiryId: data.id, nextStep });
}
