export function readThemeSwatchesCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const swatches = (settings?.swatches ?? {}) as Record<string, unknown>;

  const width = Number(swatches.width);
  const height = Number(swatches.height);
  const cornerRadius = Number(swatches.cornerRadius);
  const borderThickness = Number(swatches.borderThickness);
  const borderOpacity = Number(swatches.borderOpacity);
  const borderStyle = typeof swatches.borderStyle === 'string' ? swatches.borderStyle : 'solid';

  const alpha =
    Math.min(100, Math.max(0, Number.isFinite(borderOpacity) ? borderOpacity : 10)) / 100;
  const border =
    borderStyle === 'solid' && (Number.isFinite(borderThickness) ? borderThickness : 1) > 0
      ? `${Number.isFinite(borderThickness) ? borderThickness : 1}px solid rgba(17, 24, 39, ${alpha})`
      : 'none';

  return {
    '--ziplofy-swatch-width': `${Number.isFinite(width) ? width : 34}px`,
    '--ziplofy-swatch-height': `${Number.isFinite(height) ? height : 34}px`,
    '--ziplofy-swatch-radius': `${Number.isFinite(cornerRadius) ? cornerRadius : 32}px`,
    '--ziplofy-swatch-border': border,
  };
}

export function readThemeSwatchVariantImagesEnabled(
  config: Record<string, unknown> | null | undefined
): boolean {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const swatches = (settings?.swatches ?? {}) as Record<string, unknown>;
  const value = swatches.variantImages;
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return false;
}
