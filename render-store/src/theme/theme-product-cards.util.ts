export function readThemeProductCardsCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const productCards = (settings?.productCards ?? {}) as Record<string, unknown>;
  const colors = settings?.colors as Record<string, unknown> | undefined;
  const palette = Array.isArray(colors?.palette) ? (colors.palette as string[]) : [];

  const resolvePalette = (raw: unknown, index: number, fallback: string): string => {
    if (typeof raw === 'string' && raw.startsWith('#')) return raw;
    if (raw === 'palette' || raw === `palette:${index}`) {
      return typeof palette[index] === 'string' ? palette[index] : fallback;
    }
    const match = typeof raw === 'string' ? /^palette:(\d+)$/.exec(raw) : null;
    if (match) {
      const i = Number(match[1]);
      return typeof palette[i] === 'string' ? palette[i] : fallback;
    }
    return fallback;
  };

  return {
    '--codiic-product-card-bg': resolvePalette(productCards.backgroundColor, 0, '#ffffff'),
    '--codiic-product-card-text': resolvePalette(productCards.textColor, 1, '#111827'),
  };
}

export function readThemeProductCardsQuickAddEnabled(
  config: Record<string, unknown> | null | undefined,
  mobile = false
): boolean {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const productCards = (settings?.productCards ?? {}) as Record<string, unknown>;
  const readBool = (value: unknown, fallback: boolean) => {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    return fallback;
  };
  return mobile
    ? readBool(productCards.mobileQuickAdd, false)
    : readBool(productCards.quickAdd, true);
}
