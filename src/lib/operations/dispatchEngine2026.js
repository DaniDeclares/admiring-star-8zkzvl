export const DISPATCH_STATES = Object.freeze({
  CREATED: 'CREATED',
  DISPATCH_REVIEW: 'DISPATCH_REVIEW',
  ASSIGNMENT_OFFERED: 'ASSIGNMENT_OFFERED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

export const DISPATCH_ACTIONS = Object.freeze({
  MOVE_TO_REVIEW: 'MOVE_TO_REVIEW',
  OFFER_ASSIGNMENT: 'OFFER_ASSIGNMENT',
  PROVIDER_ACCEPT: 'PROVIDER_ACCEPT',
  PROVIDER_REJECT: 'PROVIDER_REJECT',
  START_JOB: 'START_JOB',
  COMPLETE_JOB: 'COMPLETE_JOB',
  CANCEL_ASSIGNMENT: 'CANCEL_ASSIGNMENT',
});

const TRANSITIONS = Object.freeze({
  [DISPATCH_STATES.CREATED]: {
    [DISPATCH_ACTIONS.MOVE_TO_REVIEW]: DISPATCH_STATES.DISPATCH_REVIEW,
  },
  [DISPATCH_STATES.DISPATCH_REVIEW]: {
    [DISPATCH_ACTIONS.OFFER_ASSIGNMENT]: DISPATCH_STATES.ASSIGNMENT_OFFERED,
  },
  [DISPATCH_STATES.ASSIGNMENT_OFFERED]: {
    [DISPATCH_ACTIONS.PROVIDER_ACCEPT]: DISPATCH_STATES.ACCEPTED,
    [DISPATCH_ACTIONS.PROVIDER_REJECT]: DISPATCH_STATES.REJECTED,
  },
  [DISPATCH_STATES.ACCEPTED]: {
    [DISPATCH_ACTIONS.START_JOB]: DISPATCH_STATES.IN_PROGRESS,
    [DISPATCH_ACTIONS.CANCEL_ASSIGNMENT]: DISPATCH_STATES.CANCELLED,
  },
  [DISPATCH_STATES.IN_PROGRESS]: {
    [DISPATCH_ACTIONS.COMPLETE_JOB]: DISPATCH_STATES.COMPLETED,
  },
});

export function nextDispatchState(currentState, action) {
  const next = TRANSITIONS[currentState]?.[action];
  if (!next) {
    throw new Error(`DISPATCH_STATE_VIOLATION:${currentState}:${action}`);
  }
  return next;
}

function assertUuid(value, fieldName) {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName}_REQUIRED`);
  }
}

/**
 * G4 intentionally accepts a Prisma client dependency rather than importing a
 * singleton. This keeps the engine transaction-safe and straightforward to test.
 * Provider eligibility is relational: active provider + authorized capability +
 * optional territory coverage. Pricing is never read or recalculated here.
 */
export async function moveJobToDispatchReview({ prisma, jobId, actorId = null }) {
  assertUuid(jobId, 'JOB_ID');

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      select id, job_status
      from public.dd_jobs
      where id = ${jobId}::uuid
      for update
    `;

    const job = rows[0];
    if (!job) throw new Error('JOB_NOT_FOUND');

    const current = String(job.job_status || 'new').toUpperCase();
    const source = current === DISPATCH_STATES.CREATED || current === 'NEW'
      ? DISPATCH_STATES.CREATED
      : current;
    const next = nextDispatchState(source, DISPATCH_ACTIONS.MOVE_TO_REVIEW);

    await tx.$executeRaw`
      update public.dd_jobs
      set job_status = ${next.toLowerCase()}, updated_at = now()
      where id = ${jobId}::uuid
    `;

    await tx.$executeRaw`
      insert into public.dd_dispatch_events (job_id, actor_id, event_type, description, metadata)
      values (${jobId}::uuid, ${actorId ? `${actorId}` : null}::uuid, 'DISPATCH_REVIEW_STARTED', 'Job moved to dispatch review.', ${JSON.stringify({ previousStatus: job.job_status, nextStatus: next })}::jsonb)
    `;

    return { jobId, previousStatus: job.job_status, status: next };
  });
}

export async function findEligibleProviders({ prisma, serviceLine, territoryId = null } = {}) {
  if (!serviceLine) throw new Error('SERVICE_LINE_REQUIRED');

  return prisma.$queryRaw`
    select distinct
      p.id,
      p.org_id,
      p.first_name,
      p.last_name,
      o.name as organization_name,
      o.vendor_type
    from public.dd_providers p
    join public.dd_provider_organizations o on o.id = p.org_id
    join public.dd_provider_capabilities c on c.provider_id = p.id
    where p.is_active = true
      and o.is_active = true
      and c.service_line = ${serviceLine}
      and c.is_authorized = true
      and (
        ${territoryId}::text is null
        or exists (
          select 1 from public.dd_provider_coverage pc
          where pc.provider_id = p.id
            and pc.territory_id = ${territoryId}
        )
      )
    order by o.name, p.last_name, p.first_name
  `;
}

export async function offerAssignment({
  prisma,
  jobId,
  providerId,
  serviceLine,
  territoryId = null,
  actorId = null,
  adminNotes = null,
  providerNotes = null,
} = {}) {
  assertUuid(jobId, 'JOB_ID');
  assertUuid(providerId, 'PROVIDER_ID');
  if (!serviceLine) throw new Error('SERVICE_LINE_REQUIRED');

  return prisma.$transaction(async (tx) => {
    const jobs = await tx.$queryRaw`
      select id, job_status, assigned_to
      from public.dd_jobs
      where id = ${jobId}::uuid
      for update
    `;
    const job = jobs[0];
    if (!job) throw new Error('JOB_NOT_FOUND');

    const current = String(job.job_status || '').toUpperCase();
    const normalizedCurrent = current === 'NEW' ? DISPATCH_STATES.CREATED : current;
    if (normalizedCurrent !== DISPATCH_STATES.DISPATCH_REVIEW) {
      throw new Error(`DISPATCH_STATE_VIOLATION:${normalizedCurrent}:OFFER_ASSIGNMENT`);
    }

    const eligible = await tx.$queryRaw`
      select p.id
      from public.dd_providers p
      join public.dd_provider_organizations o on o.id = p.org_id
      join public.dd_provider_capabilities c on c.provider_id = p.id
      where p.id = ${providerId}::uuid
        and p.is_active = true
        and o.is_active = true
        and c.service_line = ${serviceLine}
        and c.is_authorized = true
        and (
          ${territoryId}::text is null
          or exists (
            select 1 from public.dd_provider_coverage pc
            where pc.provider_id = p.id
              and pc.territory_id = ${territoryId}
          )
        )
      limit 1
    `;
    if (!eligible[0]) throw new Error('PROVIDER_NOT_ELIGIBLE');

    const existing = await tx.$queryRaw`
      select id
      from public.dd_job_assignments
      where job_id = ${jobId}::uuid
        and assignment_status = 'OFFERED'
      limit 1
    `;
    if (existing[0]) throw new Error('ACTIVE_ASSIGNMENT_OFFER_EXISTS');

    const assignmentRows = await tx.$queryRaw`
      insert into public.dd_job_assignments
        (job_id, provider_id, assignment_status, admin_notes, provider_notes)
      values
        (${jobId}::uuid, ${providerId}::uuid, 'OFFERED', ${adminNotes}, ${providerNotes})
      returning id, assignment_status, offered_at
    `;

    await tx.$executeRaw`
      insert into public.dd_dispatch_events (job_id, actor_id, event_type, description, metadata)
      values (
        ${jobId}::uuid,
        ${actorId ? `${actorId}` : null}::uuid,
        'ASSIGNMENT_OFFERED',
        'Assignment offered after admin dispatch review.',
        ${JSON.stringify({ providerId, serviceLine, territoryId, assignmentId: assignmentRows[0].id })}::jsonb
      )
    `;

    return assignmentRows[0];
  });
}

export async function handleProviderResponse({
  prisma,
  assignmentId,
  providerId,
  action,
  reason = null,
} = {}) {
  assertUuid(assignmentId, 'ASSIGNMENT_ID');
  assertUuid(providerId, 'PROVIDER_ID');

  if (!['ACCEPT', 'REJECT'].includes(action)) throw new Error('INVALID_PROVIDER_ACTION');

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      select a.id, a.job_id, a.provider_id, a.assignment_status, j.job_status
      from public.dd_job_assignments a
      join public.dd_jobs j on j.id = a.job_id
      where a.id = ${assignmentId}::uuid
      for update
    `;
    const assignment = rows[0];

    if (!assignment || String(assignment.provider_id) !== String(providerId)) {
      throw new Error('DISPATCH_UNAUTHORIZED');
    }
    if (assignment.assignment_status !== 'OFFERED') {
      throw new Error(`ASSIGNMENT_STATE_VIOLATION:${assignment.assignment_status}`);
    }

    const now = new Date();
    if (action === 'ACCEPT') {
      const jobCurrent = String(assignment.job_status || '').toUpperCase();
      if (jobCurrent !== DISPATCH_STATES.DISPATCH_REVIEW && jobCurrent !== DISPATCH_STATES.ASSIGNMENT_OFFERED) {
        throw new Error(`JOB_STATE_VIOLATION:${jobCurrent}:PROVIDER_ACCEPT`);
      }

      await tx.$executeRaw`
        update public.dd_job_assignments
        set assignment_status = 'ACCEPTED', accepted_at = ${now}, updated_at = now()
        where id = ${assignmentId}::uuid
      `;
      await tx.$executeRaw`
        update public.dd_jobs
        set job_status = 'scheduled', assigned_to = ${providerId}, updated_at = now()
        where id = ${assignment.job_id}::uuid
      `;
      await tx.$executeRaw`
        insert into public.dd_dispatch_events (job_id, actor_id, event_type, description, metadata)
        values (${assignment.job_id}::uuid, ${providerId}::uuid, 'PROVIDER_ACCEPTED', 'Provider accepted assignment; job scheduled.', ${JSON.stringify({ assignmentId })}::jsonb)
      `;
      return { assignmentId, jobId: assignment.job_id, status: DISPATCH_STATES.SCHEDULED };
    }

    await tx.$executeRaw`
      update public.dd_job_assignments
      set assignment_status = 'REJECTED', rejected_at = ${now}, rejection_reason = ${reason}, updated_at = now()
      where id = ${assignmentId}::uuid
    `;
    await tx.$executeRaw`
      update public.dd_jobs
      set job_status = 'dispatch_review', assigned_to = null, updated_at = now()
      where id = ${assignment.job_id}::uuid
    `;
    await tx.$executeRaw`
      insert into public.dd_dispatch_events (job_id, actor_id, event_type, description, metadata)
      values (${assignment.job_id}::uuid, ${providerId}::uuid, 'PROVIDER_REJECTED', 'Provider rejected assignment; job returned to dispatch review.', ${JSON.stringify({ assignmentId, reason })}::jsonb)
    `;

    return { assignmentId, jobId: assignment.job_id, status: DISPATCH_STATES.DISPATCH_REVIEW, reason };
  });
}
