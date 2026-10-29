import { test, expect } from '@playwright/test';

test('la home risponde ed è in italiano', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
});
