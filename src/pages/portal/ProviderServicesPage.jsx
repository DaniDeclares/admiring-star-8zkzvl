import React, { useEffect, useMemo, useRef, useState } from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, statusLabel, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import './PortalWorkspacePage.css';

// Lets an already-active provider add or remove services after signup instead
// of only ever picking from the onboarding wizard once (Thumbtack-style:
// start with one, add more whenever). Reuses the exact same category/service
// catalog and matching logic as the signup wizard in PortalAccessPage.jsx so
// "what counts as this category" never drifts between the two entry points.
// New selections are submitted for staff review, same as every other
// capability -- this page never marks anything AUTHORIZED itself.
export default function ProviderServicesPage() {
  const { session, snapshot, loading, error, message, load, act } = useProviderWorkspace();
  const [catalogServices, setCatalogServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [busy, setBusy] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [localMessage, setLocalMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const catalogFetchStarted = useRef(false);

  useEffect(() => {
    if (catalogFetchStarted.current) return;
    catalogFetchStarted.current = true;
    let cancelled = false;
    (async () => {
      const [servicesResult, categoriesResult] = await Promise.all([
        supabase.from('services').select('id, name, sku, division_id').neq('sku', 'DNI-12A-028').order('name'),
        supabase.from('dd_provider_capability_categories').select('*').order('display_order'),
      ]);
      if (cancelled) return;
      if (!servicesResult.error) setCatalogServices(servicesResult.data || []);
      if (!categoriesResult.error) setCategories(categoriesResult.data || []);
      setCatalogLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const servicesForCategory = (category) => {
    if (Array.isArray(category.canonical_service_ids) && category.canonical_service_ids.length > 0) {
      return catalogServices.filter(s => category.canonical_service_ids.includes(s.id));
    }
    if (Array.isArray(category.canonical_skus) && category.canonical_skus.length > 0) {
      return catalogServices.filter(s => category.canonical_skus.includes(s.sku));
    }
    return catalogServices.filter(s => s.division_id === category.division_id && (!category.canonical_sku_prefix || (s.sku || '').startsWith(`DNI-${category.canonical_sku_prefix}-`)));
  };

  const capabilities = useMemo(() => snapshot?.capabilities || [], [snapshot]);
  const application = snapshot?.application || null;
  const isApprovedProvider = application?.application_status === 'APPROVED';
  const isSignedProvider = application?.agreement_status === 'EXECUTED';
  const existingServiceIds = useMemo(() => new Set(capabilities.map(c => c.canonical_sku).filter(Boolean)), [capabilities]);
  const filteredServices = useMemo(() => capabilities.filter(item => `${item.capability_description || ''} ${item.canonical_sku || ''} ${item.authorization_status || ''}`.toLowerCase().includes(serviceSearch.trim().toLowerCase())), [capabilities, serviceSearch]);

  const toggleCategory = (categoryKey) => {
    setSelectedCategories(prev => { const next = { ...prev }; if (next[categoryKey]) delete next[categoryKey]; else next[categoryKey] = true; return next; });
  };

  const submit = async () => {
    const activeCategories = categories.filter(c => selectedCategories[c.category_key]);
    if (!activeCategories.length) { setLocalError('Select at least one service category to add.'); return; }
    setBusy(true); setLocalError(''); setLocalMessage('');
    try {
      for (const category of activeCategories) {
        const serviceIds = servicesForCategory(category).map(s => s.id);
        if (!serviceIds.length) continue;
        // eslint-disable-next-line no-await-in-loop
        await act('request_provider_capabilities', { serviceIds, capabilityKey: category.capability_key });
      }
      setSelectedCategories({});
      setLocalMessage('Your requested services were submitted for DANI DECLARES review.');
    } finally { setBusy(false); }
  };

  const removeCapability = async (capabilityId) => {
    if (!window.confirm('Remove this service from your account? You can request it again later.')) return;
    await act('remove_provider_capability', { capabilityId });
  };

  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;

  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>My Services</h1><p>Add services you'd like to offer, or remove ones you no longer want to do. New services are reviewed before they're marked authorized.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    <ProviderNav isApprovedProvider={isApprovedProvider} agreementSigned={isSignedProvider} />
    {(error || localError) && <div className="portal-alert" role="alert">{error || localError}</div>}
    {(message || localMessage) && <div className="portal-success" role="status">{message || localMessage}</div>}
    <section className="provider-services-summary" aria-label="Selected service summary">
      <div><strong>{capabilities.length}</strong><span>Saved services</span></div>
      <div><strong>{capabilities.filter(item => item.authorization_status === 'AUTHORIZED').length}</strong><span>Authorized</span></div>
      <div><strong>{capabilities.filter(item => item.authorization_status !== 'AUTHORIZED').length}</strong><span>Awaiting review or other status</span></div>
    </section>
    <Card title="Your saved services">
      <p className="portal-note">Search your saved services. All selections remain on file unless you explicitly remove one. DANI reviews authorization separately.</p>
      <label className="provider-search-label" htmlFor="provider-saved-service-search">Find a saved service</label>
      <input id="provider-saved-service-search" className="provider-service-search" type="search" placeholder="Search by service name, SKU or status" value={serviceSearch} onChange={event => { setServiceSearch(event.target.value); setVisibleCount(20); }} />
      <p className="provider-service-count" aria-live="polite">Showing {Math.min(visibleCount, filteredServices.length)} of {filteredServices.length} matching services</p>
      {filteredServices.length ? filteredServices.slice(0, visibleCount).map(item => <div className="portal-row provider-service-row" key={item.id}>
        <div><strong>{item.capability_description || item.canonical_sku}</strong><small>{item.canonical_sku ? `${item.canonical_sku} · ` : ''}{statusLabel(item.authorization_status)}</small></div>
        <button type="button" className="provider-remove-service" disabled={busy} onClick={() => removeCapability(item.id)}>Remove</button>
      </div>) : <Empty>{capabilities.length ? 'No saved services match your search.' : 'No services on file yet.'}</Empty>}
      {visibleCount < filteredServices.length && <button type="button" className="provider-show-more" onClick={() => setVisibleCount(count => count + 20)}>Show 20 more services</button>}
    </Card>
    <Card title="Request additional services">
      <p className="portal-note">Choose only categories you can actually perform. A category currently requests <strong>all services listed inside it</strong>; expand it to check the scope first. Requests are reviewed, not automatically approved.</p>
      {catalogLoading ? <p>Loading service catalog…</p> : <>
        <label className="provider-search-label" htmlFor="provider-category-search">Find a category</label>
        <input id="provider-category-search" className="provider-service-search" type="search" placeholder="Search available categories" value={catalogSearch} onChange={event => setCatalogSearch(event.target.value)} />
        <div className="provider-category-list">
          {categories.filter(c => !servicesForCategory(c).every(s => existingServiceIds.has(s.sku))).filter(category => `${category.label} ${category.description}`.toLowerCase().includes(catalogSearch.toLowerCase())).map(category => {
            const available = servicesForCategory(category).filter(item => !existingServiceIds.has(item.sku));
            const total = servicesForCategory(category).length;
            if (!available.length) return null;
            return <details className="provider-category" key={category.category_key}>
              <summary><span><strong>{category.label}</strong><small>{category.description} · {total} total services</small></span><span className="provider-category-count">{available.length} not selected</span></summary>
              <div className="provider-category-inside">
                <label className="provider-category-select"><input type="checkbox" checked={Boolean(selectedCategories[category.category_key])} onChange={() => toggleCategory(category.category_key)} /> Request this entire category for review</label>
                <p className="portal-note">Includes {total} services. Existing services are preserved; DANI will review the new request.</p>
                <ul>{servicesForCategory(category).map(service => <li key={service.id}>{service.name}{existingServiceIds.has(service.sku) ? ' · Already saved' : ''}</li>)}</ul>
              </div>
            </details>;
          })}
        </div>
        <button className="portal-primary" disabled={busy || !Object.values(selectedCategories).some(Boolean)} onClick={submit}>{busy ? 'Submitting…' : 'Submit selected categories for review'}</button>
      </>}
    </Card>
  </main>;
}
