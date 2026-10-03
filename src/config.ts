// Zentrale Angaben zur Website.
export const SITE = {
  name: 'FeWo Fränkische',
  claim: 'Ferienwohnungen in Ebermannstadt',
  description:
    'Zwei Ferienwohnungen in Ebermannstadt – Waldrand Idyll und Terrassenglück – mitten in der Fränkischen Schweiz. Dazu aktuelle News, Ausflugstipps und Veranstaltungen aus der Region.',
  locale: 'de_DE',
  lang: 'de',
  town: 'Ebermannstadt',
  region: 'Fränkische Schweiz',
  postalCode: '91320',
  country: 'DE',
  contact: {
    name: 'Martin Vierling',
    street: 'Judenäcker 5',
    email: 'info@fewo-fraenkische.de',
  },
  // Solange die Seite unter neu.… zum Testen läuft, nicht von Google indexieren lassen.
  // Beim Go-live auf false stellen.
  noindex: true,
};

export const NAV = [
  { href: '/', label: 'Start' },
  { href: '/ferienwohnungen/', label: 'Ferienwohnungen' },
  { href: '/news/', label: 'News & Tipps' },
  { href: '/kontakt/', label: 'Kontakt' },
];
