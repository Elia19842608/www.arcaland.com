import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function compila(page: Page) {
  await page.getByLabel('Ente pubblico').check();
  await page.getByLabel('Nome e cognome').fill('Mario Rossi');
  await page.getByLabel('Ente o azienda').fill('Comune di Prova');
  await page.getByLabel('Email').fill('mario@example.com');
  await page.getByLabel('Telefono').fill('0522 000000');
  await page.getByLabel("Comune dell'area").fill('Reggio Emilia');
}

test('il form è registrato per Netlify Forms', async () => {
  const html = readFileSync('dist/richiesta/index.html', 'utf8');
  expect(html).toContain('data-netlify="true"');
  expect(html).toContain('name="richiesta-preventivo"');
  expect(html).toContain('name="bot-field"');
});

test('aggiunge dal parametro e pulisce l’indirizzo', async ({ page }) => {
  await page.goto('/richiesta?aggiungi=5-pa100-00');
  await expect(page.getByRole('region', { name: 'Prodotti selezionati' }).getByText('Panchina con schienale')).toBeVisible();
  await expect(page).toHaveURL(/\/richiesta\/?$/);
});

test('aggiunge con la quantità arrivata dalla scheda', async ({ page }) => {
  await page.goto('/richiesta?aggiungi=9-hp150-00&quantita=4');
  await expect(page.getByRole('region', { name: 'Prodotti selezionati' }).getByLabel('Quantità di Hexaplay torre 150')).toHaveValue('4');
});

test('campi obbligatori', async ({ page }) => {
  await page.goto('/richiesta?aggiungi=5-pa100-00');
  await page.getByRole('button', { name: 'Invia la richiesta' }).click();
  await expect(page.getByText('Scrivi nome e cognome')).toBeVisible();
  await expect(page.getByText('Indica se sei un ente pubblico o un’attività privata')).toBeVisible();
  await expect(page.getByLabel('Ente pubblico')).toBeFocused();
});

test('carrello vuoto: le note diventano obbligatorie', async ({ page }) => {
  await page.goto('/richiesta');
  await compila(page);
  await page.getByRole('button', { name: 'Invia la richiesta' }).click();
  await expect(page.getByText('Descrivi il progetto nelle note')).toBeVisible();
});

test('allegato troppo grande o di un formato non ammesso', async ({ page }) => {
  await page.goto('/richiesta');
  const campo = page.getByLabel('Allegato');
  await campo.setInputFiles({ name: 'grande.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(9 * 1024 * 1024) });
  await expect(page.getByText('Il file supera 8 MB')).toBeVisible();
  await campo.setInputFiles({ name: 'virus.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('x') });
  await expect(page.getByText('Formato non ammesso')).toBeVisible();
});

test('invio riuscito', async ({ page }) => {
  let corpo = '';
  await page.route(/\/$/, async (r) => {
    if (r.request().method() !== 'POST') return r.continue();
    corpo = r.request().postData() ?? '';
    await r.fulfill({ status: 200, body: 'ok' });
  });
  await page.goto('/richiesta?aggiungi=9-hp150-00&quantita=2');
  await compila(page);
  await page.getByRole('button', { name: 'Invia la richiesta' }).click();
  await expect(page).toHaveURL(/\/richiesta\/inviata\/?$/);
  expect(corpo).toContain('richiesta-preventivo');
  expect(corpo).toContain('2 × 9.HP150.00');
  await expect(page.getByRole('banner').getByRole('button', { name: /Richiedi preventivo/ })).toHaveAccessibleName('Richiedi preventivo, 0 articoli');
});

test('invio fallito: niente va perso', async ({ page }) => {
  await page.route(/\/$/, (r) => (r.request().method() === 'POST' ? r.fulfill({ status: 500, body: 'no' }) : r.continue()));
  await page.goto('/richiesta?aggiungi=5-pa100-00');
  await compila(page);
  await page.getByRole('button', { name: 'Invia la richiesta' }).click();
  await expect(page.getByText('Non siamo riusciti a inviare la richiesta')).toBeVisible();
  await expect(page.getByLabel('Nome e cognome')).toHaveValue('Mario Rossi');
  await expect(page.getByRole('button', { name: 'Riprova' })).toBeVisible();
  await expect(page.getByRole('banner').getByRole('button', { name: /Richiedi preventivo/ })).toHaveAccessibleName('Richiedi preventivo, 1 articolo');
});
