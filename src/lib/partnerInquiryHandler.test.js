import { handlePartnerInterest } from '../../api-handlers/partner-inquiry.js';

function fakeAdmin({ recentCount = 0, failInsert = false } = {}) {
  const writes = [];
  const from = (table) => {
    const q = {
      _table: table,
      select() { return q; }, eq() { return q; }, gte() { return q; }, order() { return q; },
      limit() { return Promise.resolve({ data: Array.from({ length: recentCount }, (_, i) => ({ id: `old-${i}` })), error: null }); },
      insert(row) {
        writes.push({ table, row });
        if (table === 'dd_partner_inquiries') {
          return { select: () => ({ single: () => Promise.resolve(failInsert ? { data: null, error: { message: 'boom' } } : { data: { id: 'inq-1' }, error: null }) }) };
        }
        return Promise.resolve({ error: null });
      },
    };
    return q;
  };
  return { admin: { from }, writes };
}

function fakeRes() {
  const res = { statusCode: 200, body: null, headers: {} };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}

const body = (overrides = {}) => ({
  name: 'Test Provider', email: 'provider@example.com', participationInterest: 'SERVICE_PROVIDER',
  interestAreas: ['CLEANING_HOME'], skillsAndEquipment: 'Residential cleaning, own car', contactConsent: true,
  attribution: { utm_source: 'instagram', utm_campaign: 'build-with-me', landing_path: '/build-with-me' }, ...overrides,
});

const run = async (reqBody, opts = {}, env = { NOTIFICATION_EMAIL: 'ops@example.com' }) => {
  const fake = fakeAdmin(opts);
  const res = fakeRes();
  await handlePartnerInterest({ method: 'POST', body: reqBody }, res, { adminClient: async () => fake.admin, env });
  return { res, writes: fake.writes };
};

describe('partner-inquiry handler (Build With Me interest)', () => {
  test('saves interest, queues an Owner HQ item and an operator email, and links providers onward', async () => {
    const { res, writes } = await run(body());
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, inquiryId: 'inq-1', nextStep: '/providers?utm_campaign=build-with-me&utm_source=instagram&audience=provider' }));
    expect(res.body.nextStepText).toMatch(/provider application/);
    expect(writes.map(w => w.table)).toEqual(['dd_partner_inquiries', 'dd_owner_attention_queue', 'dd_event_outbox', 'dd_event_outbox']);
    expect(writes[3].row).toEqual(expect.objectContaining({ event_key: 'partner-interest-ack:inq-1', channel: 'EMAIL' }));
    expect(writes[3].row.payload.to).toBe('provider@example.com');
    expect(writes[3].row.payload.text).toMatch(/does not create a job, contract, or guarantee/);
    expect(writes[3].row.payload.text).not.toMatch(/\n\n\n/);
    expect(writes[0].row).toEqual(expect.objectContaining({ source: 'BUILD_WITH_ME', participation_interest: 'SERVICE_PROVIDER', contact_consent: true }));
    expect(writes[1].row).toEqual(expect.objectContaining({ domain: 'PROVIDER_OPERATIONS', source_table: 'dd_partner_inquiries', source_record_id: 'inq-1' }));
    expect(writes[2].row).toEqual(expect.objectContaining({ event_key: 'partner-interest-operator-email:inq-1', channel: 'EMAIL' }));
    expect(writes[2].row.payload.to).toBe('ops@example.com');
  });

  test('non-provider interest gets no provider-application link', async () => {
    const { res } = await run(body({ participationInterest: 'MAKER_CREATOR' }));
    expect(res.body.nextStep).toBeNull();
  });

  test('missing consent is rejected and nothing is written', async () => {
    const { res, writes } = await run(body({ contactConsent: false }));
    expect(res.statusCode).toBe(400);
    expect(writes).toEqual([]);
  });

  test('honeypot submissions look successful but write nothing', async () => {
    const { res, writes } = await run(body({ website: 'http://spam.example' }));
    expect(res.statusCode).toBe(200);
    expect(writes).toEqual([]);
  });

  test('more than three submissions per email per day are absorbed without new rows', async () => {
    const { res, writes } = await run(body(), { recentCount: 3 });
    expect(res.body).toEqual(expect.objectContaining({ success: true, duplicate: true, inquiryId: 'old-0' }));
    expect(writes).toEqual([]);
  });

  test('a storage failure is reported, and no receipts are queued for an unsaved record', async () => {
    const { res, writes } = await run(body(), { failInsert: true });
    expect(res.statusCode).toBe(500);
    expect(writes.map(w => w.table)).toEqual(['dd_partner_inquiries']);
  });

  test('without NOTIFICATION_EMAIL the interest and Owner HQ item are still recorded', async () => {
    const { writes } = await run(body(), {}, {});
    expect(writes.map(w => w.table)).toEqual(['dd_partner_inquiries', 'dd_owner_attention_queue', 'dd_event_outbox']);
    expect(writes[2].row.event_key).toBe('partner-interest-ack:inq-1');
  });

  test('no acknowledgment is queued when the submitter is the operator inbox', async () => {
    const { writes } = await run(body({ email: 'ops@example.com' }));
    expect(writes.filter(w => w.row.event_key?.startsWith('partner-interest-ack')).length).toBe(0);
  });

  test('only POST is accepted', async () => {
    const res = fakeRes();
    await handlePartnerInterest({ method: 'GET' }, res, { adminClient: async () => null });
    expect(res.statusCode).toBe(405);
  });
});
