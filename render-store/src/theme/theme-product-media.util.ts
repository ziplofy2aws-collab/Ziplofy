function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  return null;
}

function borderColorWithOpacity(baseColor: string, opacityPercent: number): string {
  const rgb = hexToRgb(baseColor);
  const alpha = Math.min(100, Math.max(0, opacityPercent)) / 100;
  if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  return `rgba(17, 24, 39, ${alpha})`;
}

function readProductMediaSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const productMedia = settings?.productMedia;
  if (productMedia && typeof productMedia === 'object') {
    return productMedia as Record<string, unknown>;
  }

  const cart = settings?.cart as Record<string, unknown> | undefined;
  const legacy = cart?.productMedia;
  return legacy && typeof legacy === 'object' ? (legacy as Record<string, unknown>) : {};
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function readThemeProductMediaCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const productMedia = readProductMediaSettings(config);
  const settings = config?.settings as Record<string, unknown> | undefined;
  const colors = settings?.colors as Record<string, unknown> | undefined;

  const borderStyle = productMedia.borderStyle === 'none' ? 'none' : 'solid';
  const borderThickness = clampNumber(productMedia.borderThickness, 0, 20, 1);
  const borderOpacity = clampNumber(productMedia.borderOpacity, 0, 100, 50);
  const cornerRadius = clampNumber(productMedia.cornerRadius, 0, 100, 0);

  const baseColor =
    (typeof colors?.text === 'string' && colors.text.startsWith('#') ? colors.text : null) ||
    (typeof colors?.border === 'string' && colors.border.startsWith('#') ? colors.border : null) ||
    '#111827';

  const borderCss =
    borderStyle === 'solid' && borderThickness > 0
      ? `${borderThickness}px solid ${borderColorWithOpacity(baseColor, borderOpacity)}`
      : 'none';

  return {
    '--ziplofy-product-media-radius': `${cornerRadius}px`,
    '--ziplofy-product-media-border': borderCss,
  };
}

export function readThemeProductMediaBorder(
  config: Record<string, unknown> | null | undefined
): string {
  const productMedia = readProductMediaSettings(config);
  return productMedia.borderStyle === 'solid' ? 'solid' : 'none';
}
