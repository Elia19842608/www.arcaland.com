import { test, expect, type Page } from '@playwright/test';

const tessere = (page: Page) => page.locator('[data-tessera]:visible');

test('mostra i prodotti attivi e nasconde i disattivati', async ({ page }) => {
  await page.goto('/prodotti');
  await expect(tessere(page)).toHaveCount(5);
  await expect(page.getByText('Vecchio scivolo')).toHaveCount(0);
});

test('linea giochi', async ({ page }) => {
  await page.goto('/prodotti');
  await page.getByRole('button', { name: 'Giochi', exact: true }).click();
  await expect(tessere(page)).toHaveCount(3);
  await expect(page).toHaveURL(/linea=giochi/);
});

test('filtro materiale aggiorna risultati e URL', async ({ page }) => {
  await page.goto('/prodotti');
  await page.getByRole('button', { name: 'Acciaio', exact: true }).click();
  await expect(tessere(page)).toHaveCount(1);
  await expect(tessere(page).first()).toContainText('Altalena doppia in acciaio');
  await expect(page).toHaveURL(/materiale=acciaio/);
  await expect(page.getByRole('status')).toContainText('1 prodotto');
});

test('spazio dall’URL con la virgola', async ({ page }) => {
  await page.goto('/prodotti?spazio=7,5x6');
  await expect(tessere(page)).toHaveCount(3);
  await expect(page.getByLabel('Lunghezza dello spazio in metri')).toHaveValue('7.5');
});

test('spazio digitato nel campo', async ({ page }) => {
  await page.goto('/prodotti');
  await page.getByLabel('Lunghezza dello spazio in metri').fill('4');
  await page.getByLabel('Larghezza dello spazio in metri').fill('3');
  await expect(tessere(page)).toHaveCount(1);
  await expect(tessere(page).first()).toContainText('Stazione addominali');
});

test('parametri non validi ignorati senza errori', async ({ page }) => {
  const errori: string[] = [];
  page.on('pageerror', (e) => errori.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errori.push(m.text()));
  await page.goto('/prodotti?eta=abc&materiale=plastica');
  await expect(tessere(page)).toHaveCount(5);
  expect(errori).toEqual([]);
});

test('nessun risultato e azzera filtri', async ({ page }) => {
  await page.goto('/prodotti?spazio=1x1');
  await expect(page.getByText('Nessun prodotto con questi filtri')).toBeVisible();
  await page.getByRole('button', { name: 'Azzera filtri' }).first().click();
  await expect(tessere(page)).toHaveCount(5);
  await expect(page).toHaveURL(/\/prodotti\/?$/);
});

test('aggiungi alla richiesta ha un nome accessibile', async ({ page }) => {
  await page.goto('/prodotti');
  await expect(page.getByRole('link', { name: 'Aggiungi Panchina con schienale alla richiesta' })).toHaveAttribute('href', '/richiesta');
});

test('pannello filtri su mobile da tastiera', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/prodotti');
  const apri = page.getByRole('button', { name: /^Filtri/ });
  await expect(page.getByRole('button', { name: 'Acciaio', exact: true })).toBeHidden();
  await apri.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Acciaio', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Acciaio', exact: true })).toBeHidden();
  await expect(apri).toBeFocused();
});

test('con lo spazio attivo dice per quanti prodotti c’è l’area di sicurezza', async ({ page }) => {
  await page.goto('/prodotti?spazio=7,5x6');
  await expect(page.getByText('Area di sicurezza indicata per 4 prodotti su 5')).toBeVisible();
  await page.getByRole('button', { name: 'Azzera filtri' }).first().click();
  await expect(page.getByText(/Area di sicurezza indicata per/)).toBeHidden();
});
