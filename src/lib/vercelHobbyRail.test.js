const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const router = fs.readFileSync(path.join(root, 'api/router.js'), 'utf8');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

// Vercel ignores files and folders whose name starts with "_" when creating functions.
const isFunctionEntrypoint = file => /\.(js|mjs|cjs|ts)$/.test(file)
  && !path.relative(path.join(root, 'api'), file).split(path.sep).some(part => part.startsWith('_'));

describe('Vercel Hobby production rail', () => {
  test('api/ stays within the Hobby limit of 12 functions per deployment', () => {
    const entrypoints = walk(path.join(root, 'api')).filter(isFunctionEntrypoint);
    expect(entrypoints.length).toBeLessThanOrEqual(12);
  });

  test('every handler module is reachable through the router', () => {
    const handlers = walk(path.join(root, 'api-handlers'))
      .map(file => path.relative(path.join(root, 'api-handlers'), file).split(path.sep).join('/'))
      .filter(rel => rel.endsWith('.js') && !rel.split('/').some(part => part.startsWith('_')))
      .filter(rel => fs.readFileSync(path.join(root, 'api-handlers', rel), 'utf8').includes('export default'))
      .map(rel => rel.replace(/\.js$/, ''));
    expect(handlers.length).toBeGreaterThan(0);
    for (const route of handlers) {
      expect(router).toContain(`'${route}': () => import('../api-handlers/${route}.js')`);
    }
  });

  test('netlify.toml aliases are answered by the router too', () => {
    expect(router).toContain("'portal-fulfillment': 'portal-fulfillment-dispatch'");
    expect(router).toContain("'portal-dispatch': 'provider-routing'");
  });

  test('/api requests are rewritten to the router', () => {
    const rewrite = vercel.rewrites.find(r => r.source === '/api/:path*');
    expect(rewrite.destination).toBe('/api/router?__dani_route=:path*');
    const apiIndex = vercel.rewrites.indexOf(rewrite);
    const spaIndex = vercel.rewrites.findIndex(r => r.source === '/:path*');
    expect(apiIndex).toBeLessThan(spaIndex);
  });

  test('cron jobs run at most once per day, the Hobby minimum interval', () => {
    for (const cron of vercel.crons || []) {
      const [minute, hour] = cron.schedule.trim().split(/\s+/);
      expect(minute).toMatch(/^\d+$/);
      expect(hour).toMatch(/^\d+$/);
    }
  });
});
