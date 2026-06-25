export function readThemeVariantPickersCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const variantPickers = (settings?.variantPickers ?? {}) as Record<string, unknown>;
  const variant = (variantPickers.variant ?? {}) as Record<string, unknown>;
  const selected = (variantPickers.selected ?? {}) as Record<string, unknown>;
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

  const borderThickness = Number(variantPickers.borderThickness);
  const cornerRadius = Number(variantPickers.cornerRadius);

  return {
    '--ziplofy-variant-picker-bg': resolvePalette(variant.backgroundColor, 0, '#ffffff'),
    '--ziplofy-variant-picker-text': resolvePalette(variant.textColor, 1, '#111827'),
    '--ziplofy-variant-picker-border': resolvePalette(variant.borderColor, 1, '#111827'),
    '--ziplofy-variant-picker-border-width': `${Number.isFinite(borderThickness) ? borderThickness : 1}px`,
    '--ziplofy-variant-picker-radius': `${Number.isFinite(cornerRadius) ? cornerRadius : 14}px`,
    '--ziplofy-variant-picker-selected-bg': resolvePalette(selected.backgroundColor, 1, '#111827'),
    '--ziplofy-variant-picker-selected-text': resolvePalette(selected.textColor, 0, '#ffffff'),
    '--ziplofy-variant-picker-selected-border': resolvePalette(selected.borderColor, 1, '#111827'),
  };
}

export function readThemeVariantPickerWidth(
  config: Record<string, unknown> | null | undefined
): 'fit' | 'fill' {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const variantPickers = (settings?.variantPickers ?? {}) as Record<string, unknown>;
  return variantPickers.width === 'fill' ? 'fill' : 'fit';
}
