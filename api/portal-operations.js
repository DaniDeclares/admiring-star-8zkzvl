import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const STAFF_ROLES = ['admin', 'owner', 'staff_admin', 'staff'];

function ok(res, data) { return res.status(200).json({ success: true, ...data }); }
function fail(res, error, status = 400) { return res.status(status).json({ success: false, error }); }

async function getStaffSnapshot(supabase) {
  const [requests, jobs, appointments, providers, changes, evidence, payments] = await Promise.all([
    supabase.from('service_requests').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('dd_jobs').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('dd_job_appointments').select('*').order('starts_at', { ascending: true }).limit(50),
    supabase.from('dd_providers').select('*, dd_provider_organizations(name, vendor_type)').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_change_orders').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('dd_job_evidence').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('dd_payment_events').select('*').order('created_at', { ascending: false }).limit(50),
  ]);
  const errors = [requests, jobs, appointments, providers, changes, evidence, payments].filter(item => item.error);
  if (errors.length) throw errors[0].error;
  return { requests: requests.data || [], jobs: jobs.data || [], appointments: appointments.data || [], providers: providers.data || [], changes: changes.data || [], evidence: evidence.data || [], payments: payments.data || [] };
}

async function getProviderSnapshot(supabase, providerId) {
  if (!providerId) return { assignments: [], tasks: [], evidence: [] };
  const { data: assignments, error } = await supabase.from('dd_job_assignments').select('*, dd_jobs(*)').eq('provider_id', providerId).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  const jobIds = (assignments || []).map(row => row.job_id);
  if (!jobIds.length) return { assignments: [], tasks: [], evidence: [] };
  const [tasks, evidence] = await Promise.all([
    supabase.from('dd_job_tasks').select('*').in('job_id', jobIds).order('created_at', { ascending: true }),
    supabase.from('dd_job_evidence').select('*').in('job_id', jobIds).order('created_at', { ascending: false }),
  ]);
  if (tasks.error) throw tasks.error;
  if (evidence.error) throw evidence.error;
  return { assignments: assignments || [], tasks: tasks.data || [], evidence: evidence.data || [] };
}

async function getCustomerSnapshot(supabase, identity) {
  if (!identity.entity_id) return { requests: [], jobs: [], invoices: [], changes: [] };
  const { data: requests, error: requestError } = await supabase.from('service_requests').select('*').eq('lead_id', identity.entity_id).order('created_at', { ascending: false }).limit(100);
  if (requestError) throw requestError;
  const requestIds = (requests || []).map(row => row.id);
  if (!requestIds.length) return { requests: requests || [], jobs: [], invoices: [], changes: [] };
  const { data: jobs, error: jobsError } = await supabase.from('dd_jobs').select('*').in('service_request_id', requestIds).order('created_at', { ascending: false });
  if (jobsError) throw jobsError;
  const jobIds = (jobs || []).map(row => row.id);
  const [invoices, changes] = await Promise.all([
    jobIds.length ? supabase.from('dd_invoices').select('*').in('job_id', jobIds).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    jobIds.length ? supabase.from('dd_change_orders').select('*').in('job_id', jobIds).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
  ]);
  if (invoices.error) throw invoices.error;
  if (changes.error) throw changes.error;
  return { requests: requests || [], jobs: jobs || [], invoices: invoices.data || [], changes: changes.data || [] };
}

export default async function handler(req, res) {
  try {
    const context = await authenticatePortalRequest(req);
    if (context.error) return fail(res, context.error, context.status);

    if (req.method === 'GET') {
      if (context.isStaff) return ok(res, { role: context.role, ...await getStaffSnapshot(context.supabase) });
      if (context.role === 'provider') return ok(res, { role: context.role, ...await getProviderSnapshot(context.supabase, context.identity.entity_id) });
      return ok(res, { role: context.role, ...await getCustomerSnapshot(context.supabase, context.identity) });
    }

    if (req.method !== 'POST') return fail(res, 'Method not allowed', 405);
    const { action, ...payload } = req.body || {};

    if (action === 'assignment_response') {
      const guard = requireRole(context, ['provider']);
      if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const providerId = context.isStaff ? payload.providerId : context.identity.entity_id;
      const { assignmentId, decision, reason } = payload;
      if (!assignmentId || !['ACCEPT', 'REJECT'].includes(decision)) return fail(res, 'assignmentId and ACCEPT/REJECT are required.');
      const { data: assignment, error: fetchError } = await context.supabase.from('dd_job_assignments').select('*').eq('id', assignmentId).eq('provider_id', providerId).single();
      if (fetchError || !assignment) return fail(res, 'Assignment not found or unauthorized.', 404);
      if (assignment.assignment_status !== 'OFFERED') return fail(res, `Assignment is already ${assignment.assignment_status}.`, 409);
      const next = decision === 'ACCEPT'
        ? { assignment_status: 'ACCEPTED', accepted_at: new Date().toISOString() }
        : { assignment_status: 'REJECTED', rejected_at: new Date().toISOString(), rejection_reason: reason || null };
      const { error: updateError } = await context.supabase.from('dd_job_assignments').update(next).eq('id', assignmentId).eq('assignment_status', 'OFFERED');
      if (updateError) throw updateError;
      await context.supabase.from('dd_dispatch_events').insert({ job_id: assignment.job_id, actor_id: providerId, event_type: `PROVIDER_${decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'}`, description: `Provider ${decision === 'ACCEPT' ? 'accepted' : 'rejected'} assignment ${assignmentId}.`, metadata: { reason: reason || null } });
      if (decision === 'ACCEPT') await context.supabase.from('dd_jobs').update({ job_status: 'SCHEDULED', assigned_to: providerId }).eq('id', assignment.job_id);
      else await context.supabase.from('dd_jobs').update({ job_status: 'DISPATCH_REVIEW' }).eq('id', assignment.job_id);
      return ok(res, { assignmentStatus: next.assignment_status });
    }

    if (action === 'task_update') {
      const guard = requireRole(context, ['provider']);
      if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { taskId, status, note, evidenceRef } = payload;
      if (!taskId || !status) return fail(res, 'taskId and status are required.');
      const allowed = new Set(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'SKIPPED']);
      if (!allowed.has(status)) return fail(res, 'Unsupported task status.');
      const { data: task, error: taskError } = await context.supabase.from('dd_job_tasks').select('*, dd_jobs(assigned_to, job_status)').eq('id', taskId).single();
      if (taskError || !task) return fail(res, 'Task not found.', 404);
      if (!context.isStaff && String(task.dd_jobs?.assigned_to || '') !== String(context.identity.entity_id)) return fail(res, 'Task is not assigned to this provider.', 403);
      if (['BLOCKED', 'SKIPPED'].includes(status) && !note) return fail(res, 'A field note is required when blocking or skipping work.');
      if (status === 'COMPLETED' && task.evidence_required && !evidenceRef) return fail(res, 'Required evidence must be attached before completing this task.');
      const update = { status, notes: note || task.notes || null, updated_at: new Date().toISOString() };
      if (status === 'COMPLETED') update.completed_at = new Date().toISOString();
      if (evidenceRef) update.evidence_ref = evidenceRef;
      const { error } = await context.supabase.from('dd_job_tasks').update(update).eq('id', taskId);
      if (error) throw error;
      return ok(res, { taskStatus: status });
    }

    if (action === 'change_order_decision') {
      const guard = requireRole(context, ['customer', 'resident', 'property_manager', 'procurement']);
      if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { changeOrderId, decision, reason } = payload;
      if (!changeOrderId || !['APPROVED', 'REJECTED'].includes(decision)) return fail(res, 'changeOrderId and APPROVED/REJECTED are required.');
      const { data: changeOrder, error: fetchError } = await context.supabase.from('dd_change_orders').select('*').eq('id', changeOrderId).single();
      if (fetchError || !changeOrder) return fail(res, 'Change order not found.', 404);
      if (changeOrder.status !== 'PENDING_APPROVAL') return fail(res, `Change order is ${changeOrder.status}.`, 409);
      const update = decision === 'APPROVED' ? { status: 'APPROVED', approved_at: new Date().toISOString(), approval_reference: `PORTAL-${context.user.id}` } : { status: 'REJECTED', rejection_reason: reason || null };
      const { error } = await context.supabase.from('dd_change_orders').update(update).eq('id', changeOrderId).eq('status', 'PENDING_APPROVAL');
      if (error) throw error;
      return ok(res, { changeOrderStatus: decision });
    }

    if (action === 'completion_review') {
      const guard = requireRole(context, STAFF_ROLES);
      if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, decision, notes } = payload;
      if (!jobId || !['APPROVED', 'REJECTED'].includes(decision)) return fail(res, 'jobId and APPROVED/REJECTED are required.');
      const { error } = await context.supabase.from('dd_completion_reviews').insert({ job_id: jobId, reviewer_id: context.user.id, review_type: 'SUPERVISOR', status: decision, notes: notes || null, reviewed_at: new Date().toISOString() });
      if (error) throw error;
      if (decision === 'APPROVED') await context.supabase.from('dd_jobs').update({ job_status: 'COMPLETED' }).eq('id', jobId);
      return ok(res, { reviewStatus: decision });
    }

    if (action === 'create_evidence_upload') {
      const guard = requireRole(context, ['provider']);
      if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, fileName, contentType } = payload;
      if (!jobId || !fileName) return fail(res, 'jobId and fileName are required.');
      const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const actor = context.isStaff ? context.user.id : context.identity.entity_id;
      const path = `${jobId}/${actor}/${Date.now()}-${safeName}`;
      const { data, error } = await context.supabase.storage.from('dd-job-evidence').createSignedUploadUrl(path);
      if (error) throw error;
      return ok(res, { path, token: data.token, contentType: contentType || 'application/octet-stream' });
    }

    return fail(res, `Unknown portal action: ${action}`);
  } catch (error) {
    console.error('Portal operations error:', error);
    return fail(res, 'Operational request failed.', 500);
  }
}
