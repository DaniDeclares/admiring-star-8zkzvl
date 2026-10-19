import test from 'node:test';
import assert from 'node:assert/strict';
import { emailAddresses, messageReceipt } from '../api-handlers/integrations/gmail/_messageReceipt.mjs';

const fixture = overrides => ({ id: 'gmail-1', threadId: 'thread-1', internalDate: '1792431919000', labelIds: ['SENT'], payload: { headers: [
  { name: 'From', value: 'Dani <vendors@danideclares.com>' },
  { name: 'To', value: '"Manager, One" <one@example.com>' },
  { name: 'Cc', value: 'ONE@example.com, two@example.com' },
  { name: 'Bcc', value: 'three@example.com' },
] }, ...overrides });
const receipt = message => messageReceipt(message, 'vendors@danideclares.com', 'connection-1');

test('drafts never become contact attempts even when From is the owner', () => {
  assert.equal(receipt(fixture({ labelIds: ['DRAFT'] })), null);
  assert.equal(receipt(fixture({ labelIds: ['DRAFT', 'SENT'] })), null);
});
test('an own-address message without SENT does not prove a send', () => {
  assert.equal(receipt(fixture({ labelIds: [] })), null);
});
test('normalizes quoted display names and deduplicates To/Cc/Bcc', () => {
  assert.deepEqual(receipt(fixture()).p_recipient_addresses, ['one@example.com','two@example.com','three@example.com']);
  assert.deepEqual(emailAddresses('"Last, First" <USER@example.com>'), ['user@example.com']);
});
test('SENT aliases remain outbound and retain their actual timestamp', () => {
  const result = receipt(fixture({ payload: { headers: [{ name:'From', value:'sales@danideclares.com' }] } }));
  assert.equal(result.p_direction, 'OUTBOUND');
  assert.equal(result.p_received_at, '2026-10-19T17:45:19.000Z');
  assert.equal(result.p_raw_metadata.receipt_basis, 'GMAIL_SENT_LABEL');
});
test('inbound messages preserve direction and external identity', () => {
  const result = receipt(fixture({ labelIds:['INBOX'], payload:{headers:[{name:'From',value:'buyer@example.com'}]} }));
  assert.equal(result.p_direction, 'INBOUND');
  assert.equal(result.p_external_message_id, 'gmail-1');
});
test('missing or invalid chronology fails closed instead of inventing now', () => {
  for (const internalDate of [undefined, '', 'invalid', '-1', '1e100']) {
    assert.throws(() => receipt(fixture({internalDate})), /GMAIL_MESSAGE_RECEIPT_INCOMPLETE/);
  }
});
test('replays retain the existing message-based idempotency identity', () => {
  assert.deepEqual(receipt(fixture()), receipt(fixture()));
});
