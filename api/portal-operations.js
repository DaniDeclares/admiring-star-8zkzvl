import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const STAFF_ROLES = ['admin', 'owner', 'staff_admin', 'staff'];
function ok(res, data) { return res.status(200).json({ success: true, ...data }); }
function fail(res, error, status = 400) { return res.status(status).json({ success: false, error }); }

async function getStaffSnapshot(supabase) {
  const [requests, jobs, appointments, providers, changes, evidence, payments] = await Promise.all([
    supabase.from('service_requests').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_jobs').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_job_appointments').select('*').order('starts_at', { ascending: true }).limit(100),
    supabase.from('dd_providers').select('*, dd_provider_organizations(name, vendor_type)').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_change_orders').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_job_evidence').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_payment_events').select('*').order('created_at', { ascending: false }).limit(100),
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

async function createDispatchOffer(supabase, actorId, payload) {
  const { jobId, providerId, adminNotes, providerNotes } = payload;
  if (!jobId || !providerId) throw new Error('JOB_AND_PROVIDER_REQUIRED');
  const { data: job, error: jobError } = await supabase.from('dd_jobs').select('id, job_status').eq('id', jobId).single();
  if (jobError || !job) throw new Error('JOB_NOT_FOUND');
  if (!['NEW', 'CREATED', 'DISPATCH_REVIEW'].includes(String(job.job_status || '').toUpperCase())) throw new Error('JOB_NOT_READY_FOR_DISPATCH');
  const { data: provider, error: providerError } = await supabase.from('dd_providers').select('id, is_active').eq('id', providerId).single();
  if (providerError || !provider?.is_active) throw new Error('PROVIDER_NOT_ACTIVE');
  const { data: assignment, error } = await supabase.from('dd_job_assignments').insert({ job_id: jobId, provider_id: providerId, assignment_status: 'OFFERED', admin_notes: adminNotes || null, provider_notes: providerNotes || null }).select().single();
  if (error) throw error;
  await supabase.from('dd_jobs').update({ job_status: 'ASSIGNMENT_OFFERED' }).eq('id', jobId);
  await supabase.from('dd_dispatch_events').insert({ job_id: jobId, actor_id: actorId, event_type: 'ASSIGNMENT_OFFERED', description: `Assignment offered to provider ${providerId}.`, metadata: { assignmentId: assignment.id } });
  return assignment;
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

    if (action === 'dispatch_offer') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      return ok(res, { assignment: await createDispatchOffer(context.supabase, context.user.id, payload) });
    }

    if (action === 'schedule_appointment') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, providerId, startsAt, endsAt, customerNotes, internalNotes } = payload;
      if (!jobId || !providerId || !startsAt || !endsAt) return fail(res, 'jobId, providerId, startsAt and endsAt are required.');
      if (new Date(endsAt) <= new Date(startsAt)) return fail(res, 'Appointment end must be after start.');
      const { data: conflict } = await context.supabase.from('dd_job_appointments').select('id').eq('provider_id', providerId).neq('appointment_status', 'CANCELLED').lt('starts_at', endsAt).gt('ends_at', startsAt).limit(1);
      if (conflict?.length) return fail(res, 'Provider already has an overlapping appointment.', 409);
      const { data: appointment, error } = await context.supabase.from('dd_job_appointments').insert({ job_id: jobId, provider_id: providerId, starts_at: startsAt, ends_at: endsAt, customer_notes: customerNotes || null, internal_notes: internalNotes || null, created_by: context.user.id }).select().single();
      if (error) throw error;
      await context.supabase.from('dd_jobs').update({ job_status: 'SCHEDULED', scheduled_start: startsAt, scheduled_end: endsAt, assigned_to: providerId }).eq('id', jobId);
      return ok(res, { appointment });
    }

    if (action === 'assignment_response') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const providerId = context.isStaff ? payload.providerId : context.identity.entity_id;
      const { assignmentId, decision, reason } = payload;
      if (!assignmentId || !['ACCEPT', 'REJECT'].includes(decision)) return fail(res, 'assignmentId and ACCEPT/REJECT are required.');
      const { data: assignment, error: fetchError } = await context.supabase.from('dd_job_assignments').select('*').eq('id', assignmentId).eq('provider_id', providerId).single();
      if (fetchError || !assignment) return fail(res, 'Assignment not found or unauthorized.', 404);
      if (assignment.assignment_status !== 'OFFERED') return fail(res, `Assignment is already ${assignment.assignment_status}.`, 409);
      const next = decision === 'ACCEPT' ? { assignment_status: 'ACCEPTED', accepted_at: new Date().toISOString() } : { assignment_status: 'REJECTED', rejected_at: new Date().toISOString(), rejection_reason: reason || null };
      const { error: updateError } = await context.supabase.from('dd_job_assignments').update(next).eq('id', assignmentId).eq('assignment_status', 'OFFERED');
      if (updateError) throw updateError;
      await context.supabase.from('dd_dispatch_events').insert({ job_id: assignment.job_id, actor_id: providerId, event_type: `PROVIDER_${decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'}`, description: `Provider ${decision === 'ACCEPT' ? 'accepted' : 'rejected'} assignment ${assignmentId}.`, metadata: { reason: reason || null } });
      await context.supabase.from('dd_jobs').update({ job_status: decision === 'ACCEPT' ? 'SCHEDULED' : 'DISPATCH_REVIEW', assigned_to: decision === 'ACCEPT' ? providerId : null }).eq('id', assignment.job_id);
      return ok(res, { assignmentStatus: next.assignment_status });
    }

    if (action === 'task_update') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
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
      const { error } = await context.supabase.from('dd_job_tasks').update(update).eq('id', taskId); if (error) throw error;
      return ok(res, { taskStatus: status });
    }

    if (action === 'change_order_decision') {
      const guard = requireRole(context, ['customer', 'resident', 'property_manager', 'procurement']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { changeOrderId, decision, reason } = payload;
      if (!changeOrderId || !['APPROVED', 'REJECTED'].includes(decision)) return fail(res, 'changeOrderId and APPROVED/REJECTED are required.');
      const { data: changeOrder, error: fetchError } = await context.supabase.from('dd_change_orders').select('*').eq('id', changeOrderId).single();
      if (fetchError || !changeOrder) return fail(res, 'Change order not found.', 404);
      if (changeOrder.status !== 'PENDING_APPROVAL') return fail(res, `Change order is ${changeOrder.status}.`, 409);
      const update = decision === 'APPROVED' ? { status: 'APPROVED', approved_at: new Date().toISOString(), approval_reference: `PORTAL-${context.user.id}` } : { status: 'REJECTED', rejection_reason: reason || null };
      const { error } = await context.supabase.from('dd_change_orders').update(update).eq('id', changeOrderId).eq('status', 'PENDING_APPROVAL'); if (error) throw error;
      return ok(res, { changeOrderStatus: decision });
    }

    if (action === 'completion_review') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, decision, notes } = payload;
      if (!jobId || !['APPROVED', 'REJECTED'].includes(decision)) return fail(res, 'jobId and APPROVED/REJECTED are required.');
      const { error } = await context.supabase.from('dd_completion_reviews').insert({ job_id: jobId, reviewer_id: context.user.id, review_type: 'SUPERVISOR', status: decision, notes: notes || null, reviewed_at: new Date().toISOString() }); if (error) throw error;
      if (decision === 'APPROVED') await context.supabase.from('dd_jobs').update({ job_status: 'COMPLETED' }).eq('id', jobId);
      return ok(res, { reviewStatus: decision });
    }

    if (action === 'evidence_verify') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { evidenceId, decision } = payload;
      if (!evidenceId || !['VERIFIED', 'REJECTED'].includes(decision)) return fail(res, 'evidenceId and VERIFIED/REJECTED are required.');
      const { error } = await context.supabase.from('dd_job_evidence').update({ verification_status: decision, verified_by: context.user.id, verified_at: new Date().toISOString() }).eq('id', evidenceId); if (error) throw error;
      return ok(res, { evidenceStatus: decision });
    }

    if (action === 'create_evidence_upload') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, taskId, fileName, contentType, evidenceType = 'FIELD_PHOTO', fileMetadata = {} } = payload;
      if (!jobId || !fileName) return fail(res, 'jobId and fileName are required.');
      if (!context.isStaff) {
        const { data: job } = await context.supabase.from('dd_jobs').select('assigned_to').eq('id', jobId).single();
        if (!job || String(job.assigned_to || '') !== String(context.identity.entity_id)) return fail(res, 'Job is not assigned to this provider.', 403);
      }
      const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const actor = context.isStaff ? context.user.id : context.identity.entity_id;
      const path = `${jobId}/${actor}/${Date.now()}-${safeName}`;
      const { data, error } = await context.supabase.storage.from('dd-job-evidence').createSignedUploadUrl(path); if (error) throw error;
      return ok(res, { path, token: data.token, contentType: contentType || 'application/octet-stream', finalizePayload: { jobId, taskId: taskId || null, evidenceType, fileMetadata, storageUrl: path, providerId: actor } });
    }

    if (action === 'finalize_evidence') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, taskId, storageUrl, evidenceType = 'FIELD_PHOTO', fileMetadata = {} } = payload;
      if (!jobId || !storageUrl) return fail(res, 'jobId and storageUrl are required.');
      const providerId = context.isStaff ? payload.providerId : context.identity.entity_id;
      if (!providerId) return fail(res, 'Provider identity is required.');
      if (!context.isStaff) {
        const { data: job } = await context.supabase.from('dd_jobs').select('assigned_to').eq('id', jobId).single();
        if (!job || String(job.assigned_to || '') !== String(providerId)) return fail(res, 'Job is not assigned to this provider.', 403);
      }
      const { data: evidence, error } = await context.supabase.from('dd_job_evidence').insert({ job_id: jobId, task_id: taskId || null, provider_id: providerId, evidence_type: evidenceType, storage_url: storageUrl, file_metadata: fileMetadata }).select().single();
      if (error) throw error;
      return ok(res, { evidence });
    }

    return fail(res, `Unknown portal action: ${action}`);
  } catch (error) {
    console.error('Portal operations error:', error);
    return fail(res, 'Operational request failed.', 500);
  }
}
