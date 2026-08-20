import {
  APPOINTMENT_STATES,
  findAvailableProviders,
  scheduleJobAppointment,
} from './schedulingEngine2026';

describe('G5 scheduling engine', () => {
  test('exposes operational appointment states without pricing states', () => {
    expect(APPOINTMENT_STATES).toEqual({
      SCHEDULED: 'SCHEDULED',
      CONFIRMED: 'CONFIRMED',
      IN_PROGRESS: 'IN_PROGRESS',
      COMPLETED: 'COMPLETED',
      CANCELLED: 'CANCELLED',
    });
  });

  test('rejects an invalid appointment range before touching persistence', async () => {
    const prisma = { $transaction: jest.fn() };

    await expect(scheduleJobAppointment({
      prisma,
      jobId: 'job-1',
      providerId: 'provider-1',
      startsAt: '2026-08-20T12:00:00-04:00',
      endsAt: '2026-08-20T11:00:00-04:00',
    })).rejects.toThrow('INVALID_APPOINTMENT_RANGE');

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test('requires a scheduling time window for availability lookup', async () => {
    await expect(findAvailableProviders({
      prisma: {},
      startsAt: 'not-a-date',
      endsAt: '2026-08-20T11:00:00-04:00',
    })).rejects.toThrow('INVALID_APPOINTMENT_RANGE');
  });
});
