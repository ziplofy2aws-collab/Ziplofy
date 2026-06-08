import { getThemeConfigValue } from '@render-store/sdk';
import { blueprintIdFromInstanceId } from '../registry';

export function readLayoutSection(
  config: Record<string, unknown> | null,
  instanceId: string
): Record<string, unknown> | null {
  const sec = getThemeConfigValue(config, `sections.${instanceId}`);
  if (sec != null && typeof sec === 'object' && !Array.isArray(sec)) {
    return sec as Record<string, unknown>;
  }
  return null;
}

export function readTemplateSection(
  config: Record<string, unknown> | null,
  templateId: string,
  instanceId: string
): Record<string, unknown> | null {
  const sec = getThemeConfigValue(config, `templates.${templateId}.sections.${instanceId}`);
  if (sec != null && typeof sec === 'object' && !Array.isArray(sec)) {
    return sec as Record<string, unknown>;
  }
  return null;
}

export function sectionTypeFromRecord(instanceId: string, record: Record<string, unknown> | null): string {
  if (record?.type && String(record.type).trim()) return String(record.type);
  const blueprint = blueprintIdFromInstanceId(instanceId);
  if (blueprint === 'announcement_bar') return 'announcement-bar';
  if (blueprint === 'footer_utilities') return 'footer-utilities';
  if (blueprint.includes('_')) return blueprint.replace(/_/g, '-');
  return blueprint;
}
