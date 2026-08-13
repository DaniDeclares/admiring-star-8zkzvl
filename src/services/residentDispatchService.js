import { supabase } from '../lib/supabaseClient';

const TABLE = 'resident_dispatches';
const INTAKE_WEBHOOK = '/api/intake-webhook';

function makeTicketCode() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `RC-${stamp}-${random}`;
}

function buildIntakeDetails(payload, ticketCode) {
  const items = (payload.items || []).map((item) => {
    const lineTotal = Number(item.lineTotal ?? Number(item.price || 0) * Number(item.qty || 0));
    return `• ${item.qty || 0}x ${item.name || item.itemId || 'Service'}${item.variant ? ` [${item.variant}]` : ''} — $${lineTotal.toFixed(2)}`;
  });

  const modifiers = (payload.modifiers || []).map(
    (modifier) => `• ${modifier.label || 'Modifier'} — $${Number(modifier.amount || 0).toFixed(2)}`
  );

  return [
    `Resident Concierge Ticket: ${ticketCode}`,
    payload.unit ? `Unit: ${payload.unit}` : '',
    payload.community ? `Community / Property: ${payload.community}` : '',
    payload.paymentMethod ? `Payment Method: ${payload.paymentMethod}` : '',
    '',
    'ITEMS:',
    ...items,
    modifiers.length ? '' : null,
    modifiers.length ? 'MODIFIERS:' : null,
    ...modifiers,
    '',
    `Estimated Grand Total: $${Number(payload.totals?.grandTotal || 0).toFixed(2)}`,
    payload.note ? `Resident Note: ${payload.note}` : '',
  ].filter((line) => line !== null && line !== '').join('\n');
}

async function notifyOperationalIntake(payload, ticketCode) {
  try {
    const response = await fetch(INTAKE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.residentName,
        email: payload.email || '',
        phone: payload.phone || '',
        category: 'RESIDENT_CONCIERGE',
        serviceType: 'RESIDENT_CONCIERGE_DISPATCH',
        details: buildIntakeDetails(payload, ticketCode),
        ticketCode,
        source: 'resident-concierge',
      }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      // Preserve the stateful queue even if the webhook does not return JSON.
    }

    if (!response.ok || (data && data.success === false)) {
      return { success: false, error: data?.error || `Webhook returned HTTP ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Operational intake webhook failed.' };
  }
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

  const webhook = await notifyOperationalIntake(payload, data.ticket_code);

  return {
    success: true,
    data,
    ticketCode: data.ticket_code,
    webhookDelivered: webhook.success,
    webhookWarning: webhook.success ? null : webhook.error,
  };
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
