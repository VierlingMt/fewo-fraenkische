export interface FeedItem {
  title: string;
  link: string;
  source: string;
  date: string;
  teaser?: string;
}

// Schlagzeilen aus externen RSS-Quellen, erzeugt von scripts/fetch-news.mjs.
// Fehlt die Datei (z. B. lokal ohne `npm run news`), liefert der Glob nichts und der Bereich bleibt leer.
const files = import.meta.glob<{ items?: FeedItem[] }>('../data/news-feed.json', {
  eager: true,
  import: 'default',
});

export function getFeedItems(limit?: number): FeedItem[] {
  const data = Object.values(files)[0];
  const items = Array.isArray(data?.items) ? data.items : [];
  return limit ? items.slice(0, limit) : items;
}
