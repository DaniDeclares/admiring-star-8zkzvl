import fs from 'fs';
import path from 'path';

const migrationPath = path.join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260930184000_repair_sales_quote_live_ready_contract.sql'
);

describe('sales to quote release contract', () => {
  const migration = fs.readFileSync(migrationPath, 'utf8');

  test('uses the canonical LIVE_READY release state', () => {
    expect(migration).toContain("x.release_state = 'LIVE_READY'");
    expect(migration).not.toContain("x.release_state = 'GREEN'");
  });

  test('keeps the automation boundary at an internal draft', () => {
    expect(migration).toContain("'needs_review'");
    expect(migration).toContain("'automation_authority', 'INTERNAL_DRAFT_ONLY'");
    expect(migration).toContain('No customer contact and no price publication occurred.');
  });

  test('uses persisted sales and estimate contracts', () => {
    expect(migration).toContain("('QUOTE_REQUESTED', 'READY_TO_BUY')");
    expect(migration).toContain('division_slug');
    expect(migration).toContain("then 'high' else 'normal'");
    expect(migration).not.toContain('disposition = \'QUOTE_DRAFTED\'');
    expect(migration).not.toContain('lead_id,');
  });

  test('reuses an existing sales-queue draft', () => {
    expect(migration).toContain("e.intake_answers ->> 'sales_queue_id' = s.id::text");
    expect(migration).toContain('if found then');
  });
});
