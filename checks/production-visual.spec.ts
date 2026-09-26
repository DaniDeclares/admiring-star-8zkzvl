import { test, expect, devices } from '@playwright/test';

const publicRoutes = [
  '/',
  '/request-service',
  '/portal/access',
  '/portal/login',
  '/industries/government',
];

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
];

for (const viewport of viewports) {
  test.describe(`@critical @visual production visual guard - ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of publicRoutes) {
      test(`${route} renders without horizontal overflow or broken shell`, async ({ page }) => {
        const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
        expect(response?.status(), `HTTP status for ${route}`).toBeLessThan(500);

        await expect(page.locator('body')).toBeVisible();
        await page.waitForLoadState('networkidle').catch(() => {});

        const metrics = await page.evaluate(() => ({
          bodyWidth: document.body.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
          bodyText: document.body.innerText.trim().length,
          images: Array.from(document.images).map((img) => ({
            src: img.currentSrc || img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
          })),
        }));

        expect(metrics.bodyText, 'page should render meaningful content').toBeGreaterThan(20);
        expect(
          metrics.bodyWidth,
          `horizontal overflow on ${route} at ${viewport.width}px`,
        ).toBeLessThanOrEqual(metrics.viewportWidth + 2);

        const brokenImages = metrics.images.filter(
          (img) => img.src && img.complete && img.naturalWidth === 0,
        );
        expect(brokenImages, `broken images on ${route}`).toEqual([]);

        await page.screenshot({
          path: `test-results/visual-${viewport.name}-${route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}.png`,
          fullPage: true,
        });
      });
    }
  });
}
