import { getCollection } from 'astro:content';

export async function getPublishedNews() {
  const posts = await getCollection('news', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getWohnungen() {
  const items = await getCollection('wohnungen');
  return items.sort((a, b) => a.data.order - b.data.order);
}
