// Uso: node scripts/screenshot.mjs <percorso> <nome> [larghezze...]
import { chromium } from '@playwright/test';
const [percorso = '/', nome = 'pagina', ...l] = process.argv.slice(2);
const larghezze = l.length ? l.map(Number) : [1440, 375];
const browser = await chromium.launch();
for (const w of larghezze) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errori = [];
  page.on('console', (m) => m.type() === 'error' && errori.push(m.text()));
  await page.goto('http://localhost:4321' + percorso, { waitUntil: 'networkidle' });
  if (process.env.APRI_MENU && w < 1024) await page.getByRole('button', { name: 'Menu' }).click();
  await page.screenshot({ path: `/home/claude/shots/${nome}-${w}.png`, fullPage: true });
  if (errori.length) console.log('console errors', w, errori);
  await page.close();
}
await browser.close();
