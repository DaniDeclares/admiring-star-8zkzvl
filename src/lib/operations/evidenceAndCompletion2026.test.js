import { requiresSupervisorReview } from './evidenceAndCompletion2026';

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
