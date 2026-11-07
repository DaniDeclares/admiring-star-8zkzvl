// Dedicated private Holiday 2026 interest intake. Never routes families into
// commercial leads, referral commissions, provider records or public tables.
import { normalizeHolidayInterest } from '../src/lib/holidayCommunityInterest.js';

async function bodyOf(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    if (req.body.length > 16384) throw new Error('TOO_LARGE');
    return JSON.parse(req.body || '{}');
  }
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length; if (size > 16384) throw new Error('TOO_LARGE');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}
async function defaultAdmin() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key, { auth:{ persistSession:false, autoRefreshToken:false } });
}
export default async function handler(req,res) { return handleHolidayCommunityInterest(req,res); }
export async function handleHolidayCommunityInterest(req, res, { adminClient=defaultAdmin }={}) {
  res.setHeader('Cache-Control','no-store');
  if(req.method !== 'POST') return res.status(405).json({ error:'Method not available.' });
  if(Number(req.headers?.['content-length'] || 0) > 16384) return res.status(413).json({ error:'Submission too large.' });
  let body;
  try { body = await bodyOf(req); } catch { return res.status(400).json({ error:'Could not read the submission.' }); }
  if(String(body?.website || '').trim()) return res.status(200).json({ success:true });
  const normalized = normalizeHolidayInterest(body);
  if(!normalized.ok) return res.status(400).json({ error:'Please review the required fields and contact consent.', errors:normalized.errors });
  let admin;
  try { admin = await adminClient(); } catch { admin = null; }
  if(!admin) return res.status(503).json({ error:'Online registration is unavailable. Please try again later.' });
  const record = normalized.record;
  const yesterday = new Date(Date.now()-24*60*60*1000).toISOString();
  const previous = await admin.from('dd_holiday_community_interests').select('id')
    .eq('email',record.email).eq('role',record.role).gte('created_at',yesterday)
    .order('created_at',{ascending:false}).limit(1);
  if(previous.error) return res.status(503).json({ error:'Online registration is unavailable. Please try again later.' });
  if(previous.data?.length) return res.status(200).json({ success:true }); // No record ID or existence signal for public email probing.
  const inserted = await admin.from('dd_holiday_community_interests').insert(record).select('id').single();
  if(inserted.error) { console.error('Holiday community interest persistence failed',inserted.error.code); return res.status(503).json({ error:'Your interest could not be saved. Please try again later.' }); }
  // Fail-safe owner receipt: failure is logged but never represented as delivered.
  const attention = await admin.from('dd_owner_attention_queue').insert({
    domain: 'COMMUNICATIONS',
    source_table:'dd_holiday_community_interests',
    source_record_id:inserted.data.id,
    reason:'New Holiday 2026 community interest — '+record.role+' / '+record.city,
    priority:'NORMAL',
    recommended_action:'Review privately. Do not promise family aid, award referral commissions, or authorize vendors/providers from this inquiry.',
    metadata:{ role:record.role, area:record.area, source:record.source, attribution:record.attribution },
  });
  if(attention.error) console.error('Holiday community owner attention enqueue failed',attention.error.code);
  return res.status(200).json({ success:true, inquiryId:inserted.data.id });
}
