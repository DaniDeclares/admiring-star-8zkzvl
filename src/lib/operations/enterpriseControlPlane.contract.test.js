import fs from 'fs';
import path from 'path';

const migration = fs.readFileSync(
  path.join(process.cwd(), 'supabase/migrations/20260925201500_tester_enterprise_control_plane.sql'),
  'utf8'
);
const contract = fs.readFileSync(
  path.join(process.cwd(), 'docs/DANI_TESTER_ENTERPRISE_CONTROL_PLANE.md'),
  'utf8'
);

describe('DANI tester enterprise control plane contract', () => {
  test('composes existing controllers instead of inventing domain authorities', () => {
    expect(migration).toContain('dd_run_research_pipeline_controller');
    expect(migration).toContain('dd_run_safe_automation_recipes');
    expect(migration).toContain('dd_run_service_discovery_controller');
    expect(migration).toContain('dd_run_commercial_reconciliation');
  });

  test('surfaces owner, worker and external-action health', () => {
    expect(migration).toContain('dd_owner_attention_queue');
    expect(migration).toContain('dd_external_action_outbox');
    expect(migration).toContain('dd_agent_run_control');
    expect(migration).toContain('dd_enterprise_control_health_v1');
  });

  test('keeps the controller internal and non-side-effecting', () => {
    expect(migration).toContain('revoke all on function public.dd_run_enterprise_control_plane() from public, anon, authenticated');
    expect(migration).toContain("'external_side_effects_executed',false");
    expect(migration).toContain("'money_movement_authorized',false");
    expect(migration).toContain("'provider_authorization_mutated',false");
    expect(migration).toContain("'production_promotion',false");
  });

  test('defines end-to-end green as proof rather than registration', () => {
    expect(contract).toContain('A table, cron, agent registration, queued outbox item, PR, preview or deployment is not proof of operation.');
    expect(contract).toContain('enqueue → claim/lease → attempt → external effect → receipt → verification');
    expect(contract).toContain('Production remains separately gated.');
  });
});
