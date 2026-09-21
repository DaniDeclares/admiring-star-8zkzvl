import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2,
  FileText, Home, Landmark, Laptop, Palette, Truck, UsersRound
} from 'lucide-react';

const lanes = [
  { icon: Home, title: 'Residents', eyebrow: 'Everyday + personal', body: 'Household support, organization, errands, laundry, home watch, pet care, plant care, and concierge help.', href: '/catalog?audience=residents', cta: 'Explore resident services' },
  { icon: Building2, title: 'Property teams', eyebrow: 'Operational support', body: 'Turns, field support, inspections, documentation, punch lists, resident programs, logistics, and recurring property operations.', href: '/services/property', cta: 'Explore property support' },
  { icon: UsersRound, title: 'Real estate', eyebrow: 'Listing + transaction', body: 'Listing readiness, showing support, closing logistics, field verification, client experience, and office support.', href: '/real-estate', cta: 'Explore real estate support' },
  { icon: BriefcaseBusiness, title: 'Businesses', eyebrow: 'Back-office + field', body: 'Administrative support, digital setup, marketing, creative production, logistics, workplace support, and recurring operations.', href: '/services/business-solutions', cta: 'Explore business solutions' },
  { icon: Landmark, title: 'Government + institutions', eyebrow: 'Procurement + execution', body: 'Procurement-oriented facilities, administrative, logistics, documentation, supply, production, and field support.', href: '/industries/government', cta: 'Explore procurement support' },
];

const capabilities = [
  [Laptop, 'Administrative & digital operations', 'Remote-friendly support that helps organizations keep the work moving.'],
  [Truck, 'Logistics & field execution', 'Dispatchable pickup, delivery, sourcing, verification, and on-the-ground support.'],
  [CalendarDays, 'Events & experiences', 'Planning, setup, production, guest support, community programming, and closeout.'],
  [Palette, 'Creative & production', 'Design, apparel, signage, print, content, media, and branded assets.'],
  [FileText, 'Documents & coordination', 'Structured document, coordination, records, and operational support within approved scope.'],
  [UsersRound, 'Growth & relationship support', 'Prospecting, partnership development, referral support, and commercial operations.'],
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#24151a]">
      <Helmet>
        <title>What DANI DECLARES Handles | DANI DECLARES LLC</title>
        <meta name="description" content="DANI DECLARES coordinates resident, property, real estate, business, event, logistics, creative, administrative and institutional support through one operating partner." />
      </Helmet>

      <section className="bg-[#45141d] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 md:py-28">
          <p className="text-[#e5d2a5] text-xs font-black uppercase tracking-[.2em]">One company • multiple ways to work with us</p>
          <h1 className="mt-4 max-w-5xl text-4xl sm:text-6xl md:text-7xl font-black leading-[.98]">
            More than one service.
            <span className="block text-[#d9b65a]">One accountable place to start.</span>
          </h1>
          <p className="mt-7 max-w-3xl text-lg md:text-xl leading-relaxed text-white/80">
            DANI DECLARES helps people and organizations get work handled across homes, properties, real estate, businesses, events, logistics, creative production and institutional operations.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link to="/request-service" className="inline-flex items-center justify-center rounded-xl bg-[#c9a45c] px-7 py-4 text-[#45141d] font-black">
              Tell us what you need <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/catalog" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-4 text-white font-black">
              Browse services
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-[#a17a2a] text-xs font-black uppercase tracking-[.18em]">Choose your path</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#45141d]">Start with your situation—not our internal org chart.</h2>
          <p className="mt-4 text-[#6e6264] text-lg">Different buyers need different language, pricing, and next steps. DANI routes you to the right commercial path without making you learn how the company is built.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {lanes.map(({icon: Icon, title, eyebrow, body, href, cta}) => (
            <article key={title} className="rounded-3xl border border-[#ead9b3] bg-white p-7 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#f7edd8] flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#6b1f2b]" />
              </div>
              <p className="mt-5 text-[11px] font-black uppercase tracking-[.16em] text-[#a17a2a]">{eyebrow}</p>
              <h3 className="mt-2 text-2xl font-black text-[#45141d]">{title}</h3>
              <p className="mt-3 text-[#6e6264] leading-relaxed">{body}</p>
              <Link to={href} className="mt-6 inline-flex items-center text-sm font-black text-[#6b1f2b]">
                {cta} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f2eadc] border-y border-[#e1d2b5]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="max-w-3xl">
            <p className="text-[#a17a2a] text-xs font-black uppercase tracking-[.18em]">What sits underneath</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#45141d]">A broad capability base, organized around outcomes.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map(([Icon, title, body]) => (
              <div key={title} className="rounded-2xl bg-white border border-[#ead9b3] p-6">
                <Icon className="w-6 h-6 text-[#8e661e]" />
                <h3 className="mt-4 text-xl font-black text-[#45141d]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6e6264]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-center">
          <div>
            <p className="text-[#a17a2a] text-xs font-black uppercase tracking-[.18em]">How working with DANI feels</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#45141d]">You bring us the need. We help organize the work.</h2>
            <p className="mt-5 text-[#6e6264] text-lg leading-relaxed">
              We start by understanding what needs to happen, confirm the right scope and next step, then coordinate the approved work through DANI's operating system.
            </p>
            <div className="mt-7 space-y-3">
              {[
                'Clear scope and next steps',
                'Governed pricing or a documented quote when scope varies',
                'One place to track requests, approvals, payments and updates',
                'Qualified/authorized fulfillment paths when field work is required',
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8e661e] mt-0.5 shrink-0" />
                  <span className="text-[#4d4145]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#45141d] text-white p-8 md:p-10 shadow-xl">
            <p className="text-[#e5d2a5] text-xs font-black uppercase tracking-[.18em]">Need help choosing?</p>
            <h3 className="mt-4 text-3xl font-black">Tell us what is happening.</h3>
            <p className="mt-4 text-white/75 leading-relaxed">
              You do not have to know the exact service name. Describe the outcome you need, and we will route the request to the appropriate DANI path.
            </p>
            <Link to="/request-service" className="mt-7 inline-flex items-center rounded-xl bg-[#c9a45c] px-6 py-4 text-[#45141d] font-black">
              Start a request <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
