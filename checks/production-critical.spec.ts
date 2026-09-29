import { test, expect } from '@playwright/test';

test.describe('DANI DECLARES production critical journeys', () => {
  test('@critical homepage renders', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DANI DECLARES LLC/i);
    await expect(page.locator('body')).toContainText('DANI DECLARES');
  });

  test('@critical service intake surface is reachable', async ({ page }) => {
    await page.goto('/request-service');
    await expect(page.locator('body')).toContainText(/request/i);
    await expect(page.locator('body')).toContainText(/service/i);
    await expect(page.locator('button[type="submit"]')).toContainText(/request service/i);
  });

  test('@critical signup validation surface is reachable', async ({ page }) => {
    await page.goto('/portal/access');
    await expect(page.locator('body')).toContainText('Service Provider');
    await expect(page.locator('body')).toContainText('Resident');
    await expect(page.locator('body')).toContainText(/already have an account|sign in/i);
  });

  test('@critical login surface is reachable', async ({ page }) => {
    await page.goto('/portal/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(/continue/i);
  });

  test('@critical catalog API is available', async ({ request }) => {
    const response = await request.get('/api/verify-commercial-intent?catalog=1');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(Array.isArray(body.services)).toBeTruthy();
    expect(body.services.length).toBeGreaterThan(0);
  });

  test('@critical service request API rejects incomplete payload safely', async ({ request }) => {
    const response = await request.post('/api/intake-webhook', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/name|contact/i);
  });

  test('@critical government page exposes procurement presentation without retail pricing', async ({ page }) => {
    await page.goto('/industries/government');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/Government|Institutional|Procurement/i);
    expect(body).not.toMatch(/\$\s?\d/);
    expect(body).not.toMatch(/Starting at\s+\$|From\s+\$/i);
  });
});
