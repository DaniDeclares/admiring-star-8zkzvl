// Provider application capability selection.
//
// A category groups related services; ticking it no longer claims every service in the
// category's division (that silently produced a 173-service application on 2026-10-06).
// Applicants now tick the specific services they actually perform. Authorization remains
// server-owned: these are declarations only, reviewed by staff before any dispatch.

export function selectedServiceIds(selection) {
  return Array.isArray(selection?.serviceIds) ? selection.serviceIds : [];
}

export function toggleServiceInSelection(selection = {}, serviceId) {
  const current = selectedServiceIds(selection);
  const serviceIds = current.includes(serviceId) ? current.filter(id => id !== serviceId) : [...current, serviceId];
  return { ...selection, serviceIds };
}

// Only services the applicant explicitly ticked, inside categories that are still ticked.
export function explicitServiceEntries(categories, selectedCategories, servicesForCategory) {
  return (categories || [])
    .filter(category => selectedCategories?.[category.category_key]?.checked)
    .flatMap(category => {
      const chosen = new Set(selectedServiceIds(selectedCategories[category.category_key]));
      return servicesForCategory(category).filter(service => chosen.has(service.id)).map(service => ({ service, category }));
    });
}

// Categories that are ticked but have no services chosen -- the applicant must pick at
// least one or untick the category, so nothing is claimed by accident.
export function categoriesMissingServices(categories, selectedCategories, servicesForCategory) {
  return (categories || []).filter(category => {
    const selection = selectedCategories?.[category.category_key];
    if (!selection?.checked) return false;
    const available = new Set(servicesForCategory(category).map(service => service.id));
    return !selectedServiceIds(selection).some(id => available.has(id));
  });
}

export function filterServices(services, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return services;
  return services.filter(service => `${service.name || ''} ${service.sku || ''} ${service.service_family || ''}`.toLowerCase().includes(q));
}
