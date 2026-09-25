export const OWNER_CONNECTED_SYSTEMS = [
  {
    key: 'dani', name: 'DANI HQ / Supabase', type: 'DANI NATIVE', status: 'PRIMARY',
    description: 'Core operational source for customers, services, pricing, requests, jobs, providers, payments and release state.',
    href: '/portal/operations', cta: 'Open DANI Operations',
  },
  {
    key: 'asana', name: 'Asana', type: 'CONNECTED WORK', status: 'WEB ACCESS',
    description: 'Execution projects, tasks, deadlines and release work. DANI HQ provides the business context; Asana remains the task-system workspace.',
    href: 'https://app.asana.com/1/1218540418974397/project/1218709452415851', cta: 'Open Asana',
    external: true,
  },
  {
    key: 'notion', name: 'Notion', type: 'CONNECTED KNOWLEDGE', status: 'WEB ACCESS',
    description: 'Operating manual, authority matrix, sales motion, funding/certification procedures and company controls.',
    href: 'https://app.notion.com/p/3e148d92062581c08df1ede3b1b7f8b4', cta: 'Open DANI Notion',
    external: true,
  },
  {
    key: 'hubspot', name: 'HubSpot', type: 'CONNECTED CRM', status: 'WEB ACCESS',
    description: 'Commercial account, contact, deal and relationship management.',
    href: 'https://app.hubspot.com/', cta: 'Open HubSpot', external: true,
  },
  {
    key: 'stripe', name: 'Stripe', type: 'CONNECTED PAYMENTS', status: 'WEB ACCESS',
    description: 'Payment and invoice processing authority.',
    href: 'https://dashboard.stripe.com/', cta: 'Open Stripe', external: true,
  },
  {
    key: 'airtable', name: 'Airtable', type: 'GOVERNANCE / REFERENCE', status: 'WEB ACCESS',
    description: 'Governance, economics, certification, capital and reference datasets.',
    href: 'https://airtable.com/appJjOPWnFsZe11zM', cta: 'Open DANI Airtable', external: true,
  },
  {
    key: 'github', name: 'GitHub', type: 'SOURCE CONTROL', status: 'WEB ACCESS',
    description: 'Application source, migrations, tests, configuration and release history.',
    href: 'https://github.com/DaniDeclares/admiring-star-8zkzvl', cta: 'Open repository', external: true,
  },
  {
    key: 'netlify', name: 'Netlify', type: 'DEPLOYMENT', status: 'TEMP PRODUCTION',\n    description: 'Temporary production deployments, runtime and hosting while Vercel is parked.',\n    href: 'https://app.netlify.com/projects/sparkling-croissant-829102', cta: 'Open Netlify', external: true,
  },
  {
    key: 'resend', name: 'Resend', type: 'CUSTOMER EMAIL', status: 'WEB ACCESS',
    description: 'Transactional email delivery.',
    href: 'https://resend.com/', cta: 'Open Resend', external: true,
  },
  {
    key: 'docusign', name: 'DocuSign', type: 'SIGNATURES', status: 'WEB ACCESS',
    description: 'Contract and document signature execution.',
    href: 'https://apps.docusign.com/', cta: 'Open DocuSign', external: true,
  },
  {
    key: 'gusto', name: 'Gusto', type: 'WORKFORCE PAY', status: 'WEB ACCESS',
    description: 'Contractor and payroll administration.',
    href: 'https://app.gusto.com/', cta: 'Open Gusto', external: true,
  },
  {
    key: 'slack', name: 'Slack', type: 'TEAM COMMUNICATION', status: 'WEB ACCESS',
    description: 'Team communication and operational coordination.',
    href: 'https://app.slack.com/', cta: 'Open Slack', external: true,
  },
  {
    key: 'posthog', name: 'PostHog', type: 'PRODUCT / RUNTIME EVIDENCE', status: 'WEB ACCESS',
    description: 'Behavioral and runtime evidence for the production application.',
    href: 'https://app.posthog.com/', cta: 'Open PostHog', external: true,
  },
];

export const OWNER_PRIORITY_LINKS = [
  {
    label: 'Integrations & Connections',
    description: 'Configure and audit DANI-connected work, knowledge, communications, payment, CRM and telephony boundaries.',
    href: '/portal/integrations',
  },
  {
    label: 'Government & Capital Readiness',
    description: 'SBA, SAM, state procurement, certifications, lender packages and targeted grant research.',
    href: 'https://app.asana.com/1/1218540418974397/project/1218709452415851',
    external: true,
  },
  {
    label: 'Company-Wide Portfolio + Distributed Fulfillment',
    description: 'Equal-footing channels/divisions, remote-first fulfillment, provider capacity and portal ecosystem.',
    href: 'https://app.asana.com/1/1218540418974397/project/1218709452415851',
    external: true,
  },
  {
    label: 'Sales + Acquisition',
    description: 'Sales queue, commercial accounts, opportunities, proposals and buyer-specific sales motion.',
    href: '/portal/acquisition',
  },
  {
    label: 'Operations + Dispatch',
    description: 'Requests, quoting, scheduling, jobs, providers, evidence and closeout.',
    href: '/portal/operations',
  },
  {
    label: 'Commercial Quotes',
    description: 'Governed quote creation, review and customer handoff.',
    href: '/portal/quotes',
  },
  {
    label: 'Provider / Field Network',
    description: 'Provider approvals, service authorization, dispatch and DANI FIELD.',
    href: '/portal/provider-approval',
  },
];
