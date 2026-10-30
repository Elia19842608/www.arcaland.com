import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const percorso of ['/', '/prodotti', '/prodotti/9-hp150-00', '/richiesta']) {
  for (const larghezza of [1440, 375]) {
    test(`accessibilità ${percorso} a ${larghezza}px`, async ({ page }) => {
      await page.setViewportSize({ width: larghezza, height: 900 });
      await page.goto(percorso);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const gravi = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(gravi.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
    });
  }
}
