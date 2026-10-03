// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Beim Go-live auf die endgültige Domain umstellen (oder per SITE_URL setzen).
  site: process.env.SITE_URL ?? 'https://neu.fewo-ebermannstadt.de',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
});
