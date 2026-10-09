import handler from './shopify-release-auth.js';
import { authenticatePortalRequest } from '../_portalAuth.js';

jest.mock('../_portalAuth.js', () => ({ authenticatePortalRequest: jest.fn() }));

const request = (method = 'GET') => ({ method, headers: {} });
function response() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
}
describe('Shopify release authentication safety', () => {
  const oldFetch = global.fetch;
  beforeEach(() => { jest.clearAllMocks(); });
  afterAll(() => { global.fetch = oldFetch; });

  it('rejects writes without contacting Shopify', async () => {
    global.fetch = jest.fn();
    const res = response();
    await handler(request('POST'), res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests without contacting Shopify', async () => {
    global.fetch = jest.fn();
    authenticatePortalRequest.mockResolvedValue({ error: 'Authentication required', status: 401 });
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects staff even when staff portal access exists', async () => {
    global.fetch = jest.fn();
    authenticatePortalRequest.mockResolvedValue({ role: 'staff_admin', isStaff: true });
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fails closed when the portal authentication service throws', async () => {
    global.fetch = jest.fn();
    authenticatePortalRequest.mockRejectedValue(new Error('database unavailable'));
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('does not contact Shopify when credentials are missing', async () => {
    global.fetch = jest.fn();
    authenticatePortalRequest.mockResolvedValue({ role: 'owner', governedRole: 'OWNER_OPERATOR' });
    const oldId = process.env.SHOPIFY_CLIENT_ID;
    const oldSecret = process.env.SHOPIFY_CLIENT_SECRET;
    try {
      delete process.env.SHOPIFY_CLIENT_ID;
      delete process.env.SHOPIFY_CLIENT_SECRET;
      const res = response();
      await handler(request(), res);
      expect(res.status).toHaveBeenCalledWith(503);
      expect(global.fetch).not.toHaveBeenCalled();
    } finally {
      if (oldId === undefined) delete process.env.SHOPIFY_CLIENT_ID;
      else process.env.SHOPIFY_CLIENT_ID = oldId;
      if (oldSecret === undefined) delete process.env.SHOPIFY_CLIENT_SECRET;
      else process.env.SHOPIFY_CLIENT_SECRET = oldSecret;
    }
  });

  it('requires governed OWNER_OPERATOR rather than role string alone', async () => {
    global.fetch = jest.fn();
    authenticatePortalRequest.mockResolvedValue({ role: 'owner', isStaff: true });
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });
  it('requires Shopify write_products and write_files before reporting ready', async () => {
    authenticatePortalRequest.mockResolvedValue({ role: 'owner', governedRole: 'OWNER_OPERATOR' });
    const oldId = process.env.SHOPIFY_CLIENT_ID;
    const oldSecret = process.env.SHOPIFY_CLIENT_SECRET;
    process.env.SHOPIFY_CLIENT_ID = 'test-id';
    process.env.SHOPIFY_CLIENT_SECRET = 'test-secret';
    try {
      global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'test-token' }) })
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({
          data: { shop: { myshopifyDomain: 'v0dqbe-j1.myshopify.com' },
            appInstallation: { accessScopes: [{ handle: 'write_products' }] } },
        }) });
      const res = response();
      await handler(request(), res);
      expect(res.status).toHaveBeenCalledWith(424);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'SHOPIFY_REQUIRED_SCOPES_MISSING', missingScopes: ['write_files'],
      }));
      expect(global.fetch).toHaveBeenCalledTimes(2);
    } finally {
      if (oldId === undefined) delete process.env.SHOPIFY_CLIENT_ID;
      else process.env.SHOPIFY_CLIENT_ID = oldId;
      if (oldSecret === undefined) delete process.env.SHOPIFY_CLIENT_SECRET;
      else process.env.SHOPIFY_CLIENT_SECRET = oldSecret;
    }
  });

  it('does not report success when Shopify returns invalid token JSON', async () => {
    authenticatePortalRequest.mockResolvedValue({ role: 'owner', governedRole: 'OWNER_OPERATOR' });
    const oldId = process.env.SHOPIFY_CLIENT_ID;
    const oldSecret = process.env.SHOPIFY_CLIENT_SECRET;
    process.env.SHOPIFY_CLIENT_ID = 'test-id';
    process.env.SHOPIFY_CLIENT_SECRET = 'test-secret';
    try {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => { throw new SyntaxError('invalid JSON'); },
      });
      const res = response();
      await handler(request(), res);
      expect(res.status).toHaveBeenCalledWith(424);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'SHOPIFY_TOKEN_MISSING' }));
      expect(global.fetch).toHaveBeenCalledTimes(1);
    } finally {
      if (oldId === undefined) delete process.env.SHOPIFY_CLIENT_ID;
      else process.env.SHOPIFY_CLIENT_ID = oldId;
      if (oldSecret === undefined) delete process.env.SHOPIFY_CLIENT_SECRET;
      else process.env.SHOPIFY_CLIENT_SECRET = oldSecret;
    }
  });

});
