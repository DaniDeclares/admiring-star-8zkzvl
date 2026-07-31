// Defensive Supabase client for browser + server code
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  null;

const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  null;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Only create the client when both values are present. This prevents runtime
// errors in builds where env vars are intentionally omitted for local dev.
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * submitProjectIntake - defensive wrapper that returns a consistent error
 * if Supabase is not configured rather than throwing.
 */
export async function submitProjectIntake(requestData) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error:
        'Supabase is not configured in this environment. The request could not be stored.'
    };
  }

  const { name, email, phone, category, details, pathway, zipCode, urgency } =
    requestData || {};

  const cleanZip = String(zipCode || '').trim();
  if (cleanZip.length > 0 && cleanZip.length < 5) {
    return { success: false, error: 'Invalid ZIP code format' };
  }

  if (!name || (!email && !phone)) {
    return { success: false, error: 'Missing required contact information' };
  }

  try {
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([
        {
          name,
          email,
          phone,
          customer_channel: pathway || 'DIRECT',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (leadError) throw leadError;

    const publicId = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
    const { data: serviceReq, error: reqError } = await supabase
      .from('service_requests')
      .insert([
        {
          public_id: publicId,
          lead_id: lead.id,
          category,
          details,
          zip_code: cleanZip,
          urgency,
          status: 'NEW',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (reqError) throw reqError;

    return { success: true, publicId, leadId: lead.id, requestId: serviceReq.id };
  } catch (error) {
    console.error('Supabase Intake Error:', error);
    return { success: false, error: error?.message || String(error) };
  }
}
