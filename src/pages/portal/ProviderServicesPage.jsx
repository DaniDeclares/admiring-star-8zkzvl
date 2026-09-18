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
    <Card title="Current Services">
      {capabilities.length ? capabilities.map(item => <div className="portal-row" key={item.id}><div><strong>{item.capability_description || item.canonical_sku}</strong><small>{item.canonical_sku ? `${item.canonical_sku} · ` : ''}{statusLabel(item.authorization_status)}</small></div><button disabled={busy} onClick={() => removeCapability(item.id)}>Remove</button></div>) : <Empty>No services on file yet.</Empty>}
    </Card>
    <Card title="Add a Service">
      {catalogLoading ? <p>Loading service catalog…</p> : <>
        <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
          {categories.filter(c => !servicesForCategory(c).every(s => existingServiceIds.has(s.sku))).map(category => {
            const count = servicesForCategory(category).length;
            return <label key={category.category_key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10, border: '1px solid #eee', borderRadius: 8 }}>
              <input type="checkbox" checked={Boolean(selectedCategories[category.category_key])} onChange={() => toggleCategory(category.category_key)} />
              <span><strong>{category.label}</strong><br /><small style={{ color: '#666' }}>{category.description} · {count} service{count === 1 ? '' : 's'}</small></span>
            </label>;
          })}
        </div>
        <button className="portal-primary" disabled={busy} onClick={submit}>{busy ? 'Submitting…' : 'Submit for review'}</button>
      </>}
    </Card>
  </main>;
}
