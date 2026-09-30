import fs from 'fs';
import path from 'path';

const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/20260930231014_repair_revenue_orchestrator_quote_contract.sql'
);

describe('revenue orchestrator quote contract', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8');

  test('selects only dispositions accepted by the canonical quote command', () => {
    expect(sql).toContain("disposition in ('QUOTE_REQUESTED', 'READY_TO_BUY')");
    expect(sql).not.toContain("disposition in ('QUOTE_READY','QUALIFIED','OPPORTUNITY')");
  });

  test('remains fail-closed on governed SKU and prior estimate evidence', () => {
    expect(sql).toContain('suggested_sku is not null');
    expect(sql).toContain("sales_metadata, '{}'::jsonb");
    expect(sql).toContain("? 'estimate_id'");
  });

  test('preserves service-role-only execution', () => {
    expect(sql).toContain(
      'revoke all on function public.dd_run_revenue_orchestrator() from public, anon, authenticated;'
    );
    expect(sql).toContain(
      'grant execute on function public.dd_run_revenue_orchestrator() to service_role;'
    );
  });
});
