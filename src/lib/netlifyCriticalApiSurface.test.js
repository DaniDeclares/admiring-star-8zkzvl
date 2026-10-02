import fs from 'fs';
import path from 'path';

const root=path.resolve(__dirname,'../..');
const config=fs.readFileSync(path.join(root,'netlify.toml'),'utf8');
const adapter=fs.readFileSync(path.join(root,'netlify/functions/_vercelAdapter.mjs'),'utf8');
const endpoints={
  '/api/create-checkout-session':'create-checkout-session',
  '/api/stripe-webhook':'stripe-webhook',
  '/api/portal-operations':'portal-operations',
  '/api/appointment-response':'appointment-response',
  '/api/process-outbox':'process-outbox',
  '/api/integrations/gmail/sync':'gmail-sync',
  '/api/provider-support-recovery':'provider-support-recovery',
  '/api/provider-accounting':'provider-accounting',
  '/api/portal-fulfillment':'portal-fulfillment-dispatch',
  '/api/portal-dispatch':'provider-routing',
};

test('Netlify publishes each critical sale, portal, scheduling and delivery API',()=>{
 for(const [route,fn] of Object.entries(endpoints)){
  expect(config).toContain(`from = "${route}"`);
  expect(config).toContain(`to = "/.netlify/functions/${fn}"`);
  const wrapper=fs.readFileSync(path.join(root,`netlify/functions/${fn}.mjs`),'utf8');
  expect(wrapper).toContain('adaptVercelHandler(handler)');
 }
});

test('Netlify adapter preserves exact request bytes for Stripe signature verification',()=>{
 expect(adapter).toContain("rawBody = await request.text()");
 expect(adapter).toContain('async *[Symbol.asyncIterator]()');
 expect(adapter).toContain('yield Buffer.from(rawBody)');
});


test('Netlify schedules Gmail reconciliation on the production rail',()=>{
 const scheduled=fs.readFileSync(path.join(root,'netlify/functions/gmail-sync-scheduled.mjs'),'utf8');
 expect(scheduled).toContain("schedule: '*/15 * * * *'");
 expect(scheduled).toContain("process.env.CRON_SECRET");
 expect(scheduled).toContain("adaptVercelHandler(handler)");
});
