// Holt Schlagzeilen aus den RSS-Feeds in src/data/feeds.json und schreibt src/data/news-feed.json.
// Gespeichert werden nur Titel, Link, Quelle, Datum und ein kurzer Anriss – keine vollständigen Artikel.
// Fällt eine Quelle aus, wird sie übersprungen; der Build läuft trotzdem weiter.
import { readFile, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('src/data/feeds.json', root), 'utf8'));
const outFile = new URL('src/data/news-feed.json', root);

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@', textNodeName: '#text' });
const keywords = config.keywords.map((k) => k.toLowerCase());
const minDate = Date.now() - config.maxAgeDays * 24 * 60 * 60 * 1000;

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const text = (v) => (typeof v === 'object' && v !== null ? (v['#text'] ?? '') : (v ?? '')).toString();

function clean(html, max = 220) {
  const s = text(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, '')} …` : s;
}

function normalize(feed, raw) {
  const isAtom = !!raw.feed;
  const entries = isAtom ? asArray(raw.feed.entry) : asArray(raw.rss?.channel?.item);
  const isGoogle = feed.url.includes('news.google.com');

  return entries.map((e) => {
    let title = clean(e.title, 300);
    let source = feed.name;
    const sourceTag = text(e.source);
    if (sourceTag) {
      source = sourceTag;
      // Google News hängt " - Quelle" an den Titel an
      if (title.endsWith(` - ${sourceTag}`)) title = title.slice(0, -(sourceTag.length + 3));
    }
    const link = isAtom
      ? asArray(e.link).find((l) => !l['@rel'] || l['@rel'] === 'alternate')?.['@href']
      : text(e.link);
    const date = new Date(text(e.pubDate || e.published || e.updated || e['dc:date']));
    const teaser = isGoogle ? '' : clean(e.description || e.summary || e.content);
    return { title, link, source, date, teaser };
  });
}

const matches = (item) => {
  const hay = `${item.title} ${item.teaser}`.toLowerCase();
  return keywords.some((k) => hay.includes(k));
};

const all = [];
for (const feed of config.feeds) {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FeWoFraenkische-NewsBot/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = normalize(feed, parser.parse(await res.text()));
    const valid = items.filter((i) => i.title && i.link?.startsWith('http') && !isNaN(i.date) && i.date >= minDate);
    const kept = feed.filter ? valid.filter(matches) : valid;
    console.log(`✔ ${feed.name}: ${items.length} Einträge, ${kept.length} übernommen`);
    all.push(...kept);
  } catch (err) {
    console.warn(`✖ ${feed.name}: ${err.message}`);
  }
}

const seen = new Set();
const items = all
  .sort((a, b) => b.date - a.date)
  .filter((i) => {
    const key = i.title.toLowerCase().replace(/[^a-z0-9äöüß]/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .slice(0, config.maxItems)
  .map((i) => ({ ...i, date: i.date.toISOString() }));

await writeFile(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2) + '\n');
console.log(`→ ${items.length} Schlagzeilen in src/data/news-feed.json`);
