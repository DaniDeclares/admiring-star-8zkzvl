import { test, expect } from '@playwright/test';

test.describe('DANI DECLARES production critical journeys', () => {
  test('@critical homepage renders', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DANI DECLARES LLC/i);
    await expect(page.locator('body')).toContainText('DANI DECLARES');
  });

  test('@critical service intake is reachable', async ({ page }) => {
    await page.goto('/request-service');
    await expect(page.locator('body')).toContainText(/request/i);
    await expect(page.locator('body')).toContainText(/service/i);
  });

  test('@critical portal signup surface is reachable', async ({ page }) => {
    await page.goto('/portal/access');
    await expect(page.locator('body')).toContainText('Service Provider');
    await expect(page.locator('body')).toContainText('Resident');
  });

  test('@critical government page exposes procurement presentation without retail pricing', async ({ page }) => {
    await page.goto('/industries/government');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/Government|Institutional|Procurement/i);
    expect(body).not.toMatch(/\$\s?\d/);
    expect(body).not.toMatch(/Starting at\s+\$|From\s+\$/i);
  });
});
