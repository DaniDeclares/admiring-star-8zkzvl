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

test.describe('DANI DECLARES safe authentication monitoring', () => {
  test('@critical provider signup validates required fields without creating an account', async ({ page }) => {
    await page.goto('/portal/access');
    await page.getByText('Service Provider', { exact: true }).click();
    await expect(page.getByText('First name', { exact: true })).toBeVisible();
    expect(await page.locator('form input[required]').count()).toBeGreaterThan(0);
  });

  test('@critical portal login is available without submitting credentials', async ({ page }) => {
    await page.goto('/portal/login');
    await expect(page.getByRole('heading', { name: /access your DANI DECLARES account/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('@critical governed catalog endpoint responds', async ({ request }) => {
    const response = await request.get('/api/verify-commercial-intent?catalog=1');
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ success: true });
  });
});
