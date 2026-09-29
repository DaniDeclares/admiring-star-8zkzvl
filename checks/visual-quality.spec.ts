import { test, expect, Page } from '@playwright/test';

const publicRoutes = ['/', '/request-service', '/portal/login', '/portal/access', '/industries/government'];

async function assertVisualHealth(page: Page, route: string) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  const response = await page.goto(route, { waitUntil: 'networkidle' });
  expect(response?.status(), route + ' should return a successful document').toBeLessThan(400);

  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/application error|something went wrong|cannot read properties|chunkloaderror/i);

  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const offenders = Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2);
      })
      .slice(0, 10)
      .map(el => ({ tag: el.tagName, text: (el.innerText || '').slice(0, 80), left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right }));
    return {
      viewportWidth: window.innerWidth,
      documentWidth: root.scrollWidth,
      overflow: root.scrollWidth > root.clientWidth + 2,
      offenders,
      h1Count: document.querySelectorAll('h1').length,
      unnamedButtons: Array.from(document.querySelectorAll('button')).filter(b => !(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length,
      imagesMissingAlt: Array.from(document.querySelectorAll('img')).filter(img => !img.hasAttribute('alt')).length,
    };
  });

  expect(metrics.overflow, route + ' has horizontal overflow: ' + JSON.stringify(metrics.offenders)).toBeFalsy();
  expect(metrics.unnamedButtons, route + ' has unlabeled buttons').toBe(0);
  expect(metrics.imagesMissingAlt, route + ' has images without alt attributes').toBe(0);
  expect(pageErrors, route + ' emitted page errors').toEqual([]);
  expect(consoleErrors.filter(e => !/favicon|third-party|hubspot/i.test(e)), route + ' emitted console errors').toEqual([]);
}

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
]) {
  test.describe('@visual ' + viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of publicRoutes) {
      test(route + ' visual health', async ({ page }) => {
        await assertVisualHealth(page, route);
        await expect(page).toHaveScreenshot(
          (route === '/' ? 'home' : route.replace(/^\//, '').replaceAll('/', '-')) + '-' + viewport.name + '.png',
          { fullPage: true, animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.02 }
        );
      });
    }
  });
}
