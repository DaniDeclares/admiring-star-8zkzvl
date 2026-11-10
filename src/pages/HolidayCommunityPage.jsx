import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { HOLIDAY_INTEREST_ROLES, HOLIDAY_INTEREST_AREAS, HOLIDAY_CONTACT_CONSENT } from '../lib/holidayCommunityInterest.js';

const attrKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
const approvedMissionFlyer = 'https://cdn.shopify.com/s/files/1/0763/0825/0763/files/DANI_Holiday_Mission_Contributor_Flyer_2026_Approved.png?v=1794112626';
const contributorCategories = [
  ['Home & Property Support', 'Cleaning, organizing, painting, and appropriately qualified repair services.'],
  ['Business & Creative Skills', 'Administrative support, printing, design, and technical assistance.'],
  ['Moving, Transportation & Supplies', 'Practical logistics support, household essentials, and materials.'],
  ['Volunteer & Community Support', 'Individual skills, team participation, and other useful contributions.'],
];
export default function HolidayCommunityPage() {
  const { search } = useLocation();
  const fromUrl = new URLSearchParams(search).get('role');
  const defaultRole = HOLIDAY_INTEREST_ROLES[fromUrl] ? fromUrl : '';

  const [form, setForm] = useState({ role:defaultRole, area:'', name:'', email:'', phone:'', city:'', organization:'', note:'', contactConsent:false, website:'' });
  const showContributorInvitation = !form.role || form.role === 'SPONSOR' || form.role === 'VOLUNTEER';
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
  const field = 'w-full rounded-xl border border-[color:var(--dd-border)] p-3.5 bg-[var(--dd-white)] text-[color:var(--dd-ink)] focus:outline-[color:var(--dd-burgundy)]';
  const label = 'block text-sm font-bold text-[color:var(--dd-burgundy-deep)] mb-2';
  return <div className="min-h-screen bg-[var(--dd-ivory)] text-[color:var(--dd-ink)]">
    <Helmet><title>The Holiday Mission — 2026 | DANI DECLARES</title><meta name="description" content="Privately express family or community support interest in DANI DECLARES Holiday 2026 mission in Metro Atlanta." /></Helmet>
    <section className="bg-[var(--dd-burgundy-deep)] text-white"><div className="max-w-3xl mx-auto px-5 py-14">
      <Link to="/connect" className="text-[color:var(--dd-gold-soft)] underline">All ways to connect</Link>
      <p className="mt-5 tracking-widest uppercase text-[color:var(--dd-gold-soft)] text-sm font-bold">DANI DECLARES LLC | THE HOLIDAY MISSION — 2026</p>
      <h1 style={{ color: "var(--dd-white)" }} className="mt-3 text-4xl md:text-5xl font-bold">{showContributorInvitation ? "Your Skills. Someone’s Next Step." : "Community Support & Opportunity"}</h1>
      <p className="mt-4 leading-7 text-[color:var(--dd-cream)]">We are seeking practical support for families and children experiencing homelessness, housing instability, or a transition into stable housing.</p>
    </div></section>
    <section className="max-w-3xl mx-auto px-5 pt-10">
      {showContributorInvitation && <div className="grid gap-7 md:grid-cols-2 items-start mb-9">
        <img src={approvedMissionFlyer} alt="Approved DANI DECLARES Holiday Mission 2026 contributor invitation flyer" className="rounded-2xl shadow-md w-full h-auto" />
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--dd-burgundy-deep)]">Local businesses &amp; community contributors wanted</h2>
          <p className="mt-3 leading-7">Businesses, organizations, and individuals can express interest in offering skills, services, volunteer time, or resources. These are possible contributions, not confirmed assignments.</p>
          <ul className="mt-4 space-y-3">{contributorCategories.map(([title, detail]) => <li key={title}><strong className="text-[color:var(--dd-burgundy-deep)]">{title}</strong><span className="block text-sm mt-1">{detail}</span></li>)}</ul>
          <p className="mt-5 leading-7">Prefer email? Contact <a href="mailto:vendors@danideclares.com?subject=Holiday%20Mission%20Contributor" className="font-bold underline break-all">vendors@danideclares.com</a> with your name or business, contribution, service area, and availability. Use subject: <strong>Holiday Mission Contributor</strong>.</p>
        </div>
      </div>}
      <div className="rounded-2xl border border-[color:var(--dd-border-gold)] bg-[var(--dd-cream)] p-5 text-sm leading-7">
        This is an expression of interest, not a confirmed assignment or a guarantee of assistance, volunteer placement, sponsorship, or tax-deductibility. No purchase is required. Participation depends on verified needs, available resources, and agreed arrangements. Please do not include children's names, street addresses, medical information, or documents.
      </div>
    </section>
    <section className="max-w-3xl mx-auto px-5 py-12">
      {state.done ? <div role="status" className="rounded-2xl border border-green-300 bg-[var(--dd-white)] p-8">
        <h2 className="text-2xl font-bold">Your interest was received.</h2>
        <p className="mt-3">This is an acknowledgment of interest, not an eligibility decision or confirmed commitment. DANI will use the contact method you supplied if follow-up is possible.</p>
        {state.id && <p className="mt-3 font-bold break-all">Reference: {state.id}</p>}
        <Link className="inline-block mt-6 underline text-[color:var(--dd-burgundy)]" to="/connect">Explore other ways to connect</Link>
      </div> : <form onSubmit={submit} className="bg-[var(--dd-white)] border border-[color:var(--dd-border-gold)] rounded-2xl shadow-sm p-6 sm:p-9 space-y-5">
        <h2 className="text-2xl font-bold text-[color:var(--dd-burgundy-deep)]">Register your interest</h2>
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
        <button disabled={state.saving} className="w-full rounded-xl bg-[var(--dd-burgundy)] text-white px-5 py-4 font-bold disabled:opacity-60">{state.saving ? 'Saving interest…' : 'Submit community interest'}</button>
        <p className="text-xs text-[color:var(--dd-muted)]">Your information is collected for this inquiry and is not a general marketing subscription. Read our <Link to="/privacy" className="underline">privacy policy</Link>.</p>
      </form>}
    </section>
  </div>;
}
