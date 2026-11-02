import { test, expect } from '@playwright/test';
import { PRODUCT_NAME } from '../../src/constants';

test.describe.parallel('Anonymous user gated page access', () => {
  test('is redirected from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
    await expect(page.getByText(`Login to ${PRODUCT_NAME}`)).toBeVisible();
  });

  test('is redirected from private items to login', async ({ page }) => {
    await page.goto('/private-items');
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
    await expect(page.getByText(`Login to ${PRODUCT_NAME}`)).toBeVisible();
  });
});
