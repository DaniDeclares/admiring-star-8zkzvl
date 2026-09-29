export const TASK_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
  SKIPPED: 'SKIPPED',
});

function requireValue(value, field) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${field}_REQUIRED`);
  }
}

function normalizeChannel(channelType) {
  if (!channelType) return null;
  return String(channelType).trim().toUpperCase();
}

/**
 * Hydrates dd_job_tasks from the canonical operational template table.
 * Existing tasks are never duplicated. This layer consumes service/channel
 * context only for operational checklist selection and never reads pricing.
 */
export async function hydrateJobTasks({
  prisma,
  jobId,
  serviceId = null,
  channelType = null,
} = {}) {
  requireValue(prisma, 'PRISMA');
  requireValue(jobId, 'JOB_ID');

  const channel = normalizeChannel(channelType);

  return prisma.$transaction(async (tx) => {
    const jobs = await tx.$queryRaw`
      select id, service_request_id
      from public.dd_jobs
      where id = ${jobId}::uuid
      for update
    `;
    if (!jobs[0]) throw new Error('JOB_NOT_FOUND');

    const requestRows = jobs[0].service_request_id
      ? await tx.$queryRaw`
          select service_id, property_details
          from public.service_requests
          where id = ${jobs[0].service_request_id}::uuid
        `
      : [];

    const request = requestRows[0] || {};
    const resolvedServiceId = serviceId || request.service_id || null;
    const requestChannel = request.property_details?.channel_type || request.property_details?.channelType || null;
    const resolvedChannel = channel || normalizeChannel(requestChannel);

    const templates = await tx.$queryRaw`
      select id, task_type, task_name, is_required, evidence_required, sort_order, notes
      from public.dd_task_templates
      where is_active = true
        and (service_id is null or service_id = ${resolvedServiceId}::uuid)
        and (channel_type is null or channel_type = ${resolvedChannel})
      order by
        case when service_id is not null then 0 else 1 end,
        case when channel_type is not null then 0 else 1 end,
        sort_order,
        task_name
    `;

    if (!templates.length) {
      return { created: [], existing: [], channelType: resolvedChannel, serviceId: resolvedServiceId };
    }

    const existing = await tx.$queryRaw`
      select id, template_id, task_name, task_type, status, sort_order
      from public.dd_job_tasks
      where job_id = ${jobId}::uuid
    `;
    const existingTemplateIds = new Set(existing.filter((row) => row.template_id).map((row) => String(row.template_id)));
    const created = [];

    for (const template of templates) {
      if (existingTemplateIds.has(String(template.id))) continue;
      const rows = await tx.$queryRaw`
        insert into public.dd_job_tasks
          (job_id, template_id, task_name, task_type, status, sort_order, notes, is_required, evidence_required)
        values
          (${jobId}::uuid, ${template.id}::uuid, ${template.task_name}, ${template.task_type},
           'PENDING', ${template.sort_order}, ${template.notes}, ${template.is_required}, ${template.evidence_required})
        returning id, template_id, task_name, task_type, status, sort_order, is_required, evidence_required
      `;
      created.push(rows[0]);
    }

    if (created.length) {
      await tx.$executeRaw`
        insert into public.dd_task_events (job_id, actor_id, event_type, description, metadata)
        values (
          ${jobId}::uuid,
          null,
          'TASKS_HYDRATED',
          'Canonical field-execution checklist hydrated for job.',
          ${JSON.stringify({ channelType: resolvedChannel, serviceId: resolvedServiceId, createdTaskIds: created.map((row) => row.id) })}::jsonb
        )
      `;
    }

    return { created, existing, channelType: resolvedChannel, serviceId: resolvedServiceId };
  });
}

/**
 * Changes one task state. Completing/blocking/skipping a task leaves an audit
 * trail and never changes a commercial amount.
 */
export async function updateJobTask({
  prisma,
  taskId,
  actorId,
  status,
  note = null,
  evidenceRef = null,
} = {}) {
  requireValue(prisma, 'PRISMA');
  requireValue(taskId, 'TASK_ID');
  requireValue(actorId, 'ACTOR_ID');
  requireValue(status, 'STATUS');

  const nextStatus = String(status).toUpperCase();
  if (!Object.values(TASK_STATUSES).includes(nextStatus)) {
    throw new Error('INVALID_TASK_STATUS');
  }
  if ((nextStatus === TASK_STATUSES.BLOCKED || nextStatus === TASK_STATUSES.SKIPPED) && !note) {
    throw new Error('FIELD_NOTE_REQUIRED');
  }

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      select
        t.id,
        t.job_id,
        t.status,
        t.is_required,
        t.evidence_required,
        j.assigned_to,
        j.job_status
      from public.dd_job_tasks t
      join public.dd_jobs j on j.id = t.job_id
      where t.id = ${taskId}::uuid
      for update
    `;
    const task = rows[0];
    if (!task) throw new Error('TASK_NOT_FOUND');
    if (String(task.assigned_to || '') !== String(actorId)) throw new Error('TASK_ACTOR_UNAUTHORIZED');
    if (String(task.job_status || '').toUpperCase() === 'CANCELLED') throw new Error('JOB_CANCELLED');
    if (task.evidence_required && nextStatus === TASK_STATUSES.COMPLETED && !evidenceRef) {
      throw new Error('TASK_EVIDENCE_REQUIRED');
    }

    const updated = await tx.$queryRaw`
      update public.dd_job_tasks
      set status = ${nextStatus},
          notes = coalesce(${note}, notes),
          evidence_ref = coalesce(${evidenceRef}, evidence_ref),
          completed_at = case when ${nextStatus} = 'COMPLETED' then now() else completed_at end,
          completed_by = case when ${nextStatus} = 'COMPLETED' then ${actorId} else completed_by end,
          updated_at = now()
      where id = ${taskId}::uuid
      returning id, job_id, task_name, task_type, status, is_required, evidence_required, evidence_ref, completed_at, completed_by, notes
    `;

    await tx.$executeRaw`
      insert into public.dd_task_events (job_id, task_id, actor_id, event_type, description, metadata)
      values (
        ${task.job_id}::uuid,
        ${taskId}::uuid,
        ${actorId}::uuid,
        'TASK_STATUS_CHANGED',
        ${`Task ${taskId} changed to ${nextStatus}.`},
        ${JSON.stringify({ status: nextStatus, note, evidenceRef })}::jsonb
      )
    `;

    return updated[0];
  });
}

/**
 * Final job completion gate. Required tasks must be COMPLETED. Blocked or
 * skipped required work cannot silently close the job.
 */
export async function completeJobFromTasks({ prisma, jobId, actorId } = {}) {
  requireValue(prisma, 'PRISMA');
  requireValue(jobId, 'JOB_ID');
  requireValue(actorId, 'ACTOR_ID');

  return prisma.$transaction(async (tx) => {
    const jobs = await tx.$queryRaw`
      select id, assigned_to, job_status
      from public.dd_jobs
      where id = ${jobId}::uuid
      for update
    `;
    const job = jobs[0];
    if (!job) throw new Error('JOB_NOT_FOUND');
    if (String(job.assigned_to || '') !== String(actorId)) throw new Error('JOB_ACTOR_UNAUTHORIZED');

    const incomplete = await tx.$queryRaw`
      select id, task_name, status
      from public.dd_job_tasks
      where job_id = ${jobId}::uuid
        and is_required = true
        and status <> 'COMPLETED'
      order by sort_order, task_name
    `;
    if (incomplete.length) {
      throw new Error(`REQUIRED_TASKS_INCOMPLETE:${incomplete.map((task) => task.id).join(',')}`);
    }

    const updated = await tx.$queryRaw`
      update public.dd_jobs
      set job_status = 'COMPLETED', updated_at = now()
      where id = ${jobId}::uuid
      returning id, public_reference, job_status, updated_at
    `;

    await tx.$executeRaw`
      insert into public.dd_task_events (job_id, actor_id, event_type, description, metadata)
      values (
        ${jobId}::uuid,
        ${actorId}::uuid,
        'JOB_COMPLETED',
        'Job completed after all required field tasks passed the completion gate.',
        ${JSON.stringify({ requiredTasksVerified: true })}::jsonb
      )
    `;

    return updated[0];
  });
}
