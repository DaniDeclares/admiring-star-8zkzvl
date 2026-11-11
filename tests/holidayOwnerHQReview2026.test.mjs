import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
test('authenticated owner snapshot exposes the holiday classification along with Gmail source IDs',()=>{
 const api=readFileSync(new URL('api-handlers/portal-operations.js',root),'utf8');
 assert.match(api,/external_message_id,external_thread_id,sender_address,subject,relationship_type,provider_id,priority,requires_attention,attention_reason,classification,received_at,created_at/);
 assert.match(api,/getOwnerControlSnapshot/);
});
test('owner inbox distinguishes source email, candidate review, website consent and unapproved partner',()=>{
 const ui=readFileSync(new URL('src/pages/portal/OwnerHQPage.jsx',root),'utf8');
 assert.match(ui,/item\.classification\?\.holiday_mission\?\.intent==='ORGANIZATION_RESOURCE_OFFER'/);
 assert.match(ui,/Gmail thread:/);
 assert.match(ui,/email is not website consent/);
 assert.match(ui,/candidate_intake_id/);
 assert.match(ui,/Not an approved partner/);
});
