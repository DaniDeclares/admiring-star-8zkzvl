import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../.github/workflows/dani-external-action-executor.yml',import.meta.url),'utf8');
test('existing scheduled delivery worker remains intact',()=>{
 assert.match(source,/schedule:\s*\n\s+- cron: '3,13,23,33,43,53 \* \* \* \*'/);
 assert.match(source,/deliver:\s*\n\s+if: github\.event_name != 'workflow_dispatch' \|\| inputs\.mode != 'sop_draft_review'/);
 assert.match(source,/RECONCILE_TESTER_PROMOTION_FEEDBACK/);
});
test('review mode is manual only, and does not trigger outbound worker',()=>{
 assert.match(source,/sop_draft_review:\s*\n\s+if: github\.event_name == 'workflow_dispatch' && inputs\.mode == 'sop_draft_review'/);
 assert.match(source,/default: external_action_delivery/);
 assert.match(source,/persist-credentials: false/);
 assert.match(source,/permissions:\s*\n\s+contents: read/);
});
test('review never publishes a registry record or adds a schedule',()=>{
 const section=source.split(/\n  sop_draft_review:\n/)[1];
 assert.ok(section);
 assert.doesNotMatch(section,/dd_claim_external_actions|method: 'POST'|curl -X POST|airtable|merge|deploy/i);
 assert.match(section,/retention-days: 7/);
});
