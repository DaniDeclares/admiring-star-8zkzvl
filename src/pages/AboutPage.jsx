import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Briefcase, Home, Building2 } from 'lucide-react';

const areas = [
  { icon: Home, label: 'People & households', detail: 'Resident support, home readiness, organization, errands and day-to-day service needs.' },
  { icon: Building2, label: 'Properties & real estate', detail: 'Turnover coordination, field support, documentation, listing readiness and practical property operations.' },
  { icon: Briefcase, label: 'Businesses & institutions', detail: 'Administrative work, production, events, logistics and scoped institutional requests.' },
];

export default function AboutPage() {
  return <div className="min-h-screen bg-[#f7f1e6] text-[#351b22]">
    <Helmet>
      <title>About DANI DECLARES LLC | We Handle The Execution</title>
      <meta name="description" content="Learn how DANI DECLARES helps households, property teams, real-estate professionals, businesses and institutions move work forward through clear service and project pathways." />
    </Helmet>
    <section className="relative overflow-hidden bg-[#45141d] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full border border-[#c9a45c]/40" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#e3bd78]">DANI DECLARES LLC · About us</p>
          <h1 style={{color:'#fff'}} className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">We Handle The Execution.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f4e9e5]">DANI brings household, property, business, real-estate, creative, event and institutional needs into one coordinated relationship. Tell us what you need accomplished—even if it spans several services—and we’ll review the right scope and execution path.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/request-service" className="inline-flex min-h-[46px] items-center rounded-xl bg-[#d9b65a] px-6 py-3 text-sm font-black text-[#45141d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Start with your need <ArrowRight className="ml-2 h-4 w-4" /></Link>
            <Link to="/catalog" className="inline-flex min-h-[46px] items-center rounded-xl border border-white/40 px-6 py-3 text-sm font-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Explore services</Link>
          </div>
        </div>
        <figure className="m-0 rounded-3xl border border-white/20 bg-white/10 p-3 shadow-lg">
          <img src="/images/dani-batch/pexels-pavel-danilyuk-7937330.jpg" alt="People reviewing a property's condition together" className="h-64 w-full rounded-2xl object-cover sm:h-80" fetchPriority="high" />
          <figcaption className="px-2 pt-3 text-xs leading-5 text-[#f4e9e5]">Illustrative service photography; not a representation of specific DANI staff or completed jobs.</figcaption>
        </figure>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--dd-burgundy)]">Our approach</p>
        <h2 className="mt-3 text-3xl font-black text-[#45141d] sm:text-4xl">Different needs. A defined next step.</h2>
        <p className="mt-4 text-base leading-8 text-[#6e6264]">Cleaning is one part of DANI, not the definition of the company. Across HANDLE, PREPARE, CREATE, CONNECT and SUPPLY, we connect administrative, field, creative, digital, logistical and customer-support capabilities in a single scoped engagement. Availability, qualifications, pricing and approvals are confirmed before work is promised.</p>
      </div>
      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {areas.map(({icon: Icon,label,detail})=><article key={label} className="rounded-3xl border border-[#e1d2b5] bg-white p-7 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5e8cd]"><Icon className="h-6 w-6 text-[#6b1f2b]" /></div>
          <h3 className="mt-5 text-xl font-black text-[#45141d]">{label}</h3>
          <p className="mt-3 text-sm leading-7 text-[#6e6264]">{detail}</p>
        </article>)}
      </div>
    </section>
    <section className="border-y border-[#e1d2b5] bg-white" aria-labelledby="how-work-gets-handled">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--dd-burgundy)]">One relationship. Multiple capabilities.</p>
        <h2 id="how-work-gets-handled" className="mt-3 max-w-3xl text-3xl font-black text-[#45141d] sm:text-4xl">Tell us what's on your plate. We'll work through what DANI can take on.</h2>
        <p className="mt-4 max-w-3xl leading-8 text-[#6e6264]">A business might need call follow-ups, scheduling, office help, printed materials and site support together. A household, property team or institution may need a different mix. You can start with the outcome instead of choosing one exclusive division.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-[#e1d2b5] bg-[#fbf8f1] p-6">
            <h3 className="text-xl font-black text-[#45141d]">We define the work</h3>
            <p className="mt-3 leading-7 text-[#6e6264]">DANI reviews the request, keeps its different needs together, and confirms which components are eligible, available and ready for a quote or a next step.</p>
          </article>
          <article className="rounded-2xl border border-[#e1d2b5] bg-[#fbf8f1] p-6">
            <h3 className="text-xl font-black text-[#45141d]">The right people handle it</h3>
            <p className="mt-3 leading-7 text-[#6e6264]">Depending on the assignment, work may be coordinated directly, offered to approved independent providers, or supported by qualified business partners. Provider approval, service area, availability and acceptance govern actual assignments.</p>
          </article>
          <article className="rounded-2xl border border-[#e1d2b5] bg-[#fbf8f1] p-6">
            <h3 className="text-xl font-black text-[#45141d]">Relationships carry forward</h3>
            <p className="mt-3 leading-7 text-[#6e6264]">Referrals and a customer's preferred provider can inform priority and repeat work, subject to the applicable agreement, qualifications and capacity. Completion is confirmed through the appropriate process.</p>
          </article>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/request-service" className="inline-flex min-h-[46px] items-center rounded-xl bg-[#6b1f2b] px-6 py-3 text-sm font-black text-white">Describe what you need <ArrowRight className="ml-2 h-4 w-4" /></Link>
          <Link to="/connect" className="inline-flex min-h-[46px] items-center rounded-xl border border-[#6b1f2b] px-6 py-3 text-sm font-black text-[#6b1f2b]">Explore provider and partner relationships</Link>
        </div>
      </div>
    </section>
    <section className="border-y border-[#e1d2b5] bg-[#f2eadc]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--dd-burgundy)]">Clear relationships</p>
          <h2 className="mt-3 text-3xl font-black text-[#45141d]">Work with DANI, in the right way.</h2>
          <p className="mt-4 leading-8 text-[#6e6264]">Customer requests, community participation, referral conversations and independent-provider applications have different entry and approval paths. Each should reach the right team and process.</p>
        </div>
        <div className="grid gap-3">
          <Link to="/connect" className="flex items-center justify-between rounded-2xl border border-[#e1d2b5] bg-white px-6 py-5 font-black text-[#6b1f2b]">Connect & Join <ArrowRight className="h-5 w-5" /></Link>
          <Link to="/request-service" className="flex items-center justify-between rounded-2xl border border-[#e1d2b5] bg-white px-6 py-5 font-black text-[#6b1f2b]">Request a service <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </div>
    </section>
  </div>;
}
