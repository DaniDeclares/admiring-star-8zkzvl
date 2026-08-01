// filename: src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ajxezpczaemunlcmqlgl.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Dual-Write Lead & Service Request Intake with Defensive Zip Coercion
 */
export async function submitProjectIntake(requestData) {
  const { name, email, phone, category, details, pathway, zipCode, urgency } = requestData || {};

  // Defensive Zip Code String Coercion
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
      .insert([{ name, email, phone, customer_channel: pathway || 'DIRECT', created_at: new Date().toISOString() }])
      .select()
      .single();

    if (leadError) throw leadError;

    const publicId = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
    const { data: serviceReq, error: reqError } = await supabase
      .from('service_requests')
      .insert([{ public_id: publicId, lead_id: lead.id, category, details, zip_code: cleanZip, urgency, status: 'NEW', created_at: new Date().toISOString() }])
      .select()
      .single();

    if (reqError) throw reqError;

    return { success: true, publicId, leadId: lead.id, requestId: serviceReq.id };
  } catch (error) {
    console.error('Supabase Intake Error:', error);
    return { success: false, error: error.message };
  }
}
