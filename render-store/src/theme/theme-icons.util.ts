export function readThemeIconStrokeWidth(
  config: Record<string, unknown> | null | undefined
): number {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const icons = (settings?.icons ?? {}) as Record<string, unknown>;
  const stroke = icons.stroke;

  if (stroke === 'thin') return 1.25;
  if (stroke === 'heavy') return 2.25;
  return 1.75;
}

export function readThemeIconCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  return {
    '--ziplofy-icon-stroke-width': String(readThemeIconStrokeWidth(config)),
  };
}
