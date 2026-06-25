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

export function readThemeDrawerCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const drawers = (settings?.drawers ?? {}) as Record<string, unknown>;

  return {
    '--ziplofy-drawer-bg': resolvePaletteColor(config, drawers.backgroundColor, 0, '#ffffff'),
    '--ziplofy-drawer-text': resolvePaletteColor(config, drawers.textColor, 1, '#111827'),
    '--ziplofy-drawer-border': resolvePaletteColor(config, drawers.borderColor, 1, '#111827'),
  };
}
