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
  if (!output.get('utm_campaign')) output.set('utm_campaign', 'holiday-2026');
  for (const [key, value] of Object.entries(extra)) if (value) output.set(key, value);
  return path + '?' + output.toString();
}
export default function ConnectPage() {
  const { search } = useLocation();
  return <main className="min-h-screen bg-[#fbf8f1] text-[#30191e]">
    <Helmet><title>Get Connected | DANI DECLARES LLC</title><meta name="description" content="Request DANI services, register Holiday 2026 community interest, or explore provider, vendor and partnership opportunities through the right online form." /></Helmet>
    <section className="bg-[#551524] text-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
        <p className="uppercase tracking-[.19em] text-[#eacb8b] text-xs font-black">DANI DECLARES LLC • WE HANDLE THE EXECUTION</p>
        <h1 style={{ color: "#FFFFFF" }} className="mt-5 max-w-4xl text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">What brings you to DANI?</h1>
        <p className="mt-5 text-lg text-[#f7eced] max-w-3xl">Looking for work handled, a way to help families this holiday season, or an opportunity to build with us? Choose your starting point. We’ll keep the right request in the right workflow.</p>
      </div>
    </section>
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12" aria-label="Choose how to connect">
      <div className="grid gap-5 md:grid-cols-2">
        {PATHS.map(item => <article key={item.title} className="rounded-[24px] border border-[#e3d5bb] bg-white shadow-sm p-7 flex flex-col">
          <h2 className="text-2xl font-bold text-[#611c2c]">{item.title}</h2>
          <p className="my-4 text-[#64565a] leading-7 flex-1">{item.detail}</p>
          <Link className="inline-flex justify-center rounded-xl bg-[#6b1f2b] px-5 py-3.5 text-white font-bold hover:bg-[#4d1220] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b1f2b]"
            to={destinationFor(item.path, search, { role:item.role, participation:item.participation, focus:item.focus, ...(item.provider ? { audience:'provider' } : {}) })}>{item.button} →</Link>
        </article>)}
      </div>
      <div className="mt-10 rounded-2xl border border-[#d7b980] bg-[#fff7e8] p-6 text-sm leading-7 text-[#66505a]">
        <strong>Holiday 2026 mission:</strong> We are developing local partnerships and resource coordination for families experiencing homelessness or transitioning into stable housing. This is an interest registry, not an approved aid program or guarantee of resources. Family information is collected separately from commercial leads. Paid provider opportunities require their own application and approval.
      </div>
    </section>
  </main>;
}
