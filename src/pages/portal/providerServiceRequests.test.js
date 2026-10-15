import { submitProviderCapabilityRequests } from './providerServiceRequests.js';

const categories = [
  { capability_key: 'cleaning', label: 'Cleaning' },
  { capability_key: 'notary', label: 'Notary' },
];

const servicesForCategory = (category) => category.capability_key === 'cleaning'
  ? [{ id: 'service-1' }, { id: 'service-2' }]
  : [{ id: 'service-3' }];

test('submits every category through the existing governed portal action', async () => {
  const calls = [];
  const fetchImpl = jest.fn(async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body), authorization: options.headers.Authorization });
    return { ok: true, json: async () => ({ success: true }) };
  });

  await expect(submitProviderCapabilityRequests({
    categories,
    servicesForCategory,
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
    accessToken: 'token',
    fetchImpl,
  })).rejects.toThrow('No matching services');
  expect(fetchImpl).not.toHaveBeenCalled();
});
