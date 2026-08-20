import { supabase } from '../lib/supabaseClient.js';

const STAFF_ROLES = new Set(['admin', 'owner', 'staff_admin', 'staff']);

export const RESIDENT_DISPATCH_STATUSES = [
  'new',
  'confirmed',
  'in_progress',
  'ready',
  'completed',
  'cancelled',
];

export async function createResidentDispatch(payload) {
  const clean = {
    resident_name: String(payload.residentName || '').trim(),
    resident_email: payload.residentEmail ? String(payload.residentEmail).trim() : null,
    resident_phone: payload.residentPhone ? String(payload.residentPhone).trim() : null,
    property_name: payload.propertyName ? String(payload.propertyName).trim() : null,
    unit_label: payload.unitLabel ? String(payload.unitLabel).trim() : null,
    service_type: String(payload.serviceType || '').trim(),
    service_items: Array.isArray(payload.items) ? payload.items : [],
    quoted_total: Number.isFinite(Number(payload.quotedTotal)) ? Number(payload.quotedTotal) : null,
    pricing_channel: 'B2C',
    payment_method: payload.paymentMethod ? String(payload.paymentMethod).trim() : null,
    customer_notes: payload.notes ? String(payload.notes).trim() : null,
  };

  if (!clean.resident_name || !clean.service_type) {
    throw new Error('Resident name and service type are required.');
  }

  const { data, error } = await supabase
    .from('resident_dispatches')
    .insert(clean)
    .select('id, created_at, status')
    .single();

  if (error) throw error;
  return data;
}

export async function getResidentDispatches({ status = 'all' } = {}) {
  const { data, error } = await supabase
    .from('resident_dispatches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (status === 'all') return data || [];
  return (data || []).filter((row) => row.status === status);
}

export async function updateResidentDispatch(id, changes) {
  const allowed = {};
  if (RESIDENT_DISPATCH_STATUSES.includes(changes.status)) allowed.status = changes.status;
  if (['low', 'normal', 'high', 'urgent'].includes(changes.priority)) allowed.priority = changes.priority;
  if (Object.prototype.hasOwnProperty.call(changes, 'assigned_to')) allowed.assigned_to = changes.assigned_to || null;
  if (Object.prototype.hasOwnProperty.call(changes, 'internal_notes')) allowed.internal_notes = changes.internal_notes || null;

  if (!Object.keys(allowed).length) throw new Error('No supported dispatch changes supplied.');

  const { data, error } = await supabase
    .from('resident_dispatches')
    .update(allowed)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export function hasStaffRole(user) {
  return STAFF_ROLES.has(user?.app_metadata?.role);
}
