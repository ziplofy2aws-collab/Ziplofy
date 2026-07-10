/** Section visibility (`enabled`) paths for sidebar eye toggle + preview. */

export function layoutSectionEnabledPath(instanceId: string): string {
  if (instanceId === 'announcement_bar' || instanceId.startsWith('announcement_bar_')) {
    return `sections.${instanceId}.settings.enabled`;
  }
  return `sections.${instanceId}.enabled`;
}

export function templateSectionEnabledPath(tplId: string, instanceId: string): string {
  return `templates.${tplId}.sections.${instanceId}.enabled`;
}

export function layoutBlockEnabledPath(sectionId: string, blockId: string): string {
  return `sections.${sectionId}.blocks.${blockId}.enabled`;
}

export function templateBlockEnabledPath(tplId: string, sectionId: string, blockId: string): string {
  return `templates.${tplId}.sections.${sectionId}.blocks.${blockId}.enabled`;
}

/** Sidebar node id → config path for visibility, or null for unsupported nodes. */
export function sectionEnabledPathFromNodeId(nodeId: string): string | null {
  const layoutBlock = nodeId.match(/^layout:([^:]+):block:([^:]+)$/);
  if (layoutBlock) return layoutBlockEnabledPath(layoutBlock[1], layoutBlock[2]);

  const templateBlock = nodeId.match(/^template:([^:]+):([^:]+):block:([^:]+)$/);
  if (templateBlock) return templateBlockEnabledPath(templateBlock[1], templateBlock[2], templateBlock[3]);

  const layout = nodeId.match(/^layout:([^:]+)$/);
  if (layout) return layoutSectionEnabledPath(layout[1]);

  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return templateSectionEnabledPath(tpl[1], tpl[2]);

  return null;
}

export function isSectionVisibilityHidden(
  nodeId: string,
  values: Record<string, string | boolean>
): boolean {
  const path = sectionEnabledPathFromNodeId(nodeId);
  if (!path) return false;
  const raw = values[path];
  return raw === false || raw === 'false';
}

/** Seed `values` with section.enabled flags from merged config. */
export function seedSectionEnabledValues(
  config: Record<string, unknown>
): Record<string, boolean> {
  const out: Record<string, boolean> = {};

  const sections = config.sections as
    | Record<string, { enabled?: boolean; settings?: { enabled?: boolean } }>
    | undefined;
  for (const [id, sec] of Object.entries(sections ?? {})) {
    if (!sec || typeof sec !== 'object') continue;
    if (id === 'announcement_bar' || id.startsWith('announcement_bar_')) {
      const enabled = sec.settings?.enabled;
      if (enabled !== undefined) {
        out[layoutSectionEnabledPath(id)] = enabled !== false;
      }
    } else if ('enabled' in sec) {
      out[layoutSectionEnabledPath(id)] = sec.enabled !== false;
    }
    const blocks = (sec as { blocks?: Record<string, { enabled?: boolean }> }).blocks;
    for (const [blockId, block] of Object.entries(blocks ?? {})) {
      if (block && typeof block === 'object' && 'enabled' in block) {
        out[layoutBlockEnabledPath(id, blockId)] = block.enabled !== false;
      }
    }
  }

  const templates = config.templates as
    | Record<string, { sections?: Record<string, { enabled?: boolean }> }>
    | undefined;
  for (const [tplId, tpl] of Object.entries(templates ?? {})) {
    for (const [id, sec] of Object.entries(tpl?.sections ?? {})) {
      if (sec && typeof sec === 'object' && 'enabled' in sec) {
        out[templateSectionEnabledPath(tplId, id)] = sec.enabled !== false;
      }
      const blocks = (sec as { blocks?: Record<string, { enabled?: boolean }> }).blocks;
      for (const [blockId, block] of Object.entries(blocks ?? {})) {
        if (block && typeof block === 'object' && 'enabled' in block) {
          out[templateBlockEnabledPath(tplId, id, blockId)] = block.enabled !== false;
        }
      }
    }
  }

  return out;
}

export function isLayoutSectionNodeId(nodeId: string): boolean {
  return /^layout:[^:]+$/.test(nodeId);
}

export function isTemplateSectionNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+$/.test(nodeId) && nodeId.split(':').length === 3;
}
