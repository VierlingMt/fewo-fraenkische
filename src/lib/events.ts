export interface EventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM oder leer
  place: string;
  distanceKm: number | null;
  link: string;
}

export const EVENTS_SOURCE = {
  name: 'Tourismuszentrale Fränkische Schweiz',
  url: 'https://www.fraenkische-schweiz.com/erleben/veranstaltungen',
};

// Termine aus scripts/fetch-events.mjs. Fehlt die Datei, bleibt der Bereich leer.
const files = import.meta.glob<{ events?: EventItem[] }>('../data/events.json', {
  eager: true,
  import: 'default',
});

export function getEvents(limit?: number): EventItem[] {
  const data = Object.values(files)[0];
  const items = Array.isArray(data?.events) ? data.events : [];
  return limit ? items.slice(0, limit) : items;
}

export function groupByDate(events: EventItem[]) {
  const groups = new Map<string, EventItem[]>();
  for (const e of events) {
    if (!groups.has(e.date)) groups.set(e.date, []);
    groups.get(e.date)!.push(e);
  }
  return [...groups.entries()].map(([date, items]) => ({ date, items }));
}

const dayFmt = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

export const formatDay = (date: string) => dayFmt.format(new Date(`${date}T00:00:00Z`));
