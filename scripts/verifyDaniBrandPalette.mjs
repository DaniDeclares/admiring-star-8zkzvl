// Contract for the owner-approved DANI Home Command Center visual palette.
// Prevent accidentally changing global colors without an intentional brand approval.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(resolve(root, 'src/index.css'), 'utf8');
const expected = {
  '--dd-burgundy': '#800020',
  '--dd-burgundy-deep': '#69001A',
  '--dd-ivory': '#F7F1E6',
  '--dd-cream': '#FFFDF6',
  '--dd-gold': '#B38A2D',
  '--dd-gold-soft': '#E8D5B0'
};
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1];
if (!rootBlock) throw new Error('DANI global :root brand tokens are missing');
for (const [token, color] of Object.entries(expected)) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = rootBlock.match(new RegExp('(?:^|\\n)\\s*' + escaped + '\\s*:\\s*(#[0-9a-fA-F]{6})\\s*;', 'i'));
  if (!match || match[1].toUpperCase() !== color.toUpperCase()) {
    throw new Error('Canonical DANI palette mismatch for ' + token + ': expected ' + color + ', found ' + (match?.[1] ?? 'missing'));
  }
}
console.log('DANI brand tokens match the owner-approved Home Command Center palette.');
