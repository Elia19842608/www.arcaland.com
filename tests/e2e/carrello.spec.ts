import { test, expect, type Page } from '@playwright/test';

const contatore = (page: Page) => page.getByRole('banner').getByRole('button', { name: /Richiedi preventivo/ });

test('il + aggiunge senza cambiare pagina', async ({ page }) => {
  await page.goto('/prodotti');
  await page.getByRole('link', { name: 'Aggiungi Panchina con schienale alla richiesta' }).click();
  await expect(contatore(page)).toHaveAccessibleName('Richiedi preventivo, 1 articolo');
  await expect(page.getByRole('status').filter({ hasText: 'Aggiunto: Panchina con schienale' })).toBeVisible();
  await expect(page).toHaveURL(/\/prodotti\/?$/);
});

test('quantità dalla scheda, modifica e rimozione nel pannello', async ({ page }) => {
  await page.goto('/prodotti/9-hp150-00');
  await page.getByLabel('Quantità').fill('3');
  await page.getByRole('button', { name: 'Aggiungi alla richiesta' }).click();
  await expect(contatore(page)).toHaveAccessibleName('Richiedi preventivo, 3 articoli');
  await contatore(page).click();
  const pannello = page.getByRole('dialog', { name: 'La tua richiesta' });
  await expect(pannello).toBeVisible();
  await pannello.getByLabel('Quantità di Hexaplay torre 150').fill('5');
  await pannello.getByLabel('Quantità di Hexaplay torre 150').blur();
  await expect(contatore(page)).toHaveAccessibleName('Richiedi preventivo, 5 articoli');
  await pannello.getByRole('button', { name: 'Rimuovi Hexaplay torre 150' }).click();
  await expect(pannello.getByText('La richiesta è vuota')).toBeVisible();
});

test('dal pannello vuoto si può chiedere un progetto su misura', async ({ page }) => {
  await page.goto('/prodotti');
  await contatore(page).click();
  await expect(page.getByRole('dialog', { name: 'La tua richiesta' }).getByRole('link', { name: 'Descrivi un progetto su misura' })).toHaveAttribute('href', '/richiesta');
});

test('il pannello si chiude con Esc e restituisce il focus', async ({ page }) => {
  await page.goto('/prodotti');
  await contatore(page).click();
  await expect(page.getByRole('dialog', { name: 'La tua richiesta' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'La tua richiesta' })).toBeHidden();
  await expect(contatore(page)).toBeFocused();
});

test('il carrello resta dopo il ricaricamento', async ({ page }) => {
  await page.goto('/prodotti');
  await page.getByRole('link', { name: 'Aggiungi Panchina con schienale alla richiesta' }).click();
  await page.reload();
  await expect(contatore(page)).toHaveAccessibleName('Richiedi preventivo, 1 articolo');
});

test('due schede restano allineate', async ({ context }) => {
  const a = await context.newPage();
  const b = await context.newPage();
  await a.goto('/prodotti');
  await b.goto('/prodotti');
  await a.getByRole('link', { name: 'Aggiungi Panchina con schienale alla richiesta' }).click();
  await expect(contatore(b)).toHaveAccessibleName('Richiedi preventivo, 1 articolo');
});

test.describe('senza JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('il + porta alla pagina di richiesta', async ({ page }) => {
    await page.goto('/prodotti');
    await expect(page.getByRole('link', { name: 'Aggiungi Panchina con schienale alla richiesta' })).toHaveAttribute('href', '/richiesta?aggiungi=5-pa100-00');
  });
});
