# FeWo Fränkische – Website

Statische Website für die Ferienwohnungen **Waldrand Idyll** und **Terrassenglück** in Ebermannstadt,
mit eigenen Tipps und automatisch aktualisierten Schlagzeilen aus der Fränkischen Schweiz.

- **Astro** erzeugt reines HTML, ohne PHP, Datenbank oder Plugins auf dem Server.
- **Sveltia CMS** unter `/admin/` zum Bearbeiten der Inhalte im Browser. Jede Änderung wird als Commit gespeichert.
- **GitHub Actions** baut die Seite bei jedem Push und dreimal täglich neu und lädt sie per FTPS zu All-Inkl hoch.

## Inhalte

| Was | Wo |
|---|---|
| Ferienwohnungen | `src/content/wohnungen/*.md` |
| Eigene News & Tipps | `src/content/news/*.md` |
| Impressum, Datenschutz, AGB | `src/content/seiten/*.md` |
| Name, Adresse, Kontakt, `noindex` | `src/config.ts` |
| RSS-Quellen für „Aus der Region“ | `src/data/feeds.json` |
| Bilder aus dem CMS | `public/images/uploads/` |

## Lokal entwickeln

```sh
npm install
npm run news   # Regional-News abrufen (optional)
npm run dev    # http://localhost:4321
npm run build  # fertige Seite in dist/
npm test       # Playwright-Tests (5 Smartphones, 2 Tablets, 2 Desktops) gegen dist/
```

Die Tests laufen auch bei jedem Push im Deploy-Workflow, bevor hochgeladen wird.

## Deploy

`.github/workflows/deploy.yml` baut die Seite und lädt `dist/` nach `/www/` (www.fewo-fraenkische.de, www.fewo-ebermannstadt.de leitet weiter).
Benötigte Secrets sind `FTP_SERVER`, `FTP_USERNAME` und `FTP_PASSWORD`.

Die alte Joomla-Seite liegt gesperrt in `/www-old/` (Go-live am 03.10.2026 per `ftp-switch.yml`).
