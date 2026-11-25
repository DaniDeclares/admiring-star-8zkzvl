import React from 'react';
import ServiceAreaLanding from './ServiceAreaLanding.jsx';

const cards = [
  {
    title: 'Administrative & Business Operations',
    description: 'Reliable help with the work that keeps a business organized and moving.',
    items: ['Administrative coordination', 'Document preparation and organization', 'Records, data and spreadsheet support'],
  },
  {
    title: 'Business Field Support',
    description: 'Coordinated on-the-ground assistance when work cannot be handled from a desk.',
    items: ['Field runner and site support', 'Vendor and site coordination', 'Supply pickup and delivery runs'],
  },
  {
    title: 'Digital & Workplace Support',
    description: 'Request scoped help with routine digital operations, systems, and workspaces.',
    items: ['Business workflow support', 'Office and workstation coordination', 'Technology setup inquiries'],
  },
  {
    title: 'Ongoing Operations Support',
    description: 'Start with one assignment or tell us where your team needs dependable recurring help.',
    items: ['Defined operational tasks', 'Periodic administrative support', 'Project-based coordination'],
  },
];

export default function BusinessSolutionsPage() {
  return <ServiceAreaLanding
    eyebrow="DANI DECLARES · Business services"
    title="Business Work, Handled."
    description="Administrative, field, workplace and operational support for the work behind your business. Start with the need, and we will help you find the right next step."
    visualFamily="Administrative & Business Operations"
    cards={cards.map(card => ({ ...card, to: '/request-service?channelType=B2B', linkLabel: 'Discuss this business need' }))}
    firstAction={{to:'/request-service?channelType=B2B',label:'Tell us what your business needs'}}
    secondAction={{to:'/catalog?audience=business',label:'Browse business services'}}
    sectionTitle="Practical support for growing teams"
    closingTitle="Get the next business task moving."
    closingDescription="Tell us about the deliverable, location and timeline. We will review the requested scope, availability and pricing before confirming work."
  />;
}
