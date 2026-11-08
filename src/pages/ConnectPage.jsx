import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PATHS = [
  { title: 'Request a service', detail: 'Home, property, business, event or institutional work. Select the service and receive a governed quote or next step.', path: '/request-service', button: 'Request service' },
  { title: 'Family holiday support', detail: 'Express private interest in our developing Holiday 2026 mission for families navigating housing instability or transition.', path: '/holiday/community', button: 'Register family interest', role: 'FAMILY_SUPPORT' },
  { title: 'Help the holiday mission', detail: 'Businesses, organizations and individuals: offer supplies, services, volunteer time or connections. No purchase required.', path: '/holiday/community', button: 'Offer community support', role: 'SPONSOR' },
  { title: 'Community organization', detail: 'Connect with DANI about community needs, resource partners and appropriate assistance pathways.', path: '/holiday/community', button: 'Connect an organization', role: 'COMMUNITY_ORG' },
  { title: 'Volunteer skills or time', detail: 'Offer time, professional skills, coordination help or services toward our developing community mission.', path: '/holiday/community', button: 'Volunteer interest', role: 'VOLUNTEER' },
  { title: 'Refer clients or exchange leads', detail: 'Connect about reciprocal referrals and introductions. Any paid referral terms require separate agreement; no commission is promised here.', path: '/partner-network', button: 'Discuss referrals', participation: 'BUSINESS_PARTNER', focus: 'referrals' },
  { title: 'Become a business partner', detail: 'Explore collaboration, subcontracting, property relationships or joint opportunities with DANI.', path: '/partner-network', button: 'Explore partnership', participation: 'BUSINESS_PARTNER', focus: 'partnership' },
  { title: 'Vendor or supplier', detail: 'Introduce your company, available products, supplies or subcontractable business services for consideration.', path: '/partner-network', button: 'Introduce vendor capabilities', participation: 'BUSINESS_PARTNER', focus: 'vendor' },
  { title: 'Maker or creative partner', detail: 'Show us your printing, merchandise, marketing, production or other creative capabilities.', path: '/partner-network', button: 'Share creative capabilities', participation: 'MAKER_CREATOR' },
  { title: 'Independent service provider', detail: 'Apply through the existing provider system. Agreement, W-9, qualifications and authorization determine work eligibility.', path: '/providers', button: 'Start provider application', provider: true },
];
const ATTR = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
export function destinationFor(path, search, extra = {}) {
  const input = new URLSearchParams(search);
  const output = new URLSearchParams();
  ATTR.forEach(key => { if (input.get(key)) output.set(key, input.get(key).slice(0, 120)); });
  // Campaign attribution is evidence of the visitor's incoming source, never a default
  // inferred from passing through DANI's permanent Connect & Join gateway.
  for (const [key, value] of Object.entries(extra)) if (value) output.set(key, value);
  const query = output.toString();
  return query ? path + '?' + query : path;
}

const approvedMissionFlyer = 'https://cdn.shopify.com/s/files/1/0763/0825/0763/files/DANI_Holiday_Mission_Contributor_Flyer_2026_Approved.png?v=1794112626';
const intentFor = (item, search) => destinationFor(item.path, search, {
  role: item.role, participation: item.participation, focus: item.focus,
  ...(item.provider ? { audience: 'provider' } : {}),
});
const accentButton = 'inline-flex min-h-[46px] items-center justify-center gap-3 rounded-xl bg-[var(--dd-burgundy)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--dd-burgundy-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dd-burgundy)]';
function RouteCard({ item, search, compact = false, index }) {
  return <article className={`group flex h-full flex-col rounded-2xl border border-[var(--dd-border-gold)] bg-[var(--dd-white)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${compact ? 'p-5 sm:p-6' : 'p-6 md:p-8'}`}>
    {index != null && <span aria-hidden="true" className="mb-4 text-xs font-bold tracking-[.17em] text-[var(--dd-burgundy)]">{String(index).padStart(2, '0')}</span>}
    <h3 className={`font-bold tracking-tight text-[var(--dd-burgundy-deep)] ${compact ? 'text-xl' : 'text-2xl'}`}>{item.title}</h3>
    <p className="mt-3 mb-6 flex-1 text-sm leading-7 text-[var(--dd-muted)]">{item.detail}</p>
    <Link className={accentButton} to={intentFor(item, search)}>{item.button}<span aria-hidden="true">↗</span></Link>
  </article>;
}
function SectionTitle({ number, eyebrow, heading, description, id }) {
  return <div className="mb-7 flex flex-col gap-3 border-b border-[var(--dd-border-gold)] pb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
    <div>
      <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--dd-burgundy)]">{number} / {eyebrow}</p>
      <h2 id={id} className="mt-3 text-3xl font-bold tracking-tight text-[var(--dd-burgundy-deep)] sm:text-4xl">{heading}</h2>
    </div>
    <p className="max-w-md text-sm leading-7 text-[var(--dd-muted)]">{description}</p>
  </div>;
}

export default function ConnectPage() {
  const { search } = useLocation();
  return <main className="min-h-screen bg-[var(--dd-ivory)] text-[var(--dd-ink)]">
    <Helmet><title>Get Connected | DANI DECLARES LLC</title><meta name="description" content="Three easy ways to connect with DANI: request multi-service execution, join the Holiday Mission, or build a business relationship." /></Helmet>
    <header className="relative overflow-hidden bg-[var(--dd-burgundy-deep)] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-48 h-[480px] w-[480px] rounded-full border border-[var(--dd-gold-soft)] opacity-20 sm:right-16" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 h-[540px] w-[540px] rounded-full border border-[var(--dd-gold-soft)] opacity-10 sm:right-0" />
      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
        <p className="text-xs font-extrabold uppercase tracking-[.19em] text-[var(--dd-gold-soft)]">DANI DECLARES LLC <span aria-hidden="true">·</span> WE HANDLE THE EXECUTION</p>
        <div className="mt-7 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.72fr)] lg:gap-14">
          <div className="max-w-4xl">
            <h1 style={{color:'var(--dd-white)'}} className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">A clear place to start.<br /><span className="text-[var(--dd-gold-soft)]">Whatever brings you here.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--dd-cream)] sm:text-lg">Need work handled? Want to support our community mission? Interested in working with DANI? Choose the path that fits. We’ll keep each request in the right workflow.</p>
          </div>
          <figure className="relative m-0 max-w-lg lg:max-w-none">
            <div className="absolute -inset-2 rounded-[1.7rem] border border-[var(--dd-gold-soft)] opacity-50" aria-hidden="true" />
            <img src="/images/dani-batch/pexels-pavel-danilyuk-7937330.jpg" alt="Property professionals walking through a space together" className="relative h-52 w-full rounded-3xl object-cover object-center shadow-xl sm:h-64 lg:h-72" fetchPriority="high" />
            <figcaption className="sr-only">Photography represents the range of work DANI helps coordinate; it does not depict a specific completed client project.</figcaption>
          </figure>
        </div>
        <nav aria-label="Choose your starting point" className="mt-10 grid gap-3 sm:grid-cols-3">
          <a href="#get-work-handled" className="rounded-xl border border-white/25 bg-white/10 p-5 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dd-gold-soft)]"><span className="block text-[11px] font-bold uppercase tracking-[.18em] text-[var(--dd-gold-soft)]">01 · Services</span><span className="mt-2 flex items-center justify-between text-lg font-bold text-white">Get Work Handled <span aria-hidden="true">↘</span></span></a>
          <a href="#holiday-mission" className="rounded-xl border border-white/25 bg-white/10 p-5 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dd-gold-soft)]"><span className="block text-[11px] font-bold uppercase tracking-[.18em] text-[var(--dd-gold-soft)]">02 · Community</span><span className="mt-2 flex items-center justify-between text-lg font-bold text-white">Join the Holiday Mission <span aria-hidden="true">↘</span></span></a>
          <a href="#work-with-dani" className="rounded-xl border border-white/25 bg-white/10 p-5 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dd-gold-soft)]"><span className="block text-[11px] font-bold uppercase tracking-[.18em] text-[var(--dd-gold-soft)]">03 · Opportunities</span><span className="mt-2 flex items-center justify-between text-lg font-bold text-white">Work With DANI <span aria-hidden="true">↘</span></span></a>
        </nav>
      </div>
    </header>

    <section id="get-work-handled" aria-labelledby="get-work-title" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 sm:px-8 sm:py-20">
      <SectionTitle id="get-work-title" number="01" eyebrow="For customers" heading="Get Work Handled" description="From home and property needs to business, real estate, events and institutional work: start with the outcome, not an internal service category." />
      <div className="grid overflow-hidden rounded-3xl border border-[var(--dd-border-gold)] bg-[var(--dd-white)] shadow-sm md:grid-cols-[minmax(0,1.4fr)_minmax(280px,.8fr)]">
        <div className="p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--dd-burgundy)]">One request · Multiple service areas</p>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-[var(--dd-burgundy-deep)] sm:text-4xl">Tell us what you need handled.</h3>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--dd-muted)]">{PATHS[0].detail}</p>
          <Link to={intentFor(PATHS[0], search)} className={`${accentButton} mt-8`}>Request service <span aria-hidden="true">↗</span></Link>
        </div>
        <aside aria-label="Examples of supported customer needs" className="flex flex-col justify-center gap-5 bg-[var(--dd-cream)] p-7 sm:p-9">
          <img src="/images/dani-batch/pexels-rdne-8293769.jpg" alt="Field professional documenting a property condition" className="h-44 w-full rounded-2xl object-cover object-center" loading="lazy" />
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--dd-burgundy)]">Across life's moving parts</p>
          {['Home & resident support','Property & real estate operations','Business & administrative support','Events, print & production','Government & institutional requests'].map((label, i) => <div key={label} className="flex items-start gap-3 border-b border-[var(--dd-border-gold)] pb-4 last:border-0 last:pb-0"><span aria-hidden="true" className="mt-1 text-sm font-bold text-[var(--dd-burgundy)]">0{i+1}</span><span className="font-semibold text-[var(--dd-burgundy-deep)]">{label}</span></div>)}
        </aside>
      </div>
    </section>

    <section id="holiday-mission" aria-labelledby="holiday-title" className="scroll-mt-20 border-y border-[var(--dd-border-gold)] bg-[var(--dd-cream)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionTitle id="holiday-title" number="02" eyebrow="Seasonal community initiative" heading="Join the Holiday Mission" description="Separate pathways for families, contributors, community organizations and volunteers. Participation is an expression of interest, not guaranteed assistance or an assignment." />
        <div className="mb-7 overflow-hidden rounded-3xl border-2 border-[var(--dd-gold)] bg-[var(--dd-ivory)] shadow-md">
          <div aria-hidden="true" className="flex items-center justify-between bg-[var(--dd-burgundy-deep)] px-5 py-3 text-[var(--dd-gold-soft)] sm:px-8">
            <span className="text-lg tracking-[.3em]">✦ ✧ ✦</span>
            <span className="text-[11px] font-extrabold uppercase tracking-[.2em]">The Holiday Mission · 2026</span>
            <span className="text-lg tracking-[.3em]">✦ ✧ ✦</span>
          </div>
          <div className="grid items-center gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.82fr)] lg:gap-10">
            <div className="max-w-lg">
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--dd-burgundy)]">Local businesses & community partners wanted</p>
              <h3 className="mt-4 font-serif text-3xl font-bold italic leading-tight text-[var(--dd-burgundy-deep)] sm:text-4xl">Your Skills. Someone’s Next Step.</h3>
              <div aria-hidden="true" className="mt-5 h-1 w-28 rounded-full bg-[var(--dd-gold)]" />
              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--dd-ink)]">DANI is seeking businesses, organizations and individuals interested in offering skills, services, time or resources to help families navigating housing instability or a transition into stable housing.</p>
              <div className="mt-6 rounded-xl border border-[var(--dd-gold)] bg-white/80 p-5">
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--dd-burgundy)]">Ways you could contribute</p>
                <p className="mt-3 text-sm leading-7 text-[var(--dd-ink)]">Home and property support · business and creative skills · moving and supplies · volunteer and community support.</p>
              </div>
              <a href="mailto:vendors@danideclares.com?subject=Holiday%20Mission%20Contributor" className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[var(--dd-burgundy)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--dd-burgundy-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dd-burgundy)]">Tell us what you can offer <span className="ml-3" aria-hidden="true">↗</span></a>
              <p className="mt-4 text-xs leading-6 text-[var(--dd-muted)]">No purchase required. Interest does not guarantee an assignment or assistance.</p>
            </div>
            <figure className="m-0 rounded-2xl border border-[var(--dd-gold)] bg-white p-3 shadow-lg sm:p-4">
              <img src={approvedMissionFlyer} alt="Approved DANI Holiday Mission contributor flyer showing ways to offer skills, time, services and resources" className="h-auto w-full rounded-lg object-contain" loading="lazy" />
              <figcaption className="mt-3 text-center text-xs font-semibold text-[var(--dd-burgundy-deep)]">The approved Holiday Mission 2026 flyer</figcaption>
            </figure>
          </div>
          <div aria-hidden="true" className="flex items-center justify-center gap-4 border-t border-[var(--dd-gold)] bg-[var(--dd-cream)] px-5 py-3 text-center text-[var(--dd-burgundy)]">
            <span>✦</span><span className="text-[11px] font-extrabold uppercase tracking-[.2em]">We Handle The Execution</span><span>✦</span>
          </div>
        </div>
        <p className="mb-5 text-center text-xs font-bold uppercase tracking-[.2em] text-[var(--dd-burgundy)]">Choose your Holiday Mission path</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PATHS.slice(1,5).map((item,i)=><RouteCard key={item.title} item={item} search={search} compact index={i+1}/>)}
        </div>
        <div className="mt-6 rounded-xl border border-[var(--dd-border-gold)] bg-[var(--dd-white)] p-5 text-xs leading-6 text-[var(--dd-muted)]"><strong className="text-[var(--dd-burgundy-deep)]">Participation notice:</strong> This is an interest registry, not an approved aid program or guarantee of resources. Family information is collected separately from commercial leads. Contributor interest does not imply confirmed assignments.</div>
      </div>
    </section>

    <section id="work-with-dani" aria-labelledby="work-title" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 sm:px-8 sm:py-20">
      <SectionTitle id="work-title" number="03" eyebrow="Professional relationships" heading="Work With DANI" description="Referrals, business partnerships, vendors, makers and independent providers have different processes. Select what you want to contribute or explore." />
      <div className="mb-6 grid gap-5 overflow-hidden rounded-3xl border border-[var(--dd-border-gold)] bg-[var(--dd-white)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <img src="/images/dani-batch/pexels-pavel-danilyuk-7937734.jpg" alt="Professionals coordinating work together" className="h-44 w-full object-cover sm:h-full sm:min-h-52" loading="lazy" />
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--dd-burgundy)]">Partnerships with a purpose</p>
          <h3 className="mt-3 text-2xl font-bold text-[var(--dd-burgundy-deep)]">Different relationships. Clear next steps.</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--dd-muted)]">Introduce capabilities, explore referrals, or apply to provide services through the path designed for that relationship.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PATHS.slice(5).map((item,i)=><RouteCard key={item.title} item={item} search={search} compact index={i+1}/>)}
      </div>
      <div className="mt-8 rounded-2xl border border-[var(--dd-border-gold)] bg-[var(--dd-cream)] p-6 text-sm leading-7 text-[var(--dd-muted)]">
        <strong className="text-[var(--dd-burgundy-deep)]">How these paths differ:</strong> Introductions and referrals are not paid arrangements unless separately agreed. Vendors and creative collaborators introduce capabilities for consideration. Independent service providers must complete separate qualification, documentation and authorization before any work assignment.
      </div>
    </section>
  </main>;
}
