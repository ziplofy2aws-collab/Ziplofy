export function readThemeInputFieldsCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const inputFields = (settings?.inputFields ?? {}) as Record<string, unknown>;
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

  const borderThickness = Number(inputFields.borderThickness);
  const cornerRadius = Number(inputFields.cornerRadius);

  return {
    '--codiic-input-bg': resolvePalette(inputFields.backgroundColor, 0, '#ffffff'),
    '--codiic-input-text': resolvePalette(inputFields.textColor, 1, '#111827'),
    '--codiic-input-border': resolvePalette(inputFields.borderColor, 1, '#111827'),
    '--codiic-input-border-width': `${Number.isFinite(borderThickness) ? borderThickness : 1}px`,
    '--codiic-input-radius': `${Number.isFinite(cornerRadius) ? cornerRadius : 4}px`,
  };
}
