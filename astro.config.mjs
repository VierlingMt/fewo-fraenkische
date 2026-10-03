// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Hauptadresse; alle anderen Domains leiten per public/.htaccess hierher weiter.
  site: process.env.SITE_URL ?? 'https://www.fewo-fraenkische.de',
  trailingSlash: 'always',
  redirects: {
    '/news/': '/veranstaltungen/',
  },
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
});
