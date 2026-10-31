import { test, expect, type Page } from '@playwright/test';

const cartiglio = (page: Page) => page.locator('[data-cartiglio-titolo]');

test('apertura', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aree gioco che durano.');
  await expect(page.getByRole('main').getByRole('link', { name: 'Esplora i prodotti' })).toHaveAttribute('href', '/prodotti');
  await expect(page.getByRole('main').getByRole('link', { name: 'Richiedi un preventivo' }).first()).toHaveAttribute('href', '/richiesta');
  const indice = page.getByRole('navigation', { name: 'Tavole' });
  for (let i = 1; i <= 5; i++) await expect(indice.locator(`a[href="#tavola-${i}"]`)).toHaveCount(1);
  await expect(page.getByRole('img', { name: /esempio/i }).first()).toBeVisible();
});

test('le cinque tavole sono tutte nella pagina', async ({ page }) => {
  await page.goto('/');
  for (const t of ['Il materiale', 'La posa', "L'ispezione", 'Nel tempo']) {
    await expect(page.getByRole('heading', { level: 2, name: t })).toHaveCount(1);
  }
});

test('scorrendo cambia la tavola nel cartiglio', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(cartiglio(page)).toHaveText('Tavola 1 di 5 — Il progetto');
  await page.getByRole('navigation', { name: 'Tavole' }).getByRole('link', { name: /La posa/ }).click();
  await expect(cartiglio(page)).toHaveText('Tavola 3 di 5 — La posa');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.evaluate(() => document.querySelector('[data-ancora="2"]')!.scrollIntoView({ block: 'center' }));
  await expect(cartiglio(page)).toHaveText('Tavola 2 di 5 — Il materiale');
  await expect(page.getByRole('navigation', { name: 'Tavole' }).locator('a[aria-current="step"]')).toHaveAttribute('href', '#tavola-2');
});

test('un link diretto a una tavola apre quella tavola anche su desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#tavola-4');
  await expect(cartiglio(page)).toHaveText("Tavola 4 di 5 — L'ispezione");
});

test.describe('con riduci movimento', () => {
  test.use({ reducedMotion: 'reduce' });
  test('disegni completi e niente foglio fisso', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const stato = await page.evaluate(() => ({
      offset: [...document.querySelectorAll('.disegna')].map((e) => getComputedStyle(e).strokeDashoffset),
      opacita: [...document.querySelectorAll('.compare')].map((e) => getComputedStyle(e).opacity),
      fisso: getComputedStyle(document.querySelector('[data-foglio]')!).position,
    }));
    expect(stato.offset.every((o) => o === '0' || o === '0px')).toBe(true);
    expect(stato.opacita.every((o) => o === '1')).toBe(true);
    expect(stato.fisso).not.toBe('sticky');
  });
});

test.describe('su telefono', () => {
  test('le tavole sono raggiungibili per ancora e niente cartiglio a fine elenco', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/#tavola-4');
    await expect(page.getByRole('heading', { level: 2, name: "L'ispezione" })).toBeInViewport();
    await expect(page.locator('[data-cartiglio-titolo]')).toBeHidden();
    await expect(page.getByRole('list', { name: 'Punti di controllo' }).getByRole('listitem')).toHaveCount(4);
  });
});

test.describe('senza JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('tavole leggibili', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    for (const t of ['Il materiale', 'La posa', "L'ispezione", 'Nel tempo']) {
      await expect(page.getByRole('heading', { level: 2, name: t })).toBeVisible();
    }
  });
});

test('linee con i conteggi reali', async ({ page }) => {
  await page.goto('/');
  const linee = page.getByRole('region', { name: 'Cosa trovi nel catalogo' });
  await expect(linee.getByRole('link', { name: /Giochi.*3 prodotti/ })).toHaveAttribute('href', '/prodotti?linea=giochi');
  await expect(linee.getByRole('link', { name: /Arredo urbano.*1 prodotto/ })).toHaveAttribute('href', '/prodotti?linea=arredo-urbano');
  await expect(linee.getByRole('link', { name: /Percorsi sportivi.*1 prodotto/ })).toHaveAttribute('href', '/prodotti?linea=percorsi-sportivi');
});

test('lavori recenti e chiusura', async ({ page }) => {
  await page.goto('/');
  const lavori = page.getByRole('region', { name: 'Lavori recenti' });
  for (const luogo of ['Collagna', 'Porto Viro', 'Villa Minozzo', 'Corbola']) await expect(lavori.getByText(luogo, { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('region', { name: 'Hai un’area da attrezzare?' }).getByRole('link', { name: 'Richiedi un preventivo' })).toHaveAttribute('href', '/richiesta');
});
