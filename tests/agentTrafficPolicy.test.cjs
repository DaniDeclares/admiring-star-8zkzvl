const assert = require('node:assert/strict');
const test = require('node:test');
const { evaluateAgentTraffic } = require('../lib/agentTrafficPolicy.cjs');
test('public discovery stays open for humans and unidentified assistants', () => {
  assert.equal(evaluateAgentTraffic({method:'GET',route:'partner-inquiry'}).action,'allow');
  assert.equal(evaluateAgentTraffic({method:'HEAD',identity:{claimedAgent:true}}).action,'allow');
});
test('client headers cannot assert signed agent identity', () => {
  const x=evaluateAgentTraffic({method:'POST',route:'partner-inquiry',identity:{claimedAgent:true,signatureValid:true,expiresValid:true,subject:'fake'}});
  assert.equal(x.classification,'unverified-agent');
  assert.equal(x.action,'verify');
});
test('trusted verification classifies agent but does not authorize payments', () => {
  const x=evaluateAgentTraffic({method:'POST',route:'create-checkout-session',identity:{source:'trusted-server-verifier',signatureValid:true,expiresValid:true,subject:'agent-1'}});
  assert.equal(x.classification,'verified-agent');
  assert.equal(x.action,'verify');
});
test('government and private actions remain independently governed', () => {
  for(const route of ['portal-operations','stripe-webhook','integrations/gmail/sync']) {
    assert.equal(evaluateAgentTraffic({method:'POST',route}).action,'verify');
  }
});
test('untrusted high scores never trigger an automatic block', () => {
  assert.equal(evaluateAgentTraffic({method:'POST',route:'partner-inquiry',risk:{suspectScore:100}}).action,'verify');
});
test('trusted high scores limit non-sensitive state-changing activity', () => {
  assert.equal(evaluateAgentTraffic({method:'POST',route:'partner-inquiry',risk:{suspectScore:85,scoreSource:'trusted-server-verifier'}}).action,'limit');
});
test('verified abuse blocks non-sensitive state-changing requests', () => {
  assert.equal(evaluateAgentTraffic({method:'POST',route:'partner-inquiry',risk:{explicitAbuse:true,abuseEvidenceVerified:true}}).action,'block');
});
test('unknown risk and absence of vendor data fail safely without false identity claims', () => {
  const x=evaluateAgentTraffic({method:'POST',route:'intake-webhook'});
  assert.deepEqual([x.classification,x.action],['unknown','verify']);
});
