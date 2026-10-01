import fs from 'fs';
import path from 'path';

describe('sales closeability runtime reconciliation', () => {
  const sql = fs.readFileSync(
    path.resolve('supabase/migrations/20261001045500_reconcile_sales_closeability_runtime.sql'),
    'utf8',
  );

  test('reuses canonical sales, readiness, and payment authorities', () => {
    expect(sql).toContain('from public.dd_sales_engine_v1 e');
    expect(sql).toContain('public.dd_service_canonical_readiness_v1');
    expect(sql).toContain('public.dd_service_initial_payment_links');
  });

  test('fails closed before declaring the money path ready', () => {
    expect(sql).toContain("coalesce(cr.release_state, '') <> 'LIVE_READY'");
    expect(sql).toContain('e.suggested_sku is null');
    expect(sql).toContain('p.verified_at is null');
    expect(sql).toContain("then 'CAPTURE_PAIN'");
  });

  test('is security-invoker and excludes anonymous access', () => {
    expect(sql).toContain('with (security_invoker = true)');
    expect(sql).toContain('revoke all on public.dd_sales_closeability_v1 from public, anon;');
    expect(sql).toContain('grant select on public.dd_sales_closeability_v1 to authenticated, service_role;');
  });
});
