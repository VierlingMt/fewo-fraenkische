import { getCollection } from 'astro:content';

export async function getRegionSeiten() {
  const seiten = await getCollection('region');
  return seiten.sort((a, b) => a.data.order - b.data.order);
}
