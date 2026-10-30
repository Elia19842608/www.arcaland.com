import { test, expect } from '@playwright/test';

test('le sezioni non ancora pronte mostrano una pagina curata', async ({ page }) => {
  const r = await page.goto('/hexaplay');
  expect(r?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Questa pagina non c’è ancora');
  await expect(page.getByRole('main').getByRole('link', { name: 'Vai al catalogo' })).toHaveAttribute('href', '/prodotti');
  await expect(page.getByRole('navigation', { name: 'Principale' })).toBeVisible();
});
