import type { APIContext } from 'astro';
import { SITE } from '../config';

export function GET(context: APIContext) {
  const sitemap = new URL('sitemap-index.xml', context.site).href;
  const rules = SITE.noindex ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nDisallow: /admin/\n';
  return new Response(`${rules}\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
