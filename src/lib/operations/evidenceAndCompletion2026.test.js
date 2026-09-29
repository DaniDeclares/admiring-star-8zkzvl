import {
  recordJobEvidence,
  requiresSupervisorReview,
  verifyJobCompletion,
} from './evidenceAndCompletion2026';

describe('G7 completion verification policy', () => {
  test('requires supervisor review for B2B-APT', () => {
    expect(requiresSupervisorReview('B2B-APT')).toBe(true);
  });

  test('requires supervisor review for B2G', () => {
    expect(requiresSupervisorReview('B2G')).toBe(true);
  });

  test('allows automatic verification policy for B2C', () => {
    expect(requiresSupervisorReview('B2C')).toBe(false);
  });

  test('does not guess an unlisted channel into supervisor review', () => {
    expect(requiresSupervisorReview('B2B-RE')).toBe(false);
  });
});

describe('canonical evidence authorization', () => {
  test('authorizes evidence through accepted job assignments rather than legacy assigned_to', async () => {
    const queryRaw = jest.fn()
      .mockResolvedValueOnce([{ id: '11111111-1111-1111-1111-111111111111', job_status: 'scheduled' }])
      .mockResolvedValueOnce([{ id: '22222222-2222-2222-2222-222222222222' }])
      .mockResolvedValueOnce([{
        id: '33333333-3333-3333-3333-333333333333',
        job_id: '11111111-1111-1111-1111-111111111111',
        provider_id: '44444444-4444-4444-4444-444444444444',
      }]);

    const tx = { $queryRaw: queryRaw, $executeRaw: jest.fn().mockResolvedValue(1) };
    const prisma = { $transaction: (fn) => fn(tx) };

    await recordJobEvidence({
      prisma,
      jobId: '11111111-1111-1111-1111-111111111111',
      providerId: '44444444-4444-4444-4444-444444444444',
      evidenceType: 'PHOTO',
      storageUrl: 'https://example.invalid/test.jpg',
    });

    const queries = queryRaw.mock.calls.map((call) => Array.from(call[0]).join(' ')).join('\n');
    expect(queries).toContain('dd_job_assignments');
    expect(queries).toContain('assignment_status');
  });
});

describe('canonical required-task completion state', () => {
  test('checks the database canonical done state before completion', async () => {
    const queryRaw = jest.fn()
      .mockResolvedValueOnce([{ id: '11111111-1111-1111-1111-111111111111', job_status: 'submitted' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{
        id: '55555555-5555-5555-5555-555555555555',
        job_id: '11111111-1111-1111-1111-111111111111',
        review_type: 'AUTO_VERIFICATION',
        status: 'APPROVED',
      }])
      .mockResolvedValueOnce([{
        id: '11111111-1111-1111-1111-111111111111',
        public_reference: 'DD-TEST',
        job_status: 'COMPLETED',
      }]);

    const tx = { $queryRaw: queryRaw, $executeRaw: jest.fn().mockResolvedValue(1) };
    const prisma = { $transaction: (fn) => fn(tx) };

    await verifyJobCompletion({
      prisma,
      jobId: '11111111-1111-1111-1111-111111111111',
      channelType: 'B2C',
    });

    const queries = queryRaw.mock.calls.map((call) => Array.from(call[0]).join(' ')).join('\n');
    expect(queries).toContain("lower(coalesce(status, '')) <> 'done'");
  });
});
