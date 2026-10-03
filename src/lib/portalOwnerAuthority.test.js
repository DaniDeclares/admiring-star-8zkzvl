import { createClient } from '@supabase/supabase-js';
import { authenticatePortalRequest } from '../../api-handlers/_portalAuth.js';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

// A fake service-role client: one auth user, their governed role rows and portal identity.
function fakeClient({ user, governedRoles = [], identity = null }) {
  const table = name => {
    const rows = name === 'dd_portal_user_roles' ? governedRoles : identity ? [identity] : [];
    const q = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: rows[0] || null, error: null }), then: (ok, ko) => Promise.resolve({ data: rows, error: null }).then(ok, ko) };
    return q;
  };
  return { auth: { getUser: async () => (user ? { data: { user }, error: null } : { data: { user: null }, error: new Error('bad jwt') }) }, from: table };
}

const req = token => ({ headers: token ? { authorization: `Bearer ${token}` } : {} });

beforeEach(() => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
  process.env.SUPABASE_ANON_KEY = 'anon';
});

const withClient = setup => createClient.mockImplementation(() => fakeClient(setup));

describe('portal owner authority', () => {
  test('anonymous requests are denied', async () => {
    withClient({});
    expect((await authenticatePortalRequest(req())).status).toBe(401);
  });
  test('an invalid or signed-out session is denied', async () => {
    withClient({ user: null });
    expect((await authenticatePortalRequest(req('stale'))).status).toBe(401);
  });
  test('an OWNER_OPERATOR whose auth metadata says staff_admin resolves to owner', async () => {
    withClient({ user: { id: 'u1', app_metadata: { portal_role: 'staff_admin' } }, governedRoles: [{ role: 'OWNER_OPERATOR' }] });
    const ctx = await authenticatePortalRequest(req('t'));
    expect(ctx.role).toBe('owner');
    expect(ctx.governedRole).toBe('OWNER_OPERATOR');
    expect(ctx.isStaff).toBe(true);
  });
  test('staff metadata without the governed owner role stays staff, not owner', async () => {
    withClient({ user: { id: 'u2', app_metadata: { portal_role: 'staff_admin' } } });
    const ctx = await authenticatePortalRequest(req('t'));
    expect(ctx.role).toBe('staff_admin');
    expect(ctx.governedRole).toBeUndefined();
  });
  test('providers and customers keep their portal identity role', async () => {
    withClient({ user: { id: 'u3', app_metadata: {} }, identity: { portal_role: 'provider', entity_id: 'p1', is_active: true } });
    const provider = await authenticatePortalRequest(req('t'));
    expect(provider.role).toBe('provider');
    expect(provider.isStaff).toBe(false);
    withClient({ user: { id: 'u4', app_metadata: {} }, identity: { portal_role: 'customer', entity_id: 'l1', is_active: true } });
    expect((await authenticatePortalRequest(req('t'))).role).toBe('customer');
  });
  test('a signed-in account with no identity or role is denied', async () => {
    withClient({ user: { id: 'u5', app_metadata: {} } });
    expect((await authenticatePortalRequest(req('t'))).status).toBe(403);
  });
});
