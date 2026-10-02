#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('./auditAiGatewayCallSites.mjs', import.meta.url), 'utf8');

const required = [
  'openai_sdk',
  'ai_sdk',
  'anthropic_sdk',
  'google_genai',
  'generate_text',
  'stream_text',
  'generate_object',
  'embed',
  'use_chat',
  'ai_gateway_env',
  'provider_env',
  'REDACTED',
  'inventory_only_per_AI_GATEWAY_MIGRATION_AUDIT',
  'mutationsPerformed: false',
  'non_ai_credential',
  'self_tool_or_test',
  'actionableFindings',
  'suppressedFindings',
  'NON_AI_CREDENTIAL_RE',
  'SELF_PATH_RE',
];

for (const name of required) {
  assert.match(source, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${name} must appear in inventory script`);
}

assert.match(source, /SCAN_ROOTS/);
assert.match(source, /secretsPrinted:\s*false/);
assert.doesNotMatch(source, /process\.env\.(OPENAI_API_KEY|ANTHROPIC_API_KEY)\s*[^=]/);

console.log('AI Gateway call-site inventory static gate proof: PASS');
