import { submitProviderCapabilityRequests } from './providerServiceRequests.js';

const categories = [
  { category_key: 'CLEANING', capability_key: 'cleaning', label: 'Cleaning' },
  { category_key: 'NOTARY', capability_key: 'notary', label: 'Notary' },
];

const servicesForCategory = (category) => category.capability_key === 'cleaning'
  ? [{ id: 'service-1' }, { id: 'service-2' }]
  : [{ id: 'service-3' }];

test('submits explicitly selected services through the existing governed portal action', async () => {
  const calls = [];
  const fetchImpl = jest.fn(async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body), authorization: options.headers.Authorization });
    return { ok: true, json: async () => ({ success: true }) };
  });

  await expect(submitProviderCapabilityRequests({
    categories,
    servicesForCategory,
    selectedServiceIdsByCategory: { CLEANING: ['service-1', 'service-2'], NOTARY: ['service-3'] },
    accessToken: 'token',
    fetchImpl,
  })).resolves.toEqual({ submittedCount: 2 });

  expect(calls).toEqual([
    {
      url: '/api/portal-operations',
      authorization: 'Bearer token',
      body: {
        action: 'request_provider_capabilities',
        serviceIds: ['service-1', 'service-2'],
        capabilityKey: 'cleaning',
      },
    },
    {
      url: '/api/portal-operations',
      authorization: 'Bearer token',
      body: {
        action: 'request_provider_capabilities',
        serviceIds: ['service-3'],
        capabilityKey: 'notary',
      },
    },
  ]);
});

test('stops on the first failure and exposes partial progress without retrying', async () => {
  const fetchImpl = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    .mockResolvedValueOnce({ ok: false, json: async () => ({ success: false, error: 'Staff review service unavailable.' }) });

  await expect(submitProviderCapabilityRequests({
    categories,
    servicesForCategory,
    selectedServiceIdsByCategory: { CLEANING: ['service-1'], NOTARY: ['service-3'] },
    accessToken: 'token',
    fetchImpl,
  })).rejects.toMatchObject({
    message: 'Staff review service unavailable.',
    submittedCount: 1,
  });
  expect(fetchImpl).toHaveBeenCalledTimes(2);
});

test('fails closed before any request when the session or matching services are missing', async () => {
  const fetchImpl = jest.fn();
  await expect(submitProviderCapabilityRequests({
    categories,
    servicesForCategory,
    accessToken: '',
    fetchImpl,
  })).rejects.toThrow('provider session is unavailable');

  await expect(submitProviderCapabilityRequests({
    categories,
    servicesForCategory: () => [],
    selectedServiceIdsByCategory: {},
    accessToken: 'token',
    fetchImpl,
  })).rejects.toThrow('No matching services');
  expect(fetchImpl).not.toHaveBeenCalled();
});

test('submits only explicitly selected services, never the entire category', async () => {
  const fetchImpl = jest.fn(async () => ({ ok: true, json: async () => ({ success: true }) }));
  await submitProviderCapabilityRequests({
    categories: [{ ...categories[0], category_key: 'CLEANING' }],
    servicesForCategory,
    selectedServiceIdsByCategory: { CLEANING: ['service-2'] },
    accessToken: 'token',
    fetchImpl,
  });
  expect(JSON.parse(fetchImpl.mock.calls[0][1].body).serviceIds).toEqual(['service-2']);
});

test('rejects invalid per-category service selection without contacting API', async () => {
  const fetchImpl = jest.fn();
  await expect(submitProviderCapabilityRequests({
    categories: [{ ...categories[0], category_key: 'CLEANING' }],
    servicesForCategory,
    selectedServiceIdsByCategory: { CLEANING: ['service-3'] },
    accessToken: 'token',
    fetchImpl,
  })).rejects.toThrow('Invalid selected service');
  expect(fetchImpl).not.toHaveBeenCalled();
});

test('deduplicates repeated selected IDs before request', async () => {
  const fetchImpl = jest.fn(async () => ({ ok: true, json: async () => ({ success: true }) }));
  await submitProviderCapabilityRequests({
    categories: [{ ...categories[0], category_key: 'CLEANING' }],
    servicesForCategory,
    selectedServiceIdsByCategory: { CLEANING: ['service-1','service-1'] },
    accessToken: 'token',
    fetchImpl,
  });
  expect(JSON.parse(fetchImpl.mock.calls[0][1].body).serviceIds).toEqual(['service-1']);
});

test.each([undefined, null, [], 'all'])('missing or malformed selection input never expands a category (%p)', async (selectedServiceIdsByCategory) => {
  const fetchImpl = jest.fn();
  await expect(submitProviderCapabilityRequests({ categories, servicesForCategory, selectedServiceIdsByCategory, accessToken: 'token', fetchImpl })).rejects.toThrow('Select individual services');
  expect(fetchImpl).not.toHaveBeenCalled();
});

test('an absent category selection makes no request for that category', async () => {
  const fetchImpl = jest.fn(async () => ({ ok: true, json: async () => ({ success: true }) }));
  await submitProviderCapabilityRequests({ categories, servicesForCategory, selectedServiceIdsByCategory: { CLEANING: ['service-2'] }, accessToken: 'token', fetchImpl });
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  expect(JSON.parse(fetchImpl.mock.calls[0][1].body).serviceIds).toEqual(['service-2']);
});

test('invalid selection in a later category fails before any category is submitted', async () => {
  const fetchImpl = jest.fn();
  await expect(submitProviderCapabilityRequests({ categories, servicesForCategory, selectedServiceIdsByCategory: { CLEANING: ['service-1'], NOTARY: ['service-2'] }, accessToken: 'token', fetchImpl })).rejects.toThrow('Invalid selected service');
  expect(fetchImpl).not.toHaveBeenCalled();
});
