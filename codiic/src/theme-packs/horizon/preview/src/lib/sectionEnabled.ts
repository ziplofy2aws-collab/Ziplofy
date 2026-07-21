import { getThemeConfigValue } from '@render-store/sdk';

export function isLayoutSectionEnabled(
  config: Record<string, unknown> | null,
  sectionId: string
): boolean {
  if (!config) return true;
  if (sectionId === 'announcement_bar' || sectionId.startsWith('announcement_bar_')) {
    return getThemeConfigValue(config, `sections.${sectionId}.settings.enabled`) !== false;
  }
  const enabled = getThemeConfigValue(config, `sections.${sectionId}.enabled`);
  if (enabled === undefined || enabled === null) return true;
  return enabled !== false;
}

export function isTemplateSectionEnabled(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string
): boolean {
  if (!config) return true;
  const enabled = getThemeConfigValue(
    config,
    `templates.${templateId}.sections.${sectionId}.enabled`
  );
  if (enabled === undefined || enabled === null) return true;
  return enabled !== false;
}
