export function applyDividerPreset(section: Record<string, unknown>): void {
  if (section.type !== 'divider') return;
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.thickness = settings.thickness ?? 1;
  settings.width = settings.width ?? 'full';
  section.settings = settings;
}
