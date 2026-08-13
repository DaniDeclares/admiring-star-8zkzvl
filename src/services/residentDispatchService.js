import { supabase } from '../lib/supabaseClient';

const TABLE = 'resident_dispatches';

function makeTicketCode() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `RC-${stamp}-${random}`;
}

export async function createResidentDispatch(payload = {}) {
  const row = {
    ticket_code: makeTicketCode(),
    resident_name: String(payload.residentName || '').trim() || 'Resident',
    unit: String(payload.unit || '').trim() || null,
    community: String(payload.community || '').trim() || null,
    phone: String(payload.phone || '').trim() || null,
    email: String(payload.email || '').trim() || null,
    payment_method: String(payload.paymentMethod || '').trim() || null,
    source: 'resident-concierge',
    priority: payload.priority || 'normal',
    status: 'new',
    items: payload.items || [],
    modifiers: payload.modifiers || [],
    totals: payload.totals || {},
    resident_note: String(payload.note || '').trim() || null,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('Resident dispatch creation failed:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data, ticketCode: data.ticket_code };
}

export async function listResidentDispatches({ status = 'all', limit = 100 } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data || [] };
}

export async function updateResidentDispatch(id, patch = {}) {
  const allowed = ['status', 'priority', 'assigned_to', 'scheduled_for', 'internal_notes'];
  const update = Object.fromEntries(
    Object.entries(patch).filter(([key, value]) => allowed.includes(key) && value !== undefined)
  );

  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
