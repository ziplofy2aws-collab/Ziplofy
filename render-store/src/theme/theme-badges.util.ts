function parsePaletteColor(
  raw: unknown,
  defaultIndex: number
): { kind: 'palette'; index: number } | { kind: 'custom'; hex: string } {
  if (typeof raw !== 'string' || !raw.trim()) return { kind: 'palette', index: defaultIndex };
  if (raw === 'palette') return { kind: 'palette', index: defaultIndex };
  const match = /^palette:(\d+)$/.exec(raw.trim());
  if (match) {
    const index = Number(match[1]);
    return { kind: 'palette', index: Number.isFinite(index) ? index : defaultIndex };
  }
  return { kind: 'custom', hex: raw };
}

function resolvePaletteColor(
  config: Record<string, unknown> | null | undefined,
  raw: unknown,
  defaultIndex: number,
  fallback: string
): string {
  const parsed = parsePaletteColor(raw, defaultIndex);
  if (parsed.kind === 'custom') return parsed.hex;

  const settings = config?.settings as Record<string, unknown> | undefined;
  const colors = settings?.colors as Record<string, unknown> | undefined;
  const palette = colors?.palette;
  if (Array.isArray(palette) && typeof palette[parsed.index] === 'string') {
    return palette[parsed.index];
  }
  return fallback;
}

export function readThemeBadgeCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const badges = (settings?.badges ?? {}) as Record<string, unknown>;

  const cornerRadiusRaw = badges.cornerRadius;
  const cornerRadiusParsed =
    typeof cornerRadiusRaw === 'number' ? cornerRadiusRaw : Number(cornerRadiusRaw);
  const cornerRadius =
    Number.isFinite(cornerRadiusParsed) && cornerRadiusParsed >= 0
      ? Math.round(cornerRadiusParsed)
      : 100;

  const position =
    typeof badges.position === 'string' && badges.position.trim()
      ? badges.position
      : 'top-right';

  const textCase = badges.textCase === 'uppercase' ? 'uppercase' : 'none';

  return {
    '--ziplofy-badge-radius': `${cornerRadius}px`,
    '--ziplofy-badge-sale-bg': resolvePaletteColor(config, badges.saleBackground, 0, '#ffffff'),
    '--ziplofy-badge-sale-text': resolvePaletteColor(config, badges.saleText, 1, '#111827'),
    '--ziplofy-badge-sold-out-bg': resolvePaletteColor(
      config,
      badges.soldOutBackground,
      0,
      '#EEF1EA'
    ),
    '--ziplofy-badge-sold-out-text': resolvePaletteColor(config, badges.soldOutText, 1, '#111827'),
    '--ziplofy-badge-text-transform': textCase,
    position,
  };
}

export function readThemeBadgePosition(
  config: Record<string, unknown> | null | undefined
): string {
  return readThemeBadgeCssVars(config).position;
}
