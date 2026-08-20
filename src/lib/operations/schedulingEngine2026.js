export const APPOINTMENT_STATES = Object.freeze({
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

function assertRequired(value, field) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${field}_REQUIRED`);
  }
}

function assertDateRange(startsAt, endsAt) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end <= start) {
    throw new Error('INVALID_APPOINTMENT_RANGE');
  }
  return { start, end };
}

/**
 * Returns providers whose active recurring availability contains the requested
 * weekday/time and who do not already have a non-cancelled overlapping job.
 * Pricing is intentionally absent from this contract.
 */
export async function findAvailableProviders({
  prisma,
  startsAt,
  endsAt,
  territoryId = null,
} = {}) {
  assertRequired(prisma, 'PRISMA');
  const { start, end } = assertDateRange(startsAt, endsAt);

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
    join public.dd_provider_availability av on av.provider_id = p.id
    where p.is_active = true
      and o.is_active = true
      and av.is_active = true
      and av.weekday = extract(dow from ${start}::timestamptz)::smallint
      and av.start_time <= (${start}::timestamptz at time zone av.timezone)::time
      and av.end_time >= (${end}::timestamptz at time zone av.timezone)::time
      and (
        ${territoryId}::text is null
        or exists (
          select 1
          from public.dd_provider_coverage pc
          where pc.provider_id = p.id
            and pc.territory_id = ${territoryId}
        )
      )
      and not exists (
        select 1
        from public.dd_job_appointments ap
        where ap.provider_id = p.id
          and ap.appointment_status <> 'CANCELLED'
          and ap.starts_at < ${end.toISOString()}::timestamptz
          and ap.ends_at > ${start.toISOString()}::timestamptz
      )
    order by o.name, p.last_name, p.first_name
  `;
}

/**
 * Schedules an already-assigned job. This function only creates an operational
 * appointment. It never copies or recalculates customer pricing.
 */
export async function scheduleJobAppointment({
  prisma,
  jobId,
  providerId,
  startsAt,
  endsAt,
  timezone = 'America/New_York',
  createdBy = null,
  customerNotes = null,
  internalNotes = null,
} = {}) {
  assertRequired(prisma, 'PRISMA');
  assertRequired(jobId, 'JOB_ID');
  assertRequired(providerId, 'PROVIDER_ID');
  const { start, end } = assertDateRange(startsAt, endsAt);

  return prisma.$transaction(async (tx) => {
    const jobs = await tx.$queryRaw`
      select id, job_status, assigned_to
      from public.dd_jobs
      where id = ${jobId}::uuid
      for update
    `;
    const job = jobs[0];
    if (!job) throw new Error('JOB_NOT_FOUND');

    if (String(job.assigned_to || '') !== String(providerId)) {
      throw new Error('SCHEDULING_PROVIDER_MISMATCH');
    }

    const status = String(job.job_status || '').toUpperCase();
    if (status !== 'SCHEDULED') {
      throw new Error(`SCHEDULING_STATE_VIOLATION:${status}`);
    }

    const overlap = await tx.$queryRaw`
      select id
      from public.dd_job_appointments
      where provider_id = ${providerId}::uuid
        and appointment_status <> 'CANCELLED'
        and starts_at < ${end.toISOString()}::timestamptz
        and ends_at > ${start.toISOString()}::timestamptz
      limit 1
    `;
    if (overlap[0]) throw new Error('PROVIDER_TIME_CONFLICT');

    const availability = await tx.$queryRaw`
      select av.id
      from public.dd_provider_availability av
      where av.provider_id = ${providerId}::uuid
        and av.is_active = true
        and av.weekday = extract(dow from ${start.toISOString()}::timestamptz)::smallint
        and av.start_time <= (${start.toISOString()}::timestamptz at time zone av.timezone)::time
        and av.end_time >= (${end.toISOString()}::timestamptz at time zone av.timezone)::time
      limit 1
    `;
    if (!availability[0]) throw new Error('PROVIDER_OUTSIDE_AVAILABILITY');

    const rows = await tx.$queryRaw`
      insert into public.dd_job_appointments
        (job_id, provider_id, starts_at, ends_at, timezone, appointment_status, customer_notes, internal_notes, created_by)
      values
        (${jobId}::uuid, ${providerId}::uuid, ${start.toISOString()}::timestamptz, ${end.toISOString()}::timestamptz,
         ${timezone}, 'SCHEDULED', ${customerNotes}, ${internalNotes}, ${createdBy ? `${createdBy}` : null}::uuid)
      returning id, job_id, provider_id, starts_at, ends_at, timezone, appointment_status
    `;

    await tx.$executeRaw`
      insert into public.dd_dispatch_events
        (job_id, actor_id, event_type, description, metadata)
      values
        (${jobId}::uuid,
         ${createdBy ? `${createdBy}` : null}::uuid,
         'APPOINTMENT_SCHEDULED',
         'Provider appointment scheduled after assignment acceptance.',
         ${JSON.stringify({ appointmentId: rows[0].id, providerId, startsAt: start.toISOString(), endsAt: end.toISOString() })}::jsonb)
    `;

    return rows[0];
  });
}

export async function cancelJobAppointment({
  prisma,
  appointmentId,
  actorId = null,
  reason = null,
} = {}) {
  assertRequired(prisma, 'PRISMA');
  assertRequired(appointmentId, 'APPOINTMENT_ID');

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      select id, job_id, appointment_status
      from public.dd_job_appointments
      where id = ${appointmentId}::uuid
      for update
    `;
    const appointment = rows[0];
    if (!appointment) throw new Error('APPOINTMENT_NOT_FOUND');
    if (appointment.appointment_status === APPOINTMENT_STATES.CANCELLED) {
      return appointment;
    }

    await tx.$executeRaw`
      update public.dd_job_appointments
      set appointment_status = 'CANCELLED', updated_at = now()
      where id = ${appointmentId}::uuid
    `;

    await tx.$executeRaw`
      insert into public.dd_dispatch_events
        (job_id, actor_id, event_type, description, metadata)
      values
        (${appointment.job_id}::uuid,
         ${actorId ? `${actorId}` : null}::uuid,
         'APPOINTMENT_CANCELLED',
         'Scheduled appointment cancelled.',
         ${JSON.stringify({ appointmentId, reason })}::jsonb)
    `;

    return { ...appointment, appointment_status: APPOINTMENT_STATES.CANCELLED };
  });
}
