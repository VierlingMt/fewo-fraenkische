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
  // true = Seite für Suchmaschinen sperren (z. B. für eine Testumgebung)
  noindex: false,
};

export const NAV = [
  { href: '/', label: 'Start' },
  { href: '/ferienwohnungen/', label: 'Ferienwohnungen' },
  { href: '/region/', label: 'Region' },
  { href: '/veranstaltungen/', label: 'Veranstaltungen' },
  { href: '/kontakt/', label: 'Kontakt' },
];
