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
});
