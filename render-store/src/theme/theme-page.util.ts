function parsePaletteColor(raw: unknown, defaultIndex: number): { kind: 'palette'; index: number } | { kind: 'custom'; hex: string } {
  if (typeof raw !== 'string' || !raw.trim()) return { kind: 'palette', index: defaultIndex };
  if (raw === 'palette') return { kind: 'palette', index: defaultIndex };
  const match = /^palette:(\d+)$/.exec(raw.trim());
  if (match) {
    const index = Number(match[1]);
    return { kind: 'palette', index: Number.isFinite(index) ? index : defaultIndex };
  }
  return { kind: 'custom', hex: raw };
}

export function readThemePageBackgroundForCss(
  config: Record<string, unknown> | null | undefined
): string | undefined {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const page = settings?.page as Record<string, unknown> | undefined;
  const colors = settings?.colors as Record<string, unknown> | undefined;
  const palette = colors?.palette;

  const parsed = parsePaletteColor(page?.backgroundColor, 0);
  if (parsed.kind === 'custom') return parsed.hex;

  if (Array.isArray(palette) && typeof palette[parsed.index] === 'string') {
    return palette[parsed.index];
  }
  if (typeof colors?.background === 'string' && colors.background.trim()) {
    return colors.background;
  }
  return undefined;
}

export function readThemePageMaxWidthForCss(
  config: Record<string, unknown> | null | undefined
): number | undefined {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const page = settings?.page as Record<string, unknown> | undefined;
  const spacing = settings?.spacing as Record<string, unknown> | undefined;

  const width = page?.pageWidth;
  if (width === 'narrow') return 1000;
  if (width === 'wide') return 1600;
  if (width === 'normal') return 1200;

  const raw = spacing?.contentMaxWidth;
  const parsed = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
