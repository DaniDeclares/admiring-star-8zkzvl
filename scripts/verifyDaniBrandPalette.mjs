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

// The JavaScript metadata and compatibility tokens previously drifted away
// from the public site's CSS. Verify they agree on every build.
const brand = readFileSync(resolve(root, 'src/data/brandKit.js'), 'utf8');
const legacy = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');
const expectedMetadata = {
  burgundy: expected['--dd-burgundy'],
  burgundyDark: expected['--dd-burgundy-deep'],
  ivory: expected['--dd-ivory'],
  cream: expected['--dd-cream'],
  gold: expected['--dd-gold'],
  goldLight: expected['--dd-gold-soft']
};
for (const [key, value] of Object.entries(expectedMetadata)) {
  const pattern = new RegExp('\\\\b' + key + '\\\\s*:\\\\s*[\\\"\\\'](#[0-9a-fA-F]{6})[\\\"\\\']');
  const match = brand.match(pattern);
  if (!match || match[1].toUpperCase() !== value.toUpperCase()) {
    throw new Error('BRAND_KIT colors.' + key + ' must match canonical CSS ' + value);
  }
}
for (const [alias, canonical] of [
  ['--color-burgundy', '--dd-burgundy'],
  ['--color-ivory', '--dd-ivory'],
  ['--color-gold', '--dd-gold']
]) {
  if (!legacy.includes(alias + ': var(' + canonical + ');')) {
    throw new Error('Legacy token ' + alias + ' must reference ' + canonical);
  }
}
// Brand colors do not automatically create accessible foreground pairings.
// Burgundy on both approved light surfaces is text-safe; gold is accent-only
// for standard-sized text. Fail if changed values break these guarantees.
function relativeLuminance(hex) {
  const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(first, second) {
  const a = relativeLuminance(first), b = relativeLuminance(second);
  return (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05);
}
for (const surface of [expected['--dd-ivory'], expected['--dd-cream']]) {
  if (contrast(expected['--dd-burgundy'],surface) < 4.5) {
    throw new Error('Burgundy/surface combination fails normal-text contrast');
  }
}
if (contrast(expected['--dd-gold'], expected['--dd-cream']) >= 4.5) {
  console.log('Gold now qualifies for normal text on paper, recheck design rules.');
} else {
  console.log('Antique gold is accent-only for regular text on paper/ivory.');
}
console.log('DANI brand CSS, metadata, aliases and contrast requirements verified.');

