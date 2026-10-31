import { test, expect } from '@playwright/test';

const voci = ['Prodotti', 'Hexaplay', 'Servizi', 'Realizzazioni', 'Chi siamo', 'News'];

test('header con navigazione e pulsante preventivo', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Principale' });
  for (const v of voci) await expect(nav.getByRole('link', { name: v, exact: true })).toBeVisible();
  await expect(page.getByRole('banner').getByRole('button', { name: /Richiedi preventivo/ })).toBeVisible();
  await expect(page.getByRole('banner').getByRole('button', { name: /Richiedi preventivo/ })).toContainText('Richiedi preventivo');
  await expect(page.getByRole('banner').getByRole('link', { name: 'Richiedi preventivo' })).toBeHidden();
});

test('footer con i contatti', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText('Reggio Emilia');
  await expect(footer).toContainText('Porto Viro');
  await expect(footer.getByRole('link', { name: /@/ })).toBeVisible();
});

test('link salta al contenuto visibile al focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const salta = page.getByRole('link', { name: 'Salta al contenuto' });
  await expect(salta).toBeFocused();
  await expect(salta).toBeInViewport();
});

test('menu mobile si apre con aria-expanded', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const btn = page.getByRole('button', { name: 'Menu' });
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Principale' }).getByRole('link', { name: 'Prodotti', exact: true })).toBeVisible();
});
