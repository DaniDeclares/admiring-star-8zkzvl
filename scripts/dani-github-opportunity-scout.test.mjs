#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('./dani-github-opportunity-scout.mjs', import.meta.url),'utf8');
const required=['sourceUrl','mirror','payoutRisk','opire','issuehunt','algora','nonOpportunity','explicitlyUnfunded','asyncFriendly','synchronousRequired'];
for(const name of required){
  assert.match(source,new RegExp('const\\s+'+name+'\\s*='),name+' must be defined');
}
assert.match(source,/REJECT_NOT_CURRENTLY_PAYABLE/);
assert.match(source,/REJECT_CURRENT_WORK_MODE_CONSTRAINT/);
assert.match(source,/VERIFY_PAYER_HISTORY_BEFORE_BUILD/);
assert.match(source,/funding_state:/);
assert.match(source,/work_mode_state:/);
assert.match(source,/auto_claim_allowed:false/);
assert.match(source,/auto_contact_allowed:false/);
assert.match(source,/auto_crm_create_allowed:false/);
console.log('DANI GitHub Opportunity Scout static gate proof: PASS');
