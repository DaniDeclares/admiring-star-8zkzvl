import { createClient } from '@supabase/supabase-js';
import { verifyAppointmentToken } from './_appointmentTokens.js';

// Public, unauthenticated endpoint behind the Confirm Appointment / Request a
// Change links in the customer confirmation email. Never exposes internal
// ids, SKUs, channel codes, agent/system names, or recalculated pricing --
// only the frozen scope/time/price already on the canonical job record.

function getServerClient() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is missing.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function ok(res, data) { return res.status(200).json({ success: true, ...data }); }
function fail(res, error, status = 400) { return res.status(status).json({ success: false, error }); }

function formatWhen(value) {
  if (!value) return 'To be confirmed';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
  }).format(new Date(value)) + ' ET';
}

async function loadAppointment(supabase, appointmentId, tokenHash) {
  const { data: appointment, error } = await supabase
    .from('dd_job_appointments')
    .select('id, job_id, starts_at, ends_at, appointment_status, confirmation_token_hash, confirmation_token_expires_at, customer_confirmed_at, change_requested_at')
    .eq('id', appointmentId)
    .maybeSingle();
  if (error) throw error;
  if (!appointment) return { error: 'not_found' };
  if (appointment.confirmation_token_hash !== tokenHash) return { error: 'invalid_token' };
  if (appointment.confirmation_token_expires_at && new Date(appointment.confirmation_token_expires_at) < new Date()) return { error: 'expired' };
  return { appointment };
}

export default async function handler(req, res) {
  const supabase = getServerClient();
  const token = req.method === 'GET' ? req.query?.token : req.body?.token;
  const verified = verifyAppointmentToken(token);
  if (!verified) return fail(res, 'This link is invalid or has expired. Call or text (470) 485-7173 and we will help directly.', 400);

  try {
    const { appointment, error: loadError } = await loadAppointment(supabase, verified.appointmentId, verified.tokenHash);
    if (loadError === 'expired') return fail(res, 'This link has expired. Call or text (470) 485-7173 and we will send a new one.', 410);
    if (loadError) return fail(res, 'This link is invalid. Call or text (470) 485-7173 and we will help directly.', 404);

    const { data: job } = await supabase.from('dd_jobs').select('id, job_title, location_address, scope_summary').eq('id', appointment.job_id).maybeSingle();
    const { data: saleRow } = await supabase.from('dd_sales_queue').select('quoted_amount').eq('job_id', appointment.job_id).maybeSingle();
    const { data: deposits } = await supabase.from('dd_payment_events').select('amount_received, payment_status, event_type').eq('job_id', appointment.job_id).order('created_at', { ascending: false });
    const depositEvent = (deposits || []).find(row => row.event_type === 'DEPOSIT_RECEIVED') || null;
    const totalAmount = saleRow?.quoted_amount != null ? Number(saleRow.quoted_amount) : null;
    const depositAmount = depositEvent ? Number(depositEvent.amount_received) : null;
    const depositCleared = depositEvent?.payment_status === 'succeeded' || depositEvent?.payment_status === 'cleared';

    const summary = {
      when: formatWhen(appointment.starts_at),
      address: job?.location_address || null,
      scope: job?.scope_summary || null,
      total: totalAmount,
      deposit: depositAmount != null ? { amount: depositAmount, status: depositCleared ? 'cleared' : 'pending' } : null,
      remainingBalance: totalAmount != null && depositAmount != null && depositCleared ? Number((totalAmount - depositAmount).toFixed(2)) : null,
      confirmed: Boolean(appointment.customer_confirmed_at),
      changeRequested: Boolean(appointment.change_requested_at),
    };

    if (req.method === 'GET') return ok(res, { appointment: summary });

    if (req.method === 'POST') {
      const action = String(req.body?.action || '').toLowerCase();
      if (action === 'confirm') {
        if (!appointment.customer_confirmed_at) {
          const { error: updateError } = await supabase.from('dd_job_appointments').update({ customer_confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', appointment.id);
          if (updateError) throw updateError;
        }
        return ok(res, { message: 'Thank you -- your appointment is confirmed.' });
      }
      if (action === 'request_change') {
        const message = String(req.body?.message || '').trim().slice(0, 2000);
        if (!message) return fail(res, 'Please describe what needs to change.');
        const { error: insertError } = await supabase.from('dd_appointment_change_requests').insert({ appointment_id: appointment.id, job_id: appointment.job_id, customer_message: message });
        if (insertError) throw insertError;
        const { error: updateError } = await supabase.from('dd_job_appointments').update({ change_requested_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', appointment.id);
        if (updateError) throw updateError;
        return ok(res, { message: 'Thanks -- we received your change request and will follow up directly.' });
      }
      return fail(res, 'Unrecognized action.');
    }

    return fail(res, 'Method not allowed', 405);
  } catch (error) {
    console.error('appointment-response failed:', error);
    return fail(res, 'Something went wrong on our end. Call or text (470) 485-7173 and we will help directly.', 500);
  }
}
