import {
  TASK_STATUSES,
  completeJobFromTasks,
  hydrateJobTasks,
  updateJobTask,
} from './taskExecution2026';

describe('G6 field execution', () => {
  test('exposes execution-only task states', () => {
    expect(TASK_STATUSES).toEqual({
      PENDING: 'PENDING',
      IN_PROGRESS: 'IN_PROGRESS',
      COMPLETED: 'COMPLETED',
      BLOCKED: 'BLOCKED',
      SKIPPED: 'SKIPPED',
    });
  });

  test('hydrates no tasks when no canonical template matches', async () => {
    const tx = {
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce([{ id: 'job-1', service_request_id: null }])
        .mockResolvedValueOnce([]),
    };
    const prisma = {
      $transaction: jest.fn(async (fn) => fn(tx)),
    };

    const result = await hydrateJobTasks({
      prisma,
      jobId: 'job-1',
      channelType: 'B2C',
    });

    expect(result.created).toEqual([]);
    expect(result.existing).toEqual([]);
  });

  test('requires a field note when blocking or skipping a task', async () => {
    const prisma = { $transaction: jest.fn() };

    await expect(updateJobTask({
      prisma,
      taskId: 'task-1',
      actorId: 'provider-1',
      status: 'BLOCKED',
    })).rejects.toThrow('FIELD_NOTE_REQUIRED');

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test('requires evidence when a task template demands it', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValueOnce([{
        id: 'task-1',
        job_id: 'job-1',
        status: 'PENDING',
        is_required: true,
        evidence_required: true,
        assigned_to: 'provider-1',
        job_status: 'SCHEDULED',
      }]),
    };
    const prisma = {
      $transaction: jest.fn(async (fn) => fn(tx)),
    };

    await expect(updateJobTask({
      prisma,
      taskId: 'task-1',
      actorId: 'provider-1',
      status: 'COMPLETED',
    })).rejects.toThrow('TASK_EVIDENCE_REQUIRED');
  });

  test('refuses global completion while required tasks remain incomplete', async () => {
    const tx = {
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce([{
          id: 'job-1',
          assigned_to: 'provider-1',
          job_status: 'IN_PROGRESS',
        }])
        .mockResolvedValueOnce([{
          id: 'task-1',
          task_name: 'Take completion photos',
          status: 'PENDING',
        }]),
    };
    const prisma = {
      $transaction: jest.fn(async (fn) => fn(tx)),
    };

    await expect(completeJobFromTasks({
      prisma,
      jobId: 'job-1',
      actorId: 'provider-1',
    })).rejects.toThrow('REQUIRED_TASKS_INCOMPLETE:task-1');
  });
});
