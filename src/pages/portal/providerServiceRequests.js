export async function submitProviderCapabilityRequests({
  categories,
  servicesForCategory,
  accessToken,
  fetchImpl = fetch,
  selectedServiceIdsByCategory = null,
}) {
  if (!accessToken) throw new Error('Your provider session is unavailable. Please sign in again.');

  let submittedCount = 0;
  for (const category of categories) {
    const validIds = new Set(servicesForCategory(category).map(service => service.id));
    const requested = selectedServiceIdsByCategory ? selectedServiceIdsByCategory[category.category_key] || [] : [...validIds];
    if (requested.some(id => !validIds.has(id))) throw new Error('Invalid selected service for category.');
    const serviceIds = [...new Set(requested)].filter(Boolean);
    if (!serviceIds.length) continue;

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
