import { test, expect, type Page } from '@playwright/test';

const fase = (page: Page) => page.locator('[data-palco]');
const vaiAllaFase = (page: Page, f: number) => page.evaluate((n) => {
  const s = document.querySelector<HTMLElement>('[data-nasce]')!;
  scrollTo(0, s.offsetTop + ((n + 0.5) / 6) * (s.offsetHeight - innerHeight));
}, f);

test('apertura', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Costruiamo parchi gioco. E ce ne prendiamo cura.');
  await expect(page.getByRole('main').getByRole('link', { name: 'Esplora i prodotti' }).first()).toHaveAttribute('href', '/prodotti');
  await expect(fase(page)).toHaveAttribute('data-f', '0');
});

test('le cinque tappe sono tutte nella pagina', async ({ page }) => {
  await page.goto('/');
  for (const t of ['Progettiamo', 'Produciamo', 'Posiamo', 'Ispezioniamo', 'Ripariamo']) {
    await expect(page.getByRole('heading', { level: 2, name: t, includeHidden: true })).toHaveCount(1);
  }
});

test('scorrendo il parco passa da una tappa all’altra', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  for (const f of [1, 3, 5, 2]) {
    await vaiAllaFase(page, f);
    await expect(fase(page)).toHaveAttribute('data-f', String(f));
  }
  await expect(page.getByRole('heading', { level: 2, name: 'Produciamo' })).toBeVisible();
  await expect(page.locator('[data-vai="2"]')).toHaveAttribute('aria-current', 'step');
});

test('i numeri in alto portano alla tappa', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Ispezioniamo' }).click();
  await expect(fase(page)).toHaveAttribute('data-f', '4');
  await expect(page.getByRole('link', { name: /Prenota un.ispezione/ })).toBeVisible();
});

test('la mappa risponde alla ricerca del comune', async ({ page }) => {
  await page.goto('/');
  const cerca = page.getByLabel("Il tuo comune c'è?");
  await cerca.fill('reggiolo');
  await expect(page.locator('[data-esito]')).toHaveText('Sì! A Reggiolo seguiamo già i parchi.');
  await expect(page.locator('.pt.acceso')).toHaveCount(1);
  await cerca.fill('Milano');
  await expect(page.locator('[data-esito]')).toContainText('Non ancora');
  await page.getByRole('button', { name: /Toscana/ }).click();
  await expect(page.locator('.pt.acceso')).toHaveCount(await page.locator('.pt[data-reg="Toscana"]').count());
});

test('prima e dopo: cursore e scelta dell’intervento', async ({ page }) => {
  await page.goto('/');
  const cursore = page.getByLabel('Sposta per confrontare prima e dopo');
  await cursore.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-confronto]')).toHaveAttribute('style', /--x:\s*51%/);
  await page.getByRole('button', { name: /Scaletta della torretta/ }).click();
  await expect(page.locator('[data-desc]')).toContainText('scaletta');
});

test.describe('con riduci movimento', () => {
  test.use({ reducedMotion: 'reduce' });
  test('niente animazioni e contenuti subito visibili', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('.rv').count()).toBe(0);
    const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.dondola')!).animationName);
    expect(anim).toBe('none');
  });
});

test.describe('su telefono', () => {
  test('niente scorrimento orizzontale e tappe funzionanti', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await vaiAllaFase(page, 4);
    await expect(fase(page)).toHaveAttribute('data-f', '4');
    await expect(page.getByRole('heading', { level: 2, name: 'Ispezioniamo' })).toBeInViewport();
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
