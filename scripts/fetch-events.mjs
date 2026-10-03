// Holt Veranstaltungen von fraenkische-schweiz.com (Tourismuszentrale Fränkische Schweiz, Daten aus VENUS)
// und schreibt src/data/events.json. Übernommen werden nur Titel, Datum, Uhrzeit, Ort und Link –
// keine Beschreibungen oder Bilder. Termine weiter als RADIUS_KM von Ebermannstadt entfernt werden verworfen.
import { writeFile } from 'node:fs/promises';

const BASE = 'https://www.fraenkische-schweiz.com';
const LIST_URL = `${BASE}/erleben/veranstaltungen`;
const SHEETS = 8; // à 50 Termine ≈ 4 Wochen
const RADIUS_KM = 20;
const HOME = { lat: 49.7806, lng: 11.1856 }; // Ebermannstadt
const outFile = new URL('../src/data/events.json', import.meta.url);

const decode = (s) =>
  s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function distanceKm(lat, lng) {
  const rad = Math.PI / 180;
  const dLat = (lat - HOME.lat) * rad;
  const dLng = (lng - HOME.lng) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(HOME.lat * rad) * Math.cos(lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// Heutiges Datum in deutscher Zeit als YYYY-MM-DD
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());

function parse(html) {
  const parts = html.split(/<div data-id="([0-9a-f]{24})" class="col-12 we2p-listing-result /);
  const events = [];
  for (let i = 1; i < parts.length; i += 2) {
    const id = parts[i];
    const block = parts[i + 1];
    const title = block.match(/<!-- TITLE -->([\s\S]*?)<\/a>/)?.[1];
    const when = block.match(/upcoming-event[^>]*>\s*<span>([\s\S]*?)<\/span>/)?.[1];
    const address = block.match(/fa-map-marker-alt[^<]*<\/i>\s*<span>([\s\S]*?)<\/span>/)?.[1];
    const coords = block.match(/destination=(-?[\d.]+),(-?[\d.]+)&/);
    const m = when?.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{1,2}:\d{2}))?/);
    if (!title || !m) continue;

    const ort = address ? decode(address) : '';
    const plzOrt = ort.match(/\b\d{5}\s+(.+)$/)?.[1] ?? ort.split(',').at(-1)?.trim() ?? '';
    events.push({
      id,
      title: decode(title),
      date: `${m[3]}-${m[2]}-${m[1]}`,
      time: m[4] ?? '',
      place: plzOrt.replace(/\s*\/.*$/, ''),
      distanceKm: coords ? Math.round(distanceKm(Number(coords[1]), Number(coords[2]))) : null,
      link: `${BASE}/detail/id=${id}`,
    });
  }
  return events;
}

const all = [];
for (let sheet = 1; sheet <= SHEETS; sheet++) {
  try {
    const res = await fetch(sheet === 1 ? LIST_URL : `${LIST_URL}?sheet=${sheet}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FeWoFraenkische-EventBot/1.0; +https://neu.fewo-ebermannstadt.de)' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const found = parse(await res.text());
    console.log(`✔ Seite ${sheet}: ${found.length} Termine`);
    if (found.length === 0) break;
    all.push(...found);
  } catch (err) {
    console.warn(`✖ Seite ${sheet}: ${err.message}`);
    break;
  }
  await new Promise((r) => setTimeout(r, 1500));
}

const seen = new Set();
const events = all
  .filter((e) => e.date >= today)
  .filter((e) => e.distanceKm === null || e.distanceKm <= RADIUS_KM)
  .filter((e) => {
    const key = `${e.id}|${e.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

if (all.length === 0) {
  console.warn('Keine Termine abgerufen – events.json bleibt unverändert.');
} else {
  await writeFile(
    outFile,
    JSON.stringify({ generatedAt: new Date().toISOString(), source: LIST_URL, events }, null, 2) + '\n',
  );
  console.log(`→ ${events.length} Termine im Umkreis von ${RADIUS_KM} km in src/data/events.json`);
}
