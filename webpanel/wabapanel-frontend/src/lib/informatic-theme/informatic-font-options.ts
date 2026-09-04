import fontsData from './informatic-font-options.json';

export type InformaticFontOption = {
  value: string;
  label: string;
  family: string;
  googleFont: string | null;
};

/** Fonts commonly used in Informatic defaults but missing from the catalog export. */
export const INFORMATIC_EXTRA_FONT_OPTIONS: InformaticFontOption[] = [
  {
    value: 'inter',
    label: 'Inter',
    family: '"Inter", system-ui, -apple-system, sans-serif',
    googleFont: 'Inter',
  },
  {
    value: 'space-grotesk',
    label: 'Space Grotesk',
    family: '"Space Grotesk", system-ui, sans-serif',
    googleFont: 'Space Grotesk',
  },
];

export const INFORMATIC_FONT_CATALOG: InformaticFontOption[] = [
  ...INFORMATIC_EXTRA_FONT_OPTIONS,
  ...(fontsData as InformaticFontOption[]).filter(
    (font) => !INFORMATIC_EXTRA_FONT_OPTIONS.some((extra) => extra.value === font.value)
  ),
];

const BY_FAMILY = new Map(INFORMATIC_FONT_CATALOG.map((font) => [font.family, font]));

/** System / native stacks (no Google download). */
export const INFORMATIC_SYSTEM_FONT_OPTIONS = INFORMATIC_FONT_CATALOG.filter(
  (font) => !font.googleFont && font.value !== 'default' && font.family !== 'inherit'
);

/** Google Fonts available in the picker. */
export const INFORMATIC_GOOGLE_FONT_OPTIONS = INFORMATIC_FONT_CATALOG.filter(
  (font) => Boolean(font.googleFont) && font.value !== 'default'
);

export function labelForFontFamily(family: string): string {
  const match = BY_FAMILY.get(family);
  if (match) return match.label;
  const first = family.split(',')[0]?.replace(/^["']|["']$/g, '').trim();
  return first || 'Custom font';
}

export function googleFontNameForFamily(family: string): string | null {
  return BY_FAMILY.get(family)?.googleFont ?? null;
}

export function filterFontOptions(
  options: InformaticFontOption[],
  query: string
): InformaticFontOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((font) => font.label.toLowerCase().includes(q));
}

/** Curated popular picks shown at the top when not searching. */
export const INFORMATIC_POPULAR_FONT_OPTIONS: InformaticFontOption[] = [
  'inter',
  'poppins',
  'roboto',
  'montserrat',
  'open-sans',
  'lato',
  'playfair-display',
  'merriweather',
  'space-grotesk',
  'system-ui',
  'serif',
]
  .map((value) => INFORMATIC_FONT_CATALOG.find((font) => font.value === value))
  .filter((font): font is InformaticFontOption => Boolean(font));

export const INFORMATIC_DEFAULT_HEADING_FONT =
  INFORMATIC_FONT_CATALOG.find((f) => f.value === 'poppins')?.family ??
  '"Poppins", sans-serif';

export const INFORMATIC_DEFAULT_BODY_FONT =
  INFORMATIC_FONT_CATALOG.find((f) => f.value === 'inter')?.family ??
  '"Inter", system-ui, -apple-system, sans-serif';
