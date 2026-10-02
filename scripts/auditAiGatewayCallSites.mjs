#!/usr/bin/env node
/**
 * AI Gateway call-site inventory.
 *
 * Implements the inventory step required by AI_GATEWAY_MIGRATION_AUDIT.md.
 * Documentation-only until this inventory is complete.
 *
 * Safety:
 * - Read-only scan of the repository.
 * - Never prints secret values (only env var *names*).
 * - Does not change models, credentials, pricing, or commercial gates.
 * - Exit 0 with findings is success (inventory produced).
 * - Exit 1 only on I/O or unexpected scan failure.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const outputPath =
  process.env.AI_GATEWAY_INVENTORY_OUTPUT ||
  path.join(root, 'tmp', 'ai-gateway-callsite-inventory.json');

const SCAN_ROOTS = ['api', 'src', 'lib', 'scripts', 'netlify', 'supabase/functions', 'checks'];
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const IGNORE_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  'build',
  'dist',
  'coverage',
  'tmp',
  '.next',
]);

/** Patterns drawn from AI_GATEWAY_MIGRATION_AUDIT.md required inventory. */
const PATTERNS = [
  { id: 'openai_sdk', re: /\bfrom\s+['"]openai['"]|require\(['"]openai['"]\)|\bOpenAI\b/g, kind: 'provider_sdk' },
  { id: 'ai_sdk', re: /@ai-sdk\/[\w-]+/g, kind: 'provider_sdk' },
  { id: 'anthropic_sdk', re: /@anthropic-ai\/sdk|\bfrom\s+['"]@anthropic-ai/g, kind: 'provider_sdk' },
  { id: 'google_genai', re: /@google\/genai|\bGoogleGenerativeAI\b/g, kind: 'provider_sdk' },
  { id: 'generate_text', re: /\bgenerateText\s*\(/g, kind: 'generation' },
  { id: 'stream_text', re: /\bstreamText\s*\(/g, kind: 'generation' },
  { id: 'generate_object', re: /\bgenerateObject\s*\(/g, kind: 'generation' },
  { id: 'embed', re: /\bembed(Many)?\s*\(/g, kind: 'embedding' },
  { id: 'rerank', re: /\brerank\s*\(/g, kind: 'generation' },
  { id: 'use_chat', re: /\buseChat\s*\(/g, kind: 'client_hook' },
  { id: 'base_url', re: /\bbaseURL\b|\bbase_url\b/g, kind: 'config' },
  { id: 'api_key_literal', re: /\bapiKey\s*[:=]|\bapi_key\s*[:=]/g, kind: 'credential_shape' },
  { id: 'openrouter', re: /\bopenrouter\b|openrouter\.ai/gi, kind: 'gateway' },
  { id: 'litellm', re: /\blitellm\b/gi, kind: 'gateway' },
  { id: 'portkey', re: /\bportkey\b/gi, kind: 'gateway' },
  { id: 'helicone', re: /\bhelicone\b/gi, kind: 'gateway' },
  { id: 'ai_gateway_env', re: /\bAI_GATEWAY_API_KEY\b|\bVERCEL_OIDC\b/g, kind: 'credential_env' },
  { id: 'provider_env', re: /\bOPENAI_API_KEY\b|\bANTHROPIC_API_KEY\b|\bGOOGLE_GENERATIVE_AI_API_KEY\b|\bGEMINI_API_KEY\b/g, kind: 'credential_env' },
];

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (IGNORE_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

function scanContent(relPath, content) {
  const hits = [];
  for (const pattern of PATTERNS) {
    pattern.re.lastIndex = 0;
    let match;
    while ((match = pattern.re.exec(content)) !== null) {
      const before = content.slice(0, match.index);
      const line = before.split('\n').length;
      const lineStart = before.lastIndexOf('\n') + 1;
      const lineEnd = content.indexOf('\n', match.index);
      const lineText = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();
      // Never capture values that look like secrets — only the matched token + line shape.
      const safeSnippet = lineText
        .replace(/(['"`])[A-Za-z0-9_\-]{20,}\1/g, '$1[REDACTED]$1')
        .replace(/(sk-|key-|Bearer\s+)[A-Za-z0-9_\-.]{8,}/gi, '$1[REDACTED]');
      hits.push({
        patternId: pattern.id,
        kind: pattern.kind,
        file: relPath,
        line,
        matched: match[0].slice(0, 80),
        lineSnippet: safeSnippet.slice(0, 160),
      });
      // Avoid infinite loops on zero-length matches
      if (match[0].length === 0) pattern.re.lastIndex += 1;
    }
  }
  return hits;
}

async function main() {
  const findings = [];
  const scannedFiles = [];

  for (const relRoot of SCAN_ROOTS) {
    const abs = path.join(root, relRoot);
    for await (const file of walk(abs)) {
      const rel = path.relative(root, file).replace(/\\/g, '/');
      scannedFiles.push(rel);
      const content = await fs.readFile(file, 'utf8');
      findings.push(...scanContent(rel, content));
    }
  }

  // Also scan root config files that may hold env references
  for (const extra of ['.env.example', 'netlify.toml', 'package.json']) {
    const abs = path.join(root, extra);
    try {
      const content = await fs.readFile(abs, 'utf8');
      scannedFiles.push(extra);
      findings.push(...scanContent(extra, content));
    } catch {
      // optional
    }
  }

  const byKind = findings.reduce((acc, f) => {
    acc[f.kind] = (acc[f.kind] || 0) + 1;
    return acc;
  }, {});
  const byPattern = findings.reduce((acc, f) => {
    acc[f.patternId] = (acc[f.patternId] || 0) + 1;
    return acc;
  }, {});
  const byFile = findings.reduce((acc, f) => {
    acc[f.file] = (acc[f.file] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    generatedAt: new Date().toISOString(),
    safety: {
      mutationsPerformed: false,
      secretsPrinted: false,
      commercialLogicTouched: false,
      purpose: 'inventory_only_per_AI_GATEWAY_MIGRATION_AUDIT',
    },
    scanRoots: SCAN_ROOTS,
    filesScanned: scannedFiles.length,
    findingCount: findings.length,
    counts: { byKind, byPattern, filesWithHits: Object.keys(byFile).length },
    filesWithHits: Object.keys(byFile).sort(),
    findings,
    nextSteps: [
      'Review findings; resolve each against current Vercel AI Gateway catalog before any migration.',
      'Do not change model IDs or credential routing until inventory is owner-reviewed.',
      'Embeddings stay on current provider unless a reindexing plan is approved.',
    ],
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        outputPath,
        filesScanned: payload.filesScanned,
        findingCount: payload.findingCount,
        counts: payload.counts,
        filesWithHits: payload.filesWithHits,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
