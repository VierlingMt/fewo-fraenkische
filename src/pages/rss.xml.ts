import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedNews } from '../lib/news';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const posts = await getPublishedNews();
  return rss({
    title: `${SITE.name} – News & Tipps`,
    description: SITE.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/news/${post.id}/`,
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
}
