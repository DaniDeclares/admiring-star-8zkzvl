import fs from 'fs';
import path from 'path';

describe('external-action claim health view security', () => {
  test('uses caller privileges and excludes anonymous access', () => {
    const sql = fs.readFileSync(
      path.resolve('supabase/migrations/20261001030500_harden_external_action_claim_health_view.sql'),
      'utf8',
    );

    expect(sql).toMatch(/alter view public\.dd_external_action_claim_health_v1\s+set \(security_invoker = true\)/i);
    expect(sql).toMatch(/revoke all on public\.dd_external_action_claim_health_v1 from anon/i);
    expect(sql).toMatch(/grant select on public\.dd_external_action_claim_health_v1 to authenticated, service_role/i);
  });
});
