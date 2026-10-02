import handler from '../../api/integrations/gmail/sync.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';

const run = adaptVercelHandler(handler);

export default async function scheduledGmailReconciliation() {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error('CRON_SECRET_MISSING');
  return run(new Request('https://scheduled.local/api/integrations/gmail/sync', {
    method: 'GET',
    headers: { authorization: 'Bearer ' + secret }
  }));
}

export const config = {
  schedule: '*/15 * * * *'
};
