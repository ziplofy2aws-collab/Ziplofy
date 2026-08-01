function parsePaletteColor(
  raw: unknown,
  defaultIndex: number
): { kind: 'palette'; index: number } | { kind: 'custom'; hex: string } {
  if (typeof raw !== 'string' || !raw.trim()) return { kind: 'palette', index: defaultIndex };
  if (raw === 'palette') return { kind: 'palette', index: defaultIndex };
  if (raw === 'transparent') return { kind: 'custom', hex: 'transparent' };
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

export function readThemeButtonCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const buttons = (settings?.buttons ?? {}) as Record<string, unknown>;
  const primary = (buttons.primary ?? {}) as Record<string, unknown>;
  const secondary = (buttons.secondary ?? {}) as Record<string, unknown>;
  const pills = (buttons.pills ?? {}) as Record<string, unknown>;

  const primaryRadius = Number(primary.cornerRadius);
  const secondaryRadius = Number(secondary.cornerRadius);
  const pillsRadius = Number(pills.cornerRadius);
  const primaryBorder = Number(primary.borderThickness);
  const secondaryBorder = Number(secondary.borderThickness);
  const primaryTextCase = primary.textCase === 'uppercase' ? 'uppercase' : 'none';
  const secondaryTextCase = secondary.textCase === 'uppercase' ? 'uppercase' : 'none';

  return {
    '--codiic-btn-primary-bg': resolvePaletteColor(config, primary.background, 1, '#111827'),
    '--codiic-btn-primary-text': resolvePaletteColor(config, primary.text, 0, '#ffffff'),
    '--codiic-btn-primary-border-color': resolvePaletteColor(config, primary.border, 1, '#111827'),
    '--codiic-btn-primary-border-width': `${Number.isFinite(primaryBorder) ? primaryBorder : 0}px`,
    '--codiic-btn-primary-radius': `${Number.isFinite(primaryRadius) ? primaryRadius : 14}px`,
    '--codiic-btn-primary-text-transform': primaryTextCase,
    '--codiic-btn-secondary-bg': resolvePaletteColor(config, secondary.background, 0, 'transparent'),
    '--codiic-btn-secondary-text': resolvePaletteColor(config, secondary.text, 1, '#111827'),
    '--codiic-btn-secondary-border-color': resolvePaletteColor(config, secondary.border, 1, '#111827'),
    '--codiic-btn-secondary-border-width': `${Number.isFinite(secondaryBorder) ? secondaryBorder : 1}px`,
    '--codiic-btn-secondary-radius': `${Number.isFinite(secondaryRadius) ? secondaryRadius : 14}px`,
    '--codiic-btn-secondary-text-transform': secondaryTextCase,
    '--codiic-pill-radius': `${Number.isFinite(pillsRadius) ? pillsRadius : 40}px`,
  };
}
