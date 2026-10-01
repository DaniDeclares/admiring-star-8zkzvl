import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const api = fs.readFileSync(path.join(root, 'api/portal-operations.js'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20261001063000_provider_estimate_offer_response_boundary.sql'), 'utf8');

test('provider portal uses the estimate-offer response boundary', () => {
  expect(api).toContain("rpc('dd_respond_to_my_estimate_offer'");
  expect(api).toContain('p_offer_id: payload.assignmentId');
});

test('estimate-offer acceptance reuses canonical guarded assignment and appointment path', () => {
  expect(migration).toContain('private.dd_current_provider_id()');
  expect(migration).toContain("assignment_type <> 'PROVIDER'");
  expect(migration).toContain('CONFIRMED_SCHEDULE_REQUIRED_BEFORE_PROVIDER_ACCEPTANCE');
  expect(migration).toContain('insert into public.dd_job_assignments');
  expect(migration).toContain("assignment_status,provider_notes");
  expect(migration).toContain("'ACCEPTED','Accepted paid estimate offer.'");
  expect(migration).toContain('revoke all on function public.dd_respond_to_my_estimate_offer(uuid,boolean,text) from public,anon');
});
