export const WORKFLOW_CHANNELS = {
  B2C: 'B2C',
  B2B_APT: 'B2B_APT',
  B2B_RE: 'B2B_RE',
  B2G: 'B2G',
};

export const WORKFLOW_STATES = {
  B2C: ['INTAKE', 'PRICED', 'PAYMENT_PENDING', 'PAID', 'JOB_CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  B2B: ['INTAKE', 'PRICED', 'PROPOSAL_DRAFT', 'PROPOSAL_SENT', 'APPROVED', 'JOB_CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID', 'CANCELLED'],
  B2G: ['SOLICITATION', 'BID_DRAFT', 'BID_SUBMITTED', 'AWARDED', 'TASK_ORDER', 'JOB_CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID', 'CANCELLED'],
};

const B2B_CHANNELS = new Set([WORKFLOW_CHANNELS.B2B_APT, WORKFLOW_CHANNELS.B2B_RE]);

export function workflowFamily(channel) {
  if (channel === WORKFLOW_CHANNELS.B2C) return 'B2C';
  if (B2B_CHANNELS.has(channel)) return 'B2B';
  if (channel === WORKFLOW_CHANNELS.B2G) return 'B2G';
  return null;
}

export function canTransition(channel, from, to) {
  const family = workflowFamily(channel);
  if (!family) return false;
  const allowed = {
    B2C: {
      INTAKE: ['PRICED', 'CANCELLED'],
      PRICED: ['PAYMENT_PENDING', 'CANCELLED'],
      PAYMENT_PENDING: ['PAID', 'CANCELLED'],
      PAID: ['JOB_CREATED'],
      JOB_CREATED: ['SCHEDULED', 'CANCELLED'],
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    },
    B2B: {
      INTAKE: ['PRICED', 'PROPOSAL_DRAFT', 'CANCELLED'],
      PRICED: ['PROPOSAL_DRAFT', 'CANCELLED'],
      PROPOSAL_DRAFT: ['PROPOSAL_SENT', 'CANCELLED'],
      PROPOSAL_SENT: ['APPROVED', 'CANCELLED'],
      APPROVED: ['JOB_CREATED', 'CANCELLED'],
      JOB_CREATED: ['SCHEDULED', 'CANCELLED'],
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: ['INVOICED'],
      INVOICED: ['PAID'],
      PAID: [],
      CANCELLED: [],
    },
    B2G: {
      SOLICITATION: ['BID_DRAFT', 'CANCELLED'],
      BID_DRAFT: ['BID_SUBMITTED', 'CANCELLED'],
      BID_SUBMITTED: ['AWARDED', 'CANCELLED'],
      AWARDED: ['TASK_ORDER', 'CANCELLED'],
      TASK_ORDER: ['JOB_CREATED', 'CANCELLED'],
      JOB_CREATED: ['SCHEDULED', 'CANCELLED'],
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: ['INVOICED'],
      INVOICED: ['PAID'],
      PAID: [],
      CANCELLED: [],
    },
  }[family];
  return Boolean(allowed?.[from]?.includes(to));
}

export function assertTransition(channel, from, to) {
  if (!canTransition(channel, from, to)) {
    throw new Error(`Invalid workflow transition: ${channel} ${from} -> ${to}`);
  }
  return to;
}

export function nextStateAfterPayment(channel) {
  if (channel === WORKFLOW_CHANNELS.B2C) return 'JOB_CREATED';
  throw new Error(`Payment cannot directly create a job for ${channel}; commercial approval workflow is required.`);
}
