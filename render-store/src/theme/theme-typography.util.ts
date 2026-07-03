const THEME_FONT_LINK_PREFIX = 'ziplofy-theme-font-';

function extractQuotedFontNames(family: unknown): string[] {
  if (typeof family !== 'string' || !family.trim()) return [];
  const names: string[] = [];
  const re = /"([^"]+)"/g;
  let match = re.exec(family);
  while (match) {
    names.push(match[1]);
    match = re.exec(family);
  }
  return names;
}

export function readThemeTypographyGoogleFonts(
  config: Record<string, unknown> | null | undefined
): string[] {
  if (!config || typeof config !== 'object') return [];
  const settings = config.settings as Record<string, unknown> | undefined;
  const typography = settings?.typography as Record<string, unknown> | undefined;
  if (!typography) return [];

  const families = [
    typography.fontFamily,
    typography.fontFamilyBody,
    typography.fontFamilySubheading,
    typography.fontFamilyAccent,
  ];

  const names = new Set<string>();
  for (const family of families) {
    for (const name of extractQuotedFontNames(family)) {
      if (!/^(system-ui|sans-serif|serif|inherit|ui-monospace)$/i.test(name)) {
        names.add(name);
      }
    }
  }
  return [...names];
}

function googleFontStylesheetUrl(fontName: string): string {
  const family = encodeURIComponent(fontName).replace(/%20/g, '+');
  // Legacy v1 API: gracefully serves whatever of these weights the font supports
  // (unlike css2, which 400s the whole request if any listed weight is missing),
  // so all Weight options (Thin…Black) render when available.
  const weights = '100,300,400,500,600,700,900';
  return `https://fonts.googleapis.com/css?family=${family}:${weights}&display=swap`;
}

export function applyThemeTypographyFontsToDocument(
  config: Record<string, unknown> | null | undefined
): void {
  const fonts = readThemeTypographyGoogleFonts(config);
  const desired = new Set(fonts);

  document
    .querySelectorAll(`link[id^="${THEME_FONT_LINK_PREFIX}"]`)
    .forEach((el) => {
      const id = el.id.replace(THEME_FONT_LINK_PREFIX, '');
      if (!desired.has(id)) el.remove();
    });

  for (const fontName of fonts) {
    const id = `${THEME_FONT_LINK_PREFIX}${fontName}`;
    if (document.getElementById(id)) continue;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = googleFontStylesheetUrl(fontName);
    document.head.appendChild(link);
  }
}

export function readThemeTypographyTextColor(
  config: Record<string, unknown> | null | undefined
): string | undefined {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const typography = settings?.typography as Record<string, unknown> | undefined;
  const colors = settings?.colors as Record<string, unknown> | undefined;
  const raw = typography?.textColor;

  if (typeof raw === 'string' && raw.trim()) {
    if (raw === 'palette') {
      const palette = colors?.palette;
      if (Array.isArray(palette) && typeof palette[1] === 'string') return palette[1];
      if (typeof colors?.text === 'string') return colors.text;
    }
    const match = /^palette:(\d+)$/.exec(raw.trim());
    if (match) {
      const index = Number(match[1]);
      const palette = colors?.palette;
      if (Array.isArray(palette) && typeof palette[index] === 'string') {
        return palette[index];
      }
    }
    if (!raw.startsWith('palette')) return raw;
  }

  if (typeof colors?.text === 'string' && colors.text.trim()) return colors.text;
  return undefined;
}

export function applyThemeTypographyCssVars(config: Record<string, unknown> | null | undefined): void {
  const root = document.documentElement;
  const settings = config?.settings as Record<string, unknown> | undefined;
  const typography = settings?.typography as Record<string, string> | undefined;
  if (!typography) return;

  if (typography.fontFamily) root.style.setProperty('--ziplofy-font-family', typography.fontFamily);
  if (typography.fontFamilyBody) {
    root.style.setProperty('--ziplofy-font-family-body', typography.fontFamilyBody);
  }
  if (typography.fontFamilySubheading) {
    root.style.setProperty('--ziplofy-font-family-subheading', typography.fontFamilySubheading);
  }
  if (typography.fontFamilyAccent) {
    root.style.setProperty('--ziplofy-font-family-accent', typography.fontFamilyAccent);
  }

  const textColor = readThemeTypographyTextColor(config);
  if (textColor) root.style.setProperty('--ziplofy-text', textColor);
}
