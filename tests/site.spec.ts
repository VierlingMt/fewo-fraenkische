import { test, expect, type Page } from '@playwright/test';

const SEITEN = [
  '/',
  '/ferienwohnungen/',
  '/ferienwohnungen/waldrand-idyll/',
  '/ferienwohnungen/terrassenglueck/',
  '/region/',
  '/region/ausflugsziele/',
  '/region/aussichtspunkte-wandern/',
  '/region/radtouren-aktiv/',
  '/region/essen-trinken/',
  '/region/mit-kindern/',
  '/region/feste-im-jahr/',
  '/region/gut-zu-wissen/',
  '/veranstaltungen/',
  '/kontakt/',
  '/ueber-uns/',
  '/impressum/',
  '/datenschutz/',
  '/agb/',
];

// Ab dieser Breite gibt es die normale Navigation statt des Burger-Menüs (siehe Base.astro)
const DESKTOP_AB = 861;

const istMobil = (page: Page) => (page.viewportSize()?.width ?? 0) < DESKTOP_AB;

/** Sammelt JavaScript-Fehler und Konsolen-Fehler einer Seite. */
function fehlerSammeln(page: Page) {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') fehler.push(`console: ${m.text()}`);
  });
  return fehler;
}

test.describe('Alle Seiten', () => {
  for (const pfad of SEITEN) {
    test(`${pfad} lädt fehlerfrei und passt in die Breite`, async ({ page }) => {
      const fehler = fehlerSammeln(page);
      const res = await page.goto(pfad);
      expect(res?.status(), 'HTTP-Status').toBe(200);

      await expect(page).toHaveTitle(/FeWo Fränkische/);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('header.site-header')).toBeVisible();
      await expect(page.locator('footer.site-footer')).toBeAttached();

      // Kein seitliches Scrollen
      const breite = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        sichtbar: document.documentElement.clientWidth,
      }));
      expect(breite.scroll, 'Seite ist breiter als der Bildschirm').toBeLessThanOrEqual(breite.sichtbar + 1);

      // Jedes Bild hat einen Alternativtext (leer ist bei Deko-Bildern erlaubt)
      const ohneAlt = await page.locator('img:not([alt])').count();
      expect(ohneAlt, 'Bilder ohne alt-Attribut').toBe(0);

      // Nicht verzögert geladene Bilder sind tatsächlich angekommen
      const kaputt = await page.evaluate(() =>
        [...document.images]
          .filter((img) => img.getAttribute('src') && img.loading !== 'lazy' && img.complete && img.naturalWidth === 0)
          .map((img) => img.currentSrc || img.src),
      );
      expect(kaputt, 'Bilder, die nicht geladen werden konnten').toEqual([]);

      expect(fehler, 'JavaScript-Fehler').toEqual([]);
    });
  }

  test('unbekannte Seite zeigt die 404-Seite', async ({ page }) => {
    await page.goto('/gibt-es-nicht/');
    await expect(page.locator('h1')).toHaveText('Seite nicht gefunden');
  });
});

test.describe('Navigation', () => {
  test('Hauptmenü passt zum Gerät und führt zu den Seiten', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    const menue = page.locator('#hauptmenue');

    if (istMobil(page)) {
      await expect(toggle).toBeVisible();
      await expect(menue).toBeHidden();

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(menue).toBeVisible();

      // Escape schließt das Menü
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(menue).toBeHidden();

      // Menüpunkt antippen navigiert und schließt das Menü
      await toggle.click();
      await menue.getByRole('link', { name: 'Region' }).click();
      await expect(page).toHaveURL(/\/region\/$/);
      await expect(menue).toBeHidden();
    } else {
      await expect(toggle).toBeHidden();
      await expect(menue).toBeVisible();
      for (const name of ['Start', 'Ferienwohnungen', 'Region', 'Veranstaltungen', 'Kontakt']) {
        await expect(menue.getByRole('link', { name, exact: true })).toBeVisible();
      }
      await menue.getByRole('link', { name: 'Ferienwohnungen' }).click();
      await expect(page).toHaveURL(/\/ferienwohnungen\/$/);
    }

    // Aktuelle Seite ist markiert
    await expect(page.locator('#hauptmenue [aria-current="page"]')).toHaveCount(1);
  });

  test('Kopfzeile bleibt beim Scrollen sichtbar', async ({ page }) => {
    await page.goto('/region/ausflugsziele/');
    await page.mouse.wheel(0, 2000);
    await expect(page.locator('header.site-header')).toBeInViewport();
  });
});

test.describe('Funktionen', () => {
  test('Fotogalerie öffnet, blättert und schließt', async ({ page }) => {
    await page.goto('/ferienwohnungen/terrassenglueck/');
    const dialog = page.locator('[data-lightbox]');
    await page.locator('[data-galerie] a[data-index="0"]').click();
    await expect(dialog).toBeVisible();
    await expect(page.locator('[data-lightbox-caption]')).toContainText('(1/');

    await page.locator('[data-lightbox-next]').click();
    await expect(page.locator('[data-lightbox-caption]')).toContainText('(2/');

    await page.locator('[data-lightbox-close]').click();
    await expect(dialog).toBeHidden();
  });

  test('Startseite zeigt beide Ferienwohnungen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero__card')).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Waldrand Idyll' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Terrassenglück' })).toBeVisible();
  });

  test('Veranstaltungen: Umkreis-Filter', async ({ page }) => {
    await page.goto('/veranstaltungen/');
    const alle = await page.locator('.event').count();
    test.skip(alle === 0, 'Keine Veranstaltungsdaten im Build (npm run events nicht ausgeführt)');

    await expect(page.locator('[data-radius="5"]')).toHaveClass(/is-active/);
    const bei5 = await page.locator('.event:visible').count();
    await page.locator('[data-radius="99"]').click();
    const bei20 = await page.locator('.event:visible').count();
    expect(bei20).toBeGreaterThanOrEqual(bei5);
  });

  test('Regionsseite: Karten mit Google-Maps-Links und Bildnachweis', async ({ page }) => {
    await page.goto('/region/ausflugsziele/');
    await expect(page.locator('.eintrag').first()).toBeVisible();
    expect(await page.locator('a[href^="https://www.google.com/maps/search/"]').count()).toBeGreaterThan(0);
    await expect(page.locator('.eintrag__bild figcaption small').first()).toContainText('Foto:');
  });
});

test.describe('Links', () => {
  test('alle internen Links funktionieren', async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1366', 'einmal reicht');
    const gefunden = new Set<string>();
    for (const pfad of SEITEN) {
      await page.goto(pfad);
      const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      hrefs.forEach((h) => gefunden.add(h.split('#')[0]));
    }
    const kaputt: string[] = [];
    for (const href of gefunden) {
      const res = await request.get(href);
      if (res.status() >= 400) kaputt.push(`${href} → ${res.status()}`);
    }
    expect(kaputt).toEqual([]);
  });
});
