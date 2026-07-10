import { getElementForSectionType } from '../registry';
import type { CreateThemeSettingField } from '../types';

export type ResolvedSettingField = CreateThemeSettingField & {
  path: string;
};

function parseNodeId(nodeId: string): {
  scope: 'layout' | 'template';
  instanceId: string;
  blockId: string | null;
  templateId?: string;
} | null {
  const layoutBlock = nodeId.match(/^layout:([^:]+):block:(.+)$/);
  if (layoutBlock) {
    return { scope: 'layout', instanceId: layoutBlock[1], blockId: layoutBlock[2] };
  }
  const layoutSection = nodeId.match(/^layout:([^:]+)$/);
  if (layoutSection) {
    return { scope: 'layout', instanceId: layoutSection[1], blockId: null };
  }
  const tplBlock = nodeId.match(/^template:([^:]+):([^:]+):block:(.+)$/);
  if (tplBlock) {
    return {
      scope: 'template',
      templateId: tplBlock[1],
      instanceId: tplBlock[2],
      blockId: tplBlock[3],
    };
  }
  const tplSection = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tplSection) {
    return {
      scope: 'template',
      templateId: tplSection[1],
      instanceId: tplSection[2],
      blockId: null,
    };
  }
  return null;
}

/**
 * Settings fields in **editing sequence** from the element folder (`editing.ts`).
 */
export function resolveCreateThemeSettingsFields(
  config: Record<string, unknown>,
  selectedNodeId: string
): ResolvedSettingField[] {
  const parsed = parseNodeId(selectedNodeId);
  if (!parsed) return [];

  let section: Record<string, unknown> | undefined;
  if (parsed.scope === 'layout') {
    const sections = (config.sections ?? {}) as Record<string, Record<string, unknown>>;
    section = sections[parsed.instanceId];
  } else {
    const templates = (config.templates ?? {}) as Record<
      string,
      { sections?: Record<string, Record<string, unknown>> }
    >;
    section = templates[parsed.templateId!]?.sections?.[parsed.instanceId];
  }
  if (!section) return [];

  const sectionType = String(section.type ?? '');
  const element = getElementForSectionType(sectionType);
  if (!element) return [];

  if (parsed.blockId) {
    const blockEditing = element.editing.blocks.find((b) => b.blockId === parsed.blockId);
    if (!blockEditing) return [];
    const prefix =
      parsed.scope === 'layout'
        ? `sections.${parsed.instanceId}.blocks.${parsed.blockId}.settings.`
        : `templates.${parsed.templateId}.sections.${parsed.instanceId}.blocks.${parsed.blockId}.settings.`;
    return blockEditing.settingsOrder.map((f) => ({
      ...f,
      path: `${prefix}${f.key}`,
    }));
  }

  const prefix =
    parsed.scope === 'layout'
      ? `sections.${parsed.instanceId}.settings.`
      : `templates.${parsed.templateId}.sections.${parsed.instanceId}.settings.`;
  return element.editing.sectionSettingsOrder.map((f) => ({
    ...f,
    path: `${prefix}${f.key}`,
  }));
}
