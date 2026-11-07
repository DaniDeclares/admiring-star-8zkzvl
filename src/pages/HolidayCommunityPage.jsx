import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { HOLIDAY_INTEREST_ROLES, HOLIDAY_INTEREST_AREAS, HOLIDAY_CONTACT_CONSENT } from '../lib/holidayCommunityInterest.js';

const attrKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
export default function HolidayCommunityPage() {
  const { search } = useLocation();
  const fromUrl = new URLSearchParams(search).get('role');
  const defaultRole = HOLIDAY_INTEREST_ROLES[fromUrl] ? fromUrl : '';
  const [form, setForm] = useState({ role:defaultRole, area:'', name:'', email:'', phone:'', city:'', organization:'', note:'', contactConsent:false, website:'' });
  const [state, setState] = useState({ saving:false, error:'', done:false, id:null });
  const attribution = useMemo(() => {
    const params = new URLSearchParams(search), out = {};
    for (const key of attrKeys) if (params.get(key)) out[key] = params.get(key).slice(0,120);
    out.utm_campaign ||= 'holiday-2026';
    return out;
  }, [search]);
  const set = (key, value) => setForm(f => ({ ...f, [key]:value }));
  async function submit(event) {
    event.preventDefault();
    if (state.saving) return;
    setState({ saving:true, error:'', done:false, id:null });
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/holiday-community-interest', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ ...form, attribution }), signal:controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Your interest was not saved.');
      setState({ saving:false, error:'', done:true, id:null });
    } catch (err) {
      setState({ saving:false, done:false, id:null, error:err.name === 'AbortError'
        ? 'We could not confirm your submission. Please try again.'
        : (err.message || 'Your interest was not saved. Please try again.') });
    } finally { window.clearTimeout(timer); }
  }
  const field = 'w-full rounded-xl border border-[#d9c6bd] p-3.5 bg-white text-[#30191e] focus:outline-[#6b1f2b]';
  const label = 'block text-sm font-bold text-[#5b2531] mb-2';
  return <main className="min-h-screen bg-[#fbf8f1] text-[#2e1720]">
    <Helmet><title>Holiday 2026 Community Interest | DANI DECLARES</title><meta name="description" content="Privately express family or community support interest in DANI DECLARES Holiday 2026 mission in Metro Atlanta." /></Helmet>
    <section className="bg-[#551524] text-white"><div className="max-w-3xl mx-auto px-5 py-14">
      <Link to="/connect" className="text-[#f1dba8] underline">All ways to connect</Link>
      <p className="mt-5 tracking-widest uppercase text-[#e6c67f] text-sm font-bold">DANI DECLARES • HOLIDAY 2026</p>
      <h1 style={{ color: "#FFFFFF" }} className="mt-3 text-4xl md:text-5xl font-bold">Community Support & Opportunity</h1>
      <p className="mt-4 leading-7 text-[#f5e7ea]">Help us understand local needs and offers of practical assistance for families experiencing homelessness, housing instability, or transitions to stable housing.</p>
    </div></section>
    <section className="max-w-3xl mx-auto px-5 py-12">
      <div className="rounded-2xl border border-[#d7b980] bg-[#fff7e8] p-5 mb-7 text-sm leading-7">Interest registration only. We cannot promise assistance, volunteer placement, sponsorship acceptance, or tax-deductibility. Do not include children’s names, personal addresses, medical details, or documents. No purchase is required.</div>
      {state.done ? <div role="status" className="rounded-2xl border border-green-300 bg-white p-8">
        <h2 className="text-2xl font-bold">Your interest was received.</h2>
        <p className="mt-3">This is an acknowledgment of interest, not an eligibility decision or confirmed commitment. DANI will use the contact method you supplied if follow-up is possible.</p>
        {state.id && <p className="mt-3 font-bold break-all">Reference: {state.id}</p>}
        <Link className="inline-block mt-6 underline text-[#6b1f2b]" to="/connect">Explore other ways to connect</Link>
      </div> : <form onSubmit={submit} className="bg-white border border-[#e5d6bf] rounded-2xl shadow-sm p-6 sm:p-9 space-y-5">
        <h2 className="text-2xl font-bold text-[#5b1624]">Register your interest</h2>
        {state.error && <div role="alert" className="bg-red-50 text-red-800 border border-red-200 rounded-xl p-4">{state.error}</div>}
        <div className="hidden" aria-hidden="true"><label>Leave this empty<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>set('website',e.target.value)}/></label></div>
        <div><label htmlFor="holiday-role" className={label}>I am contacting DANI as *</label>
          <select id="holiday-role" required className={field} value={form.role} onChange={e=>set('role',e.target.value)}>
            <option value="">Select one</option>{Object.entries(HOLIDAY_INTEREST_ROLES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select></div>
        <div><label htmlFor="holiday-area" className={label}>Area of interest or support *</label>
          <select id="holiday-area" required className={field} value={form.area} onChange={e=>set('area',e.target.value)}>
            <option value="">Select one</option>{Object.entries(HOLIDAY_INTEREST_AREAS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="holiday-name" className={label}>Your name *</label><input id="holiday-name" className={field} required maxLength={120} autoComplete="name" value={form.name} onChange={e=>set('name',e.target.value)}/></div>
          <div><label htmlFor="holiday-email" className={label}>Your email *</label><input id="holiday-email" type="email" className={field} required maxLength={254} autoComplete="email" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
          <div><label htmlFor="holiday-phone" className={label}>Phone (optional)</label><input id="holiday-phone" type="tel" className={field} maxLength={40} autoComplete="tel" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
          <div><label htmlFor="holiday-city" className={label}>City or general area *</label><input id="holiday-city" className={field} required maxLength={100} placeholder="e.g. Stone Mountain, GA" value={form.city} onChange={e=>set('city',e.target.value)}/></div>
        </div>
        <div><label htmlFor="holiday-organization" className={label}>Business or organization (optional)</label><input id="holiday-organization" className={field} maxLength={150} value={form.organization} onChange={e=>set('organization',e.target.value)} placeholder="Business, sponsor, nonprofit or group name"/></div>
        <div><label htmlFor="holiday-note" className={label}>Brief description (optional)</label>
          <textarea id="holiday-note" className={field} rows={3} maxLength={600} value={form.note} onChange={e=>set('note',e.target.value)} placeholder="Only general information about the assistance needed or resources you can offer. No private family details."/></div>
        <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" required checked={form.contactConsent} onChange={e=>set('contactConsent',e.target.checked)} className="mt-1"/><span>{HOLIDAY_CONTACT_CONSENT}</span></label>
        <button disabled={state.saving} className="w-full rounded-xl bg-[#6b1f2b] text-white px-5 py-4 font-bold disabled:opacity-60">{state.saving ? 'Saving interest…' : 'Submit community interest'}</button>
        <p className="text-xs text-[#716168]">Your information is collected for this inquiry and is not a general marketing subscription. Read our <Link to="/privacy" className="underline">privacy policy</Link>.</p>
      </form>}
    </section>
  </main>;
}
