import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateHeroSchemaPath } from '../../utils/theme-editor-insert-section';
import {
  isTextBlockPanelField,
  sortTextBlockPanelFields,
  textBlockDefaultSettings,
  textBlockFieldDefs,
} from './theme-editor-text-block-panel.utils';

export function isHeroTextBlockNodeId(nodeId: string): boolean {
  return (
    /^template:[^:]+:hero_main(?:_\d+)?:block:text(?:_\d+)?$/.test(nodeId) ||
    /^layout:hero_main(?:_\d+)?:block:text(?:_\d+)?$/.test(nodeId)
  );
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const template = nodeId.match(/^template:([^:]+):(hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/);
  if (template) {
    return `templates.${template[1]}.sections.${template[2]}.blocks.${template[3]}`;
  }
  const layout = nodeId.match(/^layout:(hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/);
  if (layout) {
    return `sections.${layout[1]}.blocks.${layout[2]}`;
  }
  return null;
}

export function heroLargeLogoTextDefaultSettings(text: string): Record<string, string | number | boolean> {
  return {
    ...textBlockDefaultSettings(text),
    width: 'fit',
    maxWidth: 'narrow',
    alignment: 'left',
  };
}

export function heroTextBlockFieldDefs(blocksBase: string): EditorFieldDef[] {
  return textBlockFieldDefs(blocksBase);
}

export function heroTextBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  if (!base) return [];
  let fields = heroTextBlockFieldDefs(base);
  const layout = nodeId.match(/^layout:(hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/);
  if (layout) {
    fields = fields.map((f) => ({
      ...f,
      path: remapTemplateHeroSchemaPath(f.path, layout[1]!),
    }));
  }
  return fields;
}

export function heroTextBlockFieldDefsFromNode(
  nodeId: string,
  sectionPrefix: string,
  blockId: string
): EditorFieldDef[] {
  const layoutMatch = sectionPrefix.match(/^layout:(hero_main(?:_\d+)?)$/);
  const templateMatch = sectionPrefix.match(/^template:([^:]+):(hero_main(?:_\d+)?)$/);
  const blocksBase = layoutMatch
    ? `sections.${layoutMatch[1]}.blocks.${blockId}`
    : templateMatch
      ? `templates.${templateMatch[1]}.sections.${templateMatch[2]}.blocks.${blockId}`
      : blocksBaseFromNodeId(nodeId);
  if (!blocksBase) return [];
  let fields = heroTextBlockFieldDefs(blocksBase);
  if (layoutMatch) {
    fields = fields.map((f) => ({
      ...f,
      path: remapTemplateHeroSchemaPath(f.path, layoutMatch[1]!),
    }));
  }
  return fields;
}

export function prepareHeroTextBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortTextBlockPanelFields((node.fields ?? []).filter(isTextBlockPanelField));
  return { ...node, label: 'Text', kind: 'block', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/** Seed sidebar `values` for hero text block panel fields from merged config. */
export function extendValuesForHeroTextBlock(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = heroTextBlockFieldDefsFromNodeId(nodeId);
  if (!defs.length) {
    const match = nodeId.match(
      /^(template:[^:]+:hero_main(?:_\d+)?|layout:hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/
    );
    if (!match) return values;
    const fields = heroTextBlockFieldDefsFromNode(nodeId, match[1]!, match[2]!);
    return seedTextBlockValues(values, fields, config);
  }
  return seedTextBlockValues(values, defs, config);
}

function seedTextBlockValues(
  values: Record<string, string | boolean>,
  defs: EditorFieldDef[],
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const next = { ...values };
  let changed = false;
  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw === undefined) continue;
    if (field.type === 'boolean') {
      next[field.path] = Boolean(raw);
    } else {
      next[field.path] = raw == null ? '' : String(raw);
    }
    changed = true;
  }
  return changed ? next : values;
}
