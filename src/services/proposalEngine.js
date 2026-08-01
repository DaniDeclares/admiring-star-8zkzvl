const PROPOSAL_TEMPLATES = {
  'Apartment Communities': {
    subject: 'Proposal for Apartment Communities Service Support',
    body: 'Thank you for the opportunity to support your apartment communities with dependable turnover, inspections, and resident experience services. We are prepared to deliver efficient, documented execution for your properties.'
  },
  Realtors: {
    subject: 'Proposal for Realtor Property Readiness Services',
    body: 'We provide fast-turn property readiness, inspection support, and presentation refresh services to help listings move quickly and professionally.'
  },
  'Law Firms': {
    subject: 'Proposal for Law Firm Document and Courier Support',
    body: 'Our team can support document handling, delivery coordination, and compliance-ready administrative assistance for legal operations.'
  },
  'Small Businesses': {
    subject: 'Proposal for Small Business Operations Support',
    body: 'We offer practical support for printing, document handling, event operations, and business execution that helps your team stay organized and responsive.'
  }
};

export function generateProposalTemplate(persona, serviceCode, options = {}) {
  const template = PROPOSAL_TEMPLATES[persona] || PROPOSAL_TEMPLATES['Small Businesses'];
  const serviceName = options.serviceName || serviceCode || 'service support';
  const total = options.total || 0;

  return {
    persona,
    subject: `${template.subject} - ${serviceName}`,
    body: `${template.body}\n\nEstimated investment: $${total}.\nService focus: ${serviceName}.`
  };
}
