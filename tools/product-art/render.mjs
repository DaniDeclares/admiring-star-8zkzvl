// Renders original badge-style print artwork (4500x5400 transparent PNG) for every merch concept.
// Usage: node tools/product-art/render.mjs <outDir> [filterSubstring]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { icons } from './icons.mjs';
import { designs, PALETTES } from './designs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.argv[2] || 'out');
const filter = process.argv[3] || '';
fs.mkdirSync(outDir, { recursive: true });
const W = 4500, H = 5400;
const fontCss = ['Shrikhand:Shrikhand.ttf', 'Alfa Slab One:AlfaSlabOne.ttf', 'Oswald:Oswald-var.ttf']
  .map(s => { const [f, file] = s.split(':'); return `@font-face{font-family:'${f}';src:url('${pathToFileURL(path.join(here, 'fonts', file))}');${f==='Oswald'?'font-weight:200 700;':''}}`; }).join('');

const page_html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss} html,body{margin:0;background:transparent}</style></head><body><div id="root"></div></body></html>`;
const htmlPath = path.join(outDir, '_render.html');
fs.writeFileSync(htmlPath, page_html);

const iconSrc = Object.fromEntries(Object.entries(icons).map(([k, f]) => [k, f.toString()]));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlPath).href);
await page.evaluate(async () => { await Promise.all(["120px Shrikhand", "120px 'Alfa Slab One'", "700 120px Oswald"].map(f => document.fonts.load(f))); });

const list = designs().filter(d => !filter || d.key.includes(filter) || d.slogan.includes(filter));
const report = [];
for (const d of list) {
  const pal = PALETTES[d.season];
  const info = await page.evaluate(({ d, pal, iconSrc, W, H }) => {
    const icons = {}; for (const [k, s] of Object.entries(iconSrc)) icons[k] = eval('(' + s + ')');
    const ctx = document.createElement('canvas').getContext('2d');
    const measure = (t, size, fam) => { ctx.font = `${size}px ${fam}`; return ctx.measureText(t).width; };
    const parts = d.slogan.split(' — ');
    const main = parts[0], sub = parts[1] || null;
    const PROT = ['Real Estate','Pumpkin Spice','Pending Contracts','Signing Table','Post Office','North Pole','Holiday Chaos','Fully Signed','Clear to Close','Dirty Floors','Perfect Signing','New Listings','Haunted by','Boo Crew','Villain Origin Story','Sparkling Floors','Pumpkin Obsessed','Fresh Cleans','Winter Goals','Other Side','Pending Closings','Feeling Festive','Baseboards White'];
    let mainP = main; for (const ph of PROT) mainP = mainP.split(ph).join(ph.replace(/ /g, '\u00a0'));
    const words = mainP.split(' ');
    const maxW = 3500, maxH = sub ? 1500 : 1900;
    let best = null;
    // brute-force line breaks (up to 4 lines) and pick the largest readable font size
    const splits = (n, start) => n === 1 ? [[words.slice(start)]] : [].concat(...Array.from({ length: words.length - start - n + 1 }, (_, i) => splits(n - 1, start + i + 1).map(r => [words.slice(start, start + i + 1), ...r])));
    for (let n = 1; n <= Math.min(4, words.length); n++) {
      for (const parts2 of splits(n, 0)) {
        const lines = parts2.map(w => w.join(' '));
        let size = 520;
        while (size > 120) {
          const widest = Math.max(...lines.map(l => measure(l, size, 'Shrikhand')));
          if (widest <= maxW && lines.length * size * 1.06 <= maxH) break;
          size -= 4;
        }
        const widest = Math.max(...lines.map(l => measure(l, size, 'Shrikhand')));
        const orphan = lines.some(l => l.replace(/\u00a0/g,' ').length < 6) ? 140 : 0;
        const score = size - (lines.length - 1) * 30 - orphan - (widest < 1500 ? 40 : 0);
        if (!best || score > best.score) best = { lines, size, score, widest };
      }
    }
    const { lines: linesRaw, size } = best; const lines = linesRaw.map(l => l.replace(/\u00a0/g, ' '));
    const lh = size * 1.06;
    
    const textBlockH = lines.length * lh + (sub ? 260 : 0);
    const iconTop = 640, iconBottom = 2080;
    const textTop = 2480 + Math.max(0, (1980 - textBlockH) / 2);
    const emph = lines.length >= 3 ? 1 : lines.length - 1;
    const g = (name, x, y, s, rot = 0) => `<g transform="translate(${x - s / 2} ${y - s / 2}) rotate(${rot} ${s / 2} ${s / 2}) scale(${s / 200})">${icons[name](pal)}</g>`;
    const cx = W / 2;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
    // badge
    svg += `<rect x="190" y="150" width="${W - 380}" height="${H - 300}" rx="520" fill="${pal.cream}" stroke="${pal.ink}" stroke-width="46"/>`;
    svg += `<rect x="290" y="250" width="${W - 580}" height="${H - 500}" rx="440" fill="none" stroke="${pal.a1}" stroke-width="16"/>`;
    svg += `<rect x="330" y="290" width="${W - 660}" height="${H - 580}" rx="410" fill="none" stroke="${pal.ink}" stroke-width="6" stroke-dasharray="2 26" stroke-linecap="round"/>`;
    // profession ribbon
    const label = d.profession.replace(' / ', ' & ').toUpperCase();
    ctx.font = '700 150px Oswald'; ctx.letterSpacing = '24px';
    const lw = Math.min(3300, ctx.measureText(label).width + 260);
    svg += `<rect x="${cx - lw / 2}" y="420" width="${lw}" height="230" rx="115" fill="${pal.ribbon}" stroke="${pal.ink}" stroke-width="22"/>`;
    svg += `<text x="${cx}" y="575" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="150" letter-spacing="24" fill="${pal.ribbonText}">${label.replace(/&/g, '&amp;')}</text>`;
    // icons
    svg += g(d.left, cx - 1380, 1880, 980, -10);
    svg += g(d.right, cx + 1380, 1880, 980, 10);
    svg += g(d.main, cx, 1560, 1480);
    svg += g(d.deco[0], cx - 1500, 1000, 360, -8) + g(d.deco[1], cx + 1500, 1000, 360, 8);
    // slogan
    let y = textTop + size * 0.82;
    lines.forEach((l, i) => {
      const fill = i === emph ? pal.a1 : pal.ink;
      const t = l.replace(/&/g, '&amp;');
      svg += `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Shrikhand" font-size="${size}" fill="${pal.ink}" stroke="${pal.cream}" stroke-width="0" >${''}</text>`;
      svg += `<text x="${cx + size * 0.018}" y="${y + size * 0.018}" text-anchor="middle" font-family="Shrikhand" font-size="${size}" fill="${pal.ink}" opacity=".18">${t}</text>`;
      svg += `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Shrikhand" font-size="${size}" fill="${fill}" stroke="${pal.ink}" stroke-width="${size * 0.012}" paint-order="stroke">${t}</text>`;
      y += lh;
    });
    if (sub) {
      let ss = 250; while (measure(sub, ss, "'Alfa Slab One'") > 3200 && ss > 100) ss -= 4;
      svg += `<text x="${cx}" y="${y + 120}" text-anchor="middle" font-family="Alfa Slab One" font-size="${ss}" fill="${pal.ink}">${sub.replace(/&/g, '&amp;')}</text>`;
    }
    // footer flourish
    const fy = H - 560;
    svg += `<path d="M${cx - 1400} ${fy} L${cx - 260} ${fy} M${cx + 260} ${fy} L${cx + 1400} ${fy}" stroke="${pal.ink}" stroke-width="14" stroke-linecap="round"/>`;
    svg += `<path transform="translate(${cx - 90} ${fy - 90}) scale(.9)" d="M100 10 C104 70 130 96 190 100 C130 104 104 130 100 190 C96 130 70 104 10 100 C70 96 96 70 100 10Z" fill="${pal.a3}" stroke="${pal.ink}" stroke-width="6"/>`;
    svg += `<text x="${cx}" y="${fy + 250}" text-anchor="middle" font-family="Oswald" font-weight="500" font-size="120" letter-spacing="30" fill="${pal.ink}">${pal.edition}</text>`;
    svg += `</svg>`;
    document.getElementById('root').innerHTML = svg;
    return { lines, size, widest: best.widest, textBottom: textTop + lines.length * lh + (sub ? 260 : 0) };
  }, { d, pal, iconSrc, W, H });
  const file = path.join(outDir, d.key + '.png');
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
  report.push({ key: d.key, slogan: d.slogan, ...info, file: path.basename(file) });
  console.log(d.key, info.lines.length + ' lines', info.size + 'px', 'bottom', Math.round(info.textBottom));
}
fs.writeFileSync(path.join(outDir, '_report.json'), JSON.stringify(report, null, 1));
await browser.close();
fs.unlinkSync(htmlPath);
