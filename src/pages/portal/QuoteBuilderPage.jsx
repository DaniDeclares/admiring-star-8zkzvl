import React, { useEffect, useMemo, useState } from 'react';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const CLIENT_TYPES = [
  ['regular_resident', 'Regular Resident'],
  ['apartment_resident', 'Apartment Resident'],
  ['property_manager', 'Property Management / Apartment'],
  ['realtor', 'Real Estate Office / Brokerage'],
  ['business', 'Business / Commercial'],
  ['government', 'Government / Institutional'],
];

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return <label style={{ display: 'grid', gap: 6, fontWeight: 700, color: '#3d2b30' }}><span style={{ fontSize: 13 }}>{label}</span><input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #decfae', background: '#fff' }} /></label>;
}

function SelectField({ label, value, onChange, options }) {
  return <label style={{ display: 'grid', gap: 6, fontWeight: 700, color: '#3d2b30' }}><span style={{ fontSize: 13 }}>{label}</span><select value={value ?? ''} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #decfae', background: '#fff' }}>{options.map(option => <option key={String(option)} value={String(option)}>{String(option).replace(/_/g, ' ')}</option>)}</select></label>;
}

function QuoteBuilder() {
  const [services, setServices] = useState([]);
  const [serviceSku, setServiceSku] = useState('');
  const [clientType, setClientType] = useState('business');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [timeline, setTimeline] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [answers, setAnswers] = useState({ quantity: 1, hours: 1, miles_one_way: 0, materials_cost: 0, pass_through_cost: 0, tax_rate_percent: 0, deposit_percent: 0, apply_standard_travel: false, rush: false });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { setError('Staff session required.'); setLoading(false); return; }
      const response = await fetch('/api/portal-quote-builder', { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } });
      const body = await response.json();
      if (!response.ok || !body.success) setError(body.error || 'Could not load the service catalog.');
      else { setServices(body.services || []); if (body.services?.[0]) setServiceSku(body.services[0].sku); }
      setLoading(false);
    })();
  }, []);

  const service = services.find(s => s.sku === serviceSku) || null;
  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter(s => `${s.name} ${s.sku} ${s.service_family || ''}`.toLowerCase().includes(q));
  }, [services, search]);

  const setAnswer = (key, value) => setAnswers(current => ({ ...current, [key]: value }));

  const buildQuote = async () => {
    setSaving(true); setError(''); setResult(null);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { setError('Staff session required.'); setSaving(false); return; }
    const response = await fetch('/api/portal-quote-builder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` },
      body: JSON.stringify({ serviceSku, clientType, clientName, clientPhone, clientEmail, organizationName, locationAddress, city, zipCode, timeline, requestedDate: requestedDate || null, clientNotes, internalNotes, answers }),
    });
    const body = await response.json();
    if (!response.ok || !body.success) setError(body.error || 'Estimate could not be created.'); else setResult(body);
    setSaving(false);
  };

  return <main style={{ minHeight: '100vh', background: '#fffaf1', color: '#302226', padding: '28px 18px 60px' }}>
    <div style={{ maxWidth: 1220, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 24 }}>
        <div><div style={{ fontSize: 12, letterSpacing: 2, fontWeight: 900, color: '#8b6b1f' }}>DANI DECLARES OPERATING SYSTEM</div><h1 style={{ margin: '5px 0', fontSize: 'clamp(30px,5vw,48px)', color: '#5a1624' }}>Quote Builder</h1><p style={{ margin: 0, maxWidth: 760, color: '#6d5b60' }}>Search the full service catalog, enter the customer's information once, apply the appropriate channel and modifiers, and save the estimate into the existing estimate ledger.</p></div>
        <div style={{ padding: 14, borderRadius: 14, border: '1px solid #dfcfaa', background: '#f7edd4', maxWidth: 330 }}><strong>Pricing boundary</strong><div style={{ marginTop: 5, fontSize: 13, lineHeight: 1.5 }}>Customer price comes from the catalog/rules. Provider payouts are never used as retail price inputs. Tax, pass-throughs and gated fulfillment remain reviewable.</div></div>
      </header>
      {error && <div style={{ marginBottom: 18, padding: 14, borderRadius: 12, background: '#fff0f0', border: '1px solid #e2b8b8', color: '#8a1d2d' }}>{error}</div>}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(320px,.9fr)', gap: 18 }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ background: '#fff', border: '1px solid #e2d6bf', borderRadius: 16, padding: 18 }}>
            <h2 style={{ marginTop: 0, color: '#5a1624' }}>1. Customer & channel</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
              <SelectField label="Customer relationship" value={clientType} onChange={setClientType} options={CLIENT_TYPES.map(x => x[0])} />
              <Field label="Customer name" value={clientName} onChange={setClientName} placeholder="Full name" />
              <Field label="Phone" value={clientPhone} onChange={setClientPhone} placeholder="(555) 555-5555" />
              <Field label="Email" value={clientEmail} onChange={setClientEmail} placeholder="name@company.com" />
              <Field label="Organization / property" value={organizationName} onChange={setOrganizationName} placeholder="Optional" />
              <Field label="City" value={city} onChange={setCity} placeholder="Georgia city" />
              <Field label="ZIP" value={zipCode} onChange={setZipCode} placeholder="30000" />
              <Field label="Requested date" value={requestedDate} onChange={setRequestedDate} type="date" />
            </div>
            <div style={{ marginTop: 12 }}><Field label="Service location" value={locationAddress} onChange={setLocationAddress} placeholder="Street address" /></div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2d6bf', borderRadius: 16, padding: 18 }}>
            <h2 style={{ marginTop: 0, color: '#5a1624' }}>2. Service</h2>
            <Field label="Search catalog" value={search} onChange={setSearch} placeholder="Search by service name or SKU" />
            <div style={{ marginTop: 12, display: 'grid', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
              {loading ? <div>Loading catalog…</div> : filteredServices.map(s => <button key={s.sku} onClick={() => { setServiceSku(s.sku); setResult(null); }} style={{ textAlign: 'left', borderRadius: 12, padding: 12, border: s.sku === serviceSku ? '2px solid #6b1f2b' : '1px solid #e3d6bd', background: s.sku === serviceSku ? '#fbf0d7' : '#fff', cursor: 'pointer' }}><strong style={{ color: '#5a1624' }}>{s.name}</strong><div style={{ fontSize: 12, color: '#7b686d', marginTop: 3 }}>{s.sku} · {s.service_family || 'Service'} · {s.publicPrice}</div></button>)}
            </div>
            {service && <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: '#f8f2e7' }}><strong>{service.name}</strong><div style={{ marginTop: 4, fontSize: 13 }}>{service.public_price_display || service.price_note || (service.starting_price != null ? `Starting at $${Number(service.starting_price).toFixed(2)}` : 'Quote required')}</div>{service.commercial_intent_status && <div style={{ marginTop: 5, fontSize: 12, color: '#6f5e62' }}>Catalog status: {service.commercial_intent_status}</div>}</div>}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2d6bf', borderRadius: 16, padding: 18 }}>
            <h2 style={{ marginTop: 0, color: '#5a1624' }}>3. Quote inputs & modifiers</h2>
            {service?.quoteQuestions?.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 16 }}>{service.quoteQuestions.map(q => <Field key={q.key} label={q.label} value={answers[q.key] ?? ''} onChange={value => setAnswer(q.key, value)} type={q.type === 'number' ? 'number' : 'text'} />)}</div> : <p style={{ color: '#6d5b60' }}>This service does not yet have service-specific questions. Use the standard pricing inputs below and note any scope details.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
              <Field label="Quantity / units" value={answers.quantity} onChange={v => setAnswer('quantity', v)} type="number" />
              <Field label="Hours" value={answers.hours} onChange={v => setAnswer('hours', v)} type="number" />
              <Field label="Miles one way" value={answers.miles_one_way} onChange={v => setAnswer('miles_one_way', v)} type="number" />
              <Field label="Materials cost" value={answers.materials_cost} onChange={v => setAnswer('materials_cost', v)} type="number" />
              <Field label="Pass-through cost" value={answers.pass_through_cost} onChange={v => setAnswer('pass_through_cost', v)} type="number" />
              <Field label="Tax rate %" value={answers.tax_rate_percent} onChange={v => setAnswer('tax_rate_percent', v)} type="number" />
              <Field label="Deposit %" value={answers.deposit_percent} onChange={v => setAnswer('deposit_percent', v)} type="number" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}><input type="checkbox" checked={Boolean(answers.apply_standard_travel)} onChange={e => setAnswer('apply_standard_travel', e.target.checked)} /> Apply standard travel rule</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}><input type="checkbox" checked={Boolean(answers.rush)} onChange={e => setAnswer('rush', e.target.checked)} /> 24-hour / rush (+25%)</label>
            </div>
            <div style={{ marginTop: 12, display: 'grid', gap: 12 }}><Field label="Timeline / urgency" value={timeline} onChange={setTimeline} placeholder="ASAP, this week, recurring, etc." /><label style={{ display: 'grid', gap: 6, fontWeight: 700 }}><span style={{ fontSize: 13 }}>Customer notes</span><textarea value={clientNotes} onChange={e => setClientNotes(e.target.value)} rows={3} style={{ borderRadius: 10, border: '1px solid #decfae', padding: 12 }} /></label><label style={{ display: 'grid', gap: 6, fontWeight: 700 }}><span style={{ fontSize: 13 }}>Internal notes</span><textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3} style={{ borderRadius: 10, border: '1px solid #decfae', padding: 12 }} /></label></div>
          </div>
        </div>

        <aside style={{ alignSelf: 'start', position: 'sticky', top: 18 }}><div style={{ background: '#5a1624', color: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 12px 30px rgba(55,20,28,.15)' }}><div style={{ fontSize: 12, letterSpacing: 1.5, fontWeight: 900, color: '#efce72' }}>ESTIMATE PREVIEW</div><h2 style={{ margin: '7px 0 14px' }}>{service?.name || 'Choose a service'}</h2><div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,.08)', marginBottom: 14 }}><div style={{ fontSize: 13, opacity: .8 }}>Customer-facing price guidance</div><strong style={{ fontSize: 22 }}>{service?.publicPrice || '—'}</strong></div>{result ? <><div style={{ display: 'grid', gap: 7, fontSize: 14 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Base</span><strong>${result.calculation.baseSubtotal.toFixed(2)}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Resident discount</span><strong>-${result.calculation.residentDiscount.toFixed(2)}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Travel</span><strong>${result.calculation.travelFee.toFixed(2)}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rush</span><strong>${result.calculation.rushFee.toFixed(2)}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Materials + sourcing</span><strong>${(result.calculation.materials + result.calculation.sourcingFee).toFixed(2)}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pass-through</span><strong>${result.calculation.passThrough.toFixed(2)}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax</span><strong>${result.calculation.tax.toFixed(2)}</strong></div><hr style={{ width: '100%', border: 0, borderTop: '1px solid rgba(255,255,255,.2)' }} /><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20 }}><span>Total</span><strong>${result.calculation.estimatedTotal.toFixed(2)}</strong></div></div><div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: result.calculation.needsReview ? '#6f4d18' : '#234c31' }}><strong>{result.calculation.needsReview ? 'Review before sending' : 'Ready estimate'}</strong><div style={{ marginTop: 3, fontSize: 12 }}>{result.calculation.reviewFlags.join(' · ') || 'No additional review flags.'}</div></div><div style={{ marginTop: 14, fontSize: 13 }}>Estimate {result.estimate.public_reference} saved as <strong>{result.estimate.estimate_status}</strong>.</div></> : <div style={{ color: '#f1e3e5', fontSize: 13, lineHeight: 1.55 }}>Build the quote to save a frozen estimate snapshot. Complex, variable, gated and tax-sensitive work remains reviewable before the customer is charged.</div>}<button disabled={saving || !serviceSku} onClick={buildQuote} style={{ width: '100%', marginTop: 18, padding: 13, borderRadius: 11, border: 0, background: '#efce72', color: '#35161d', fontWeight: 900, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Building estimate…' : 'Build & Save Estimate'}</button></div></aside>
      </section>
    </div>
  </main>;
}

export default function QuoteBuilderPage() { return <RequireStaffAuth><QuoteBuilder /></RequireStaffAuth>; }
