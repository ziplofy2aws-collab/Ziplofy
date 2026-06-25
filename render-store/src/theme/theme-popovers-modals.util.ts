export function readThemePopoversModalsCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const popoversModals = (settings?.popoversModals ?? {}) as Record<string, unknown>;
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

  const cornerRadius = Number(popoversModals.cornerRadius);
  const borderThickness = Number(popoversModals.borderThickness);
  const dropShadow =
    popoversModals.dropShadow === true ||
    popoversModals.dropShadow === 'true' ||
    popoversModals.dropShadow === 1;

  return {
    '--ziplofy-popover-bg': resolvePalette(popoversModals.backgroundColor, 0, '#ffffff'),
    '--ziplofy-popover-text': resolvePalette(popoversModals.textColor, 1, '#111827'),
    '--ziplofy-popover-radius': `${Number.isFinite(cornerRadius) ? cornerRadius : 14}px`,
    '--ziplofy-popover-border': resolvePalette(popoversModals.borderColor, 1, '#111827'),
    '--ziplofy-popover-border-width': `${Number.isFinite(borderThickness) ? borderThickness : 1}px`,
    '--ziplofy-popover-shadow': dropShadow ? '0 12px 40px rgba(0, 0, 0, 0.14)' : 'none',
  };
}
