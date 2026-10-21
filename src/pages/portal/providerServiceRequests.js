export async function submitProviderCapabilityRequests({
  categories,
  servicesForCategory,
  accessToken,
  fetchImpl = fetch,
  selectedServiceIdsByCategory = null,
}) {
  if (!accessToken) throw new Error('Your provider session is unavailable. Please sign in again.');
  if (!selectedServiceIdsByCategory || typeof selectedServiceIdsByCategory !== 'object' || Array.isArray(selectedServiceIdsByCategory)) {
    throw new Error('Select individual services before submitting.');
  }

  // Validate every category before the first external request. The existing API
  // still commits categories separately; this preflight does not claim DB atomicity.
  const requests = categories.map(category => {
    const validIds = new Set(servicesForCategory(category).map(service => service.id));
    const requested = selectedServiceIdsByCategory[category.category_key] ?? [];
    if (!Array.isArray(requested)) throw new Error('Invalid selected service list.');
    if (requested.some(id => !validIds.has(id))) throw new Error('Invalid selected service for category.');
    const serviceIds = [...new Set(requested)].filter(Boolean);
    if (serviceIds.length > 100) throw new Error('Choose no more than 100 services per category.');
    if (serviceIds.length && !String(category.capability_key || '').trim()) throw new Error('Service category is unavailable.');
    return { category, serviceIds };
  }).filter(request => request.serviceIds.length);
  if (!requests.length) throw new Error('No matching services were available to request.');

  let submittedCount = 0;
  for (const { category, serviceIds } of requests) {

    let response;
    let result = {};
    try {
      // Each category remains a separate governed request because capabilityKey
      // is part of the existing API contract. Never retry automatically.
      // eslint-disable-next-line no-await-in-loop
      response = await fetchImpl('/api/portal-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'request_provider_capabilities',
          serviceIds,
          capabilityKey: category.capability_key,
        }),
      });
      // eslint-disable-next-line no-await-in-loop
      result = await response.json().catch(() => ({}));
    } catch (error) {
      const failure = new Error(error?.message || `Could not submit ${category.label || 'service category'}.`);
      failure.submittedCount = submittedCount;
      throw failure;
    }

    if (!response.ok || !result.success) {
      const failure = new Error(result.error || `Could not submit ${category.label || 'service category'}.`);
      failure.submittedCount = submittedCount;
      throw failure;
    }
    submittedCount += 1;
  }

  if (!submittedCount) throw new Error('No matching services were available to request.');
  return { submittedCount };
}
