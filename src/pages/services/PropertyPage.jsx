import React from 'react';
import ServiceAreaLanding from '../ServiceAreaLanding.jsx';

const cards = [
  {
    title: 'Turnover & Make-Ready',
    description: 'Move vacant units toward rent-ready with cleaning, reset support, punch-list coordination, vendor handoff and readiness documentation.',
  },
  {
    title: 'Property Rescue & Field Dispatch',
    description: 'Get extra execution capacity for field support, small-job response, supply logistics and time-sensitive property needs.',
  },
  {
    title: 'Property Condition & Documentation',
    description: 'Organized condition checks, site photos and management-ready documentation to support your team’s decisions.',
  },
  {
    title: 'Office & Operations Rescue',
    description: 'Bring administrative coordination, records organization and property-office support into a dependable workflow.',
  },
];

export default function PropertyPage() {
  return <ServiceAreaLanding
    eyebrow="DANI DECLARES · Property management & apartments"
    title="Property work, handled with a clear plan."
    description="From apartment turnover to field tasks and day-to-day operations, DANI helps property teams move the work forward. Tell us what needs attention, and we will confirm a practical scope and execution route."
    visualFamily="Property, Facilities & Field Operations"
    cards={cards.map(card => ({ ...card, to: '/request-service?channelType=B2B_APT', linkLabel: 'Discuss this property need' }))}
    firstAction={{to:'/request-service?channelType=B2B_APT',label:'Request property support'}}
    secondAction={{href:'tel:+14704857173',label:'Call (470) 485-7173'}}
    sectionTitle="Four ways to support your property team"
    closingTitle="Have a property need this week?"
    closingDescription="Describe the address or service area, target date, and the work. We will confirm scope, fulfillment availability, and the appropriate next step."
  />;
}
