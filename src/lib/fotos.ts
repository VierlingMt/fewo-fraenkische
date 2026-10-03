import type { ImageMetadata } from 'astro';

export interface Foto {
  src: ImageMetadata;
  label: string;
}

// Alle Fotos aus src/assets/fotos/<wohnung>/, sortiert nach Dateiname.
// Aus "03-wohnkueche-mit-schlafsofa.jpg" wird die Beschriftung "Wohnküche mit Schlafsofa".
const files = import.meta.glob<ImageMetadata>('../assets/fotos/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
});

function toLabel(file: string) {
  const name = file
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_ ]*/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/ae/g, 'ä')
    .replace(/oe/g, 'ö')
    .replace(/ue/g, 'ü')
    .trim();
  // Substantive groß, kleine Füllwörter klein
  const klein = new Set(['und', 'mit', 'im', 'am', 'zum', 'zur', 'vom', 'von', 'der', 'die', 'das', 'auf', 'in']);
  return name
    .split(' ')
    .map((w, i) => (i > 0 && klein.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

export function getFotos(wohnungId: string): Foto[] {
  return Object.entries(files)
    .filter(([path]) => path.split('/').at(-2) === wohnungId)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src]) => ({ src, label: toLabel(path.split('/').at(-1)!) }));
}
