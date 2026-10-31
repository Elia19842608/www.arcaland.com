import { test, expect } from '@playwright/test';

test('scheda completa', async ({ page }) => {
  await page.goto('/prodotti/9-hp150-00');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hexaplay torre 150');
  await expect(page.getByText('9.HP150.00').first()).toBeVisible();
  const galleria = page.getByRole('region', { name: 'Immagini' });
  await expect(galleria.getByText('Render').first()).toBeVisible();
  await expect(galleria.getByRole('button', { name: /foto reale/ })).toBeVisible();
  const dati = page.getByRole('table', { name: 'Dati tecnici' });
  await expect(dati).toContainText('Altezza di caduta');
  await expect(dati).toContainText('1,50 m');
  await expect(dati).toContainText('3–12 anni');
  await expect(page.getByRole('img', { name: /Area di sicurezza 7,00 × 5,00 m/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Scheda tecnica PDF' })).toHaveAttribute('href', '/media/prova/scheda.pdf');
  await expect(page.getByRole('link', { name: 'Certificato EN 1176 PDF' })).toHaveAttribute('href', '/media/prova/certificato.pdf');
  await expect(page.getByRole('button', { name: 'Aggiungi alla richiesta' })).toBeVisible();
  await expect(page.getByLabel('Quantità')).toHaveValue('1');
});

test('scheda minima senza buchi', async ({ page }) => {
  await page.goto('/prodotti/5-pa100-00');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Panchina con schienale');
  const testo = await page.locator('main').innerText();
  expect(testo).not.toMatch(/N\/D|undefined|null|NaN/);
  await expect(page.getByRole('img', { name: /Area di sicurezza/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Documenti' })).toHaveCount(0);
});

test('titolo, descrizione e dati strutturati', async ({ page }) => {
  await page.goto('/prodotti/1-al200-01');
  await expect(page).toHaveTitle('Altalena doppia in acciaio · Arcaland');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toContain('1.AL200.01');
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(ld['@type']).toBe('Product');
  expect(ld.sku).toBe('1.AL200.01');
  expect(ld.offers).toBeUndefined();
});

test('prodotti simili della stessa tipologia', async ({ page }) => {
  await page.goto('/prodotti/9-hp150-00');
  await expect(page.getByRole('heading', { name: 'Della stessa tipologia' })).toHaveCount(0);
});

test('i prodotti disattivati non hanno una pagina', async ({ page }) => {
  const r = await page.goto('/prodotti/1-old-00');
  expect(r?.status()).toBe(404);
});
