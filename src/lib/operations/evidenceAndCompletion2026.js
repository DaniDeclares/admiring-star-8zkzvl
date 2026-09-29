export const COMPLETION_REVIEW = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

const SUPERVISOR_CHANNELS = new Set(['B2B-APT', 'B2G']);

function required(value, name) {
  if (value === undefined || value === null || value === '') throw new Error(`${name}_REQUIRED`);
}

/** Records evidence metadata only; actual bytes remain in the configured storage layer. */
export async function recordJobEvidence({ prisma, jobId, taskId = null, providerId, evidenceType, storageUrl, fileMetadata = null }) {
  required(prisma, 'PRISMA');
  required(jobId, 'JOB_ID');
  required(providerId, 'PROVIDER_ID');
  required(evidenceType, 'EVIDENCE_TYPE');
  required(storageUrl, 'STORAGE_URL');

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      select id, assigned_to, job_status
      from public.dd_jobs
      where id = ${jobId}::uuid
      for update
    `;
    const job = rows[0];
    if (!job) throw new Error('JOB_NOT_FOUND');
    if (String(job.assigned_to || '') !== String(providerId)) throw new Error('EVIDENCE_PROVIDER_UNAUTHORIZED');
    if (String(job.job_status || '').toUpperCase() === 'CANCELLED') throw new Error('JOB_CANCELLED');

    if (taskId) {
      const tasks = await tx.$queryRaw`
        select id, job_id
        from public.dd_job_tasks
        where id = ${taskId}::uuid and job_id = ${jobId}::uuid
      `;
      if (!tasks[0]) throw new Error('EVIDENCE_TASK_NOT_FOUND');
    }

    const evidence = await tx.$queryRaw`
      insert into public.dd_job_evidence
        (job_id, task_id, provider_id, evidence_type, storage_url, file_metadata)
      values
        (${jobId}::uuid, ${taskId ? `${taskId}` : null}::uuid, ${providerId}::uuid,
         ${evidenceType}, ${storageUrl}, ${fileMetadata ? JSON.stringify(fileMetadata) : null}::jsonb)
      returning id, job_id, task_id, provider_id, evidence_type, storage_url, file_metadata, verification_status, created_at
    `;

    await tx.$executeRaw`
      insert into public.dd_task_events (job_id, task_id, actor_id, event_type, description, metadata)
      values (
        ${jobId}::uuid,
        ${taskId ? `${taskId}` : null}::uuid,
        ${providerId}::uuid,
        'JOB_EVIDENCE_RECORDED',
        'Field evidence metadata recorded for operational verification.',
        ${JSON.stringify({ evidenceId: evidence[0].id, evidenceType })}::jsonb
      )
    `;

    return evidence[0];
  });
}

/**
 * Determines whether the job requires an administrative/supervisor review.
 * B2B-APT and B2G require review; B2C can auto-verify after G6 task completion.
 * Other channels remain explicitly configurable rather than guessed.
 */
export function requiresSupervisorReview(channelType) {
  return SUPERVISOR_CHANNELS.has(String(channelType || '').trim().toUpperCase());
}

export async function verifyJobCompletion({ prisma, jobId, reviewerId = null, channelType, notes = null }) {
  required(prisma, 'PRISMA');
  required(jobId, 'JOB_ID');
  required(channelType, 'CHANNEL_TYPE');

  return prisma.$transaction(async (tx) => {
    const jobs = await tx.$queryRaw`
      select id, job_status, assigned_to
      from public.dd_jobs
      where id = ${jobId}::uuid
      for update
    `;
    const job = jobs[0];
    if (!job) throw new Error('JOB_NOT_FOUND');

    const incomplete = await tx.$queryRaw`
      select id, task_name, status
      from public.dd_job_tasks
      where job_id = ${jobId}::uuid
        and is_required = true
        and status <> 'COMPLETED'
      order by sort_order, task_name
    `;
    if (incomplete.length) throw new Error(`REQUIRED_TASKS_INCOMPLETE:${incomplete.map((task) => task.id).join(',')}`);

    const requiresReview = requiresSupervisorReview(channelType);
    if (requiresReview && !reviewerId) throw new Error('SUPERVISOR_REVIEW_REQUIRED');

    const status = requiresReview ? COMPLETION_REVIEW.APPROVED : COMPLETION_REVIEW.APPROVED;
    const review = await tx.$queryRaw`
      insert into public.dd_completion_reviews
        (job_id, reviewer_id, review_type, status, notes, reviewed_at)
      values
        (${jobId}::uuid, ${reviewerId ? `${reviewerId}` : null}::uuid,
         ${requiresReview ? 'SUPERVISOR_REVIEW' : 'AUTO_VERIFICATION'}, ${status}, ${notes}, now())
      returning id, job_id, reviewer_id, review_type, status, notes, reviewed_at
    `;

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
        ${reviewerId ? `${reviewerId}` : null}::uuid,
        'COMPLETION_VERIFIED',
        ${requiresReview ? 'Supervisor verified B2B-APT/B2G completion.' : 'B2C completion auto-verified after required task completion.'},
        ${JSON.stringify({ channelType, reviewId: review[0].id, requiredTasksVerified: true })}::jsonb
      )
    `;

    return { job: updated[0], review: review[0] };
  });
}
