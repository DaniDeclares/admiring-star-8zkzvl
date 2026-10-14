// Handler-level authorization regression for GET /portal-operations?ownerDashboard=1.
// Lives under src/ because react-scripts only discovers tests there. Role resolution is covered in src/lib/portalOwnerAuthority.test.js; this proves the handler gate itself.
jest.mock('../../api-handlers/_portalAuth.js', () => ({ authenticatePortalRequest: jest.fn(), requireRole: jest.fn() }));
jest.mock('./serverSentry.js', () => ({ captureServerException: jest.fn(), flushServerSentry: jest.fn() }));
jest.mock('stripe', () => jest.fn());

import handler from '../../api-handlers/portal-operations.js';
import { authenticatePortalRequest } from '../../api-handlers/_portalAuth.js';

// Every table read resolves to empty data; each .from() records its table so the test can assert
// which data sources a role was allowed to touch.
function fakeSupabase(reads) {
  const chain = (table) => {
    const q = {
      select: () => q, eq: () => q, in: () => q, is: () => q, not: () => q, or: () => q, gte: () => q, lte: () => q,
      order: () => q, limit: () => q, range: () => q, contains: () => q, ilike: () => q, neq: () => q, lt: () => q, gt: () => q,
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve) => resolve({ data: [], error: null, count: 0 })
    };
    reads.push(table);
    return q;
  };
  return { from: chain, rpc: () => Promise.resolve({ data: null, error: null }) };
}
function call(context) {
  const reads = [];
  authenticatePortalRequest.mockResolvedValue({ ...context, supabase: fakeSupabase(reads) });
  const res = { statusCode: 0, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
  return handler({ method: 'GET', query: { ownerDashboard: '1' }, headers: {} }, res).then(() => ({ res, reads }));
}
const OWNER_ONLY_SOURCES = ['dd_autobuild_candidates', 'dd_promotion_candidates', 'dd_production_release_receipts'];
const base = { user: { id: 'u1' }, identity: { entity_id: 'e1', organization_id: 'o1' } };

describe('ownerDashboard handler authorization', () => {
  test('owner receives the owner snapshot including outcomePipeline', async () => {
    const { res } = await call({ ...base, role: 'owner', isStaff: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.ownerAccess).toBe(true);
    expect(res.body.outcomePipeline).toBeDefined();
  });
  test.each(['admin', 'staff', 'staff_admin'])('staff role %s is refused with 403 and reads no owner outcome sources', async (role) => {
    const { res, reads } = await call({ ...base, role, isStaff: true });
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Owner access required/);
    for (const t of OWNER_ONLY_SOURCES) expect(reads).not.toContain(t);
  });
  test.each(['provider', 'customer'])('%s never receives owner data even when asking for ownerDashboard', async (role) => {
    const { res, reads } = await call({ ...base, role, isStaff: false });
    expect(res.body?.ownerAccess).toBeUndefined();
    expect(res.body?.outcomePipeline).toBeUndefined();
    for (const t of OWNER_ONLY_SOURCES) expect(reads).not.toContain(t);
  });
  test('an unauthenticated request is refused', async () => {
    const { res } = await call({ error: 'Unauthorized', status: 401 });
    expect(res.statusCode).toBe(401);
  });
});
