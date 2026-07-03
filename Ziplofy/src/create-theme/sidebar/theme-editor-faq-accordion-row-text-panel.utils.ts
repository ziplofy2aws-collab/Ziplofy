import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath } from '../../utils/theme-editor-insert-section';
import {
  groupTextBlockPanelFields,
  isTextBlockPanelField,
  isTextBlockPanelFields,
  sortTextBlockPanelFields,
  textBlockDefaultSettings,
  textBlockFieldDefs,
} from './theme-editor-text-block-panel.utils';

export {
  groupTextBlockPanelFields,
  isTextBlockPanelFields,
  isTextBlockTypographyCustomPreset,
  filterTextBlockPanelFieldsForTypographyPreset,
  resolveTextBlockTypographyField,
  TEXT_BLOCK_APPEARANCE_FIELD_ORDER,
  TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS,
  TEXT_BLOCK_PANEL_GROUP_ORDER,
  TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS,
} from './theme-editor-text-block-panel.utils';

export function isFaqAccordionRowTextNestedNodeId(nodeId: string): boolean {
  return (
    /^template:[^:]+:[^:]+:block:accordion:nested:[^:]+:nested:[^:]+$/.test(nodeId) ||
    /^layout:[^:]+:block:accordion:nested:[^:]+:nested:[^:]+$/.test(nodeId)
  );
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const template = nodeId.match(
    /^template:([^:]+):([^:]+):block:accordion:nested:([^:]+):nested:([^:]+)$/
  );
  if (template) {
    return `templates.${template[1]}.sections.${template[2]}.blocks.accordion.blocks.${template[3]}.blocks.${template[4]}`;
  }
  const layout = nodeId.match(/^layout:([^:]+):block:accordion:nested:([^:]+):nested:([^:]+)$/);
  if (layout) {
    return `sections.${layout[1]}.blocks.accordion.blocks.${layout[2]}.blocks.${layout[3]}`;
  }
  return null;
}

export function faqAccordionRowTextDefaultSettings(text = ''): Record<string, string | number | boolean> {
  return textBlockDefaultSettings(text);
}

export function faqAccordionRowTextFieldDefs(blocksBase: string): EditorFieldDef[] {
  return textBlockFieldDefs(blocksBase);
}

export function faqAccordionRowTextFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? faqAccordionRowTextFieldDefs(base) : [];
}

export function faqAccordionRowTextFieldDefsFromSchema(
  schema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  if (!base) return [];
  const tplMatch = nodeId.match(/^template:([^:]+):([^:]+):/);
  const defs = faqAccordionRowTextFieldDefs(base);
  if (tplMatch) {
    return defs.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplMatch[1], tplMatch[2]),
    }));
  }
  const layoutMatch = nodeId.match(/^layout:([^:]+):/);
  if (layoutMatch) {
    return defs.map((f) => ({
      ...f,
      path: f.path.replace('sections.faq_section', `sections.${layoutMatch[1]}`),
    }));
  }
  return defs;
}

export function isFaqAccordionRowTextField(field: EditorFieldDef): boolean {
  return isTextBlockPanelField(field);
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const part of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/** Seed sidebar `values` for accordion row text block panel fields from merged config. */
export function extendValuesForFaqAccordionRowText(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = faqAccordionRowTextFieldDefsFromSchema(editorSchema, nodeId);
  if (!defs.length) return values;
  const defaults = faqAccordionRowTextDefaultSettings();
  const next = { ...values };
  let changed = false;
  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const key = field.path.split('.').pop() ?? '';
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
      changed = true;
      continue;
    }
    const fallback = defaults[key];
    if (fallback === undefined) continue;
    next[field.path] = typeof fallback === 'boolean' ? fallback : String(fallback);
    changed = true;
  }
  return changed ? next : values;
}

export function prepareFaqAccordionRowTextSettingsNode(node: SidebarNode): SidebarNode {
  const canonical = faqAccordionRowTextFieldDefsFromNodeId(node.id);
  const byKey = new Map<string, EditorFieldDef>();

  for (const field of canonical) {
    byKey.set(field.path.split('.').pop() ?? '', field);
  }
  for (const field of (node.fields ?? []).filter(isTextBlockPanelField)) {
    const key = field.path.split('.').pop() ?? '';
    const base = byKey.get(key);
    byKey.set(
      key,
      base
        ? {
            ...base,
            ...field,
            path: field.path,
            group: field.group ?? base.group,
            widget: field.widget ?? base.widget,
            options: field.options?.length ? field.options : base.options,
          }
        : field
    );
  }

  const fields = sortTextBlockPanelFields(
    Array.from(byKey.values()).filter(isTextBlockPanelField)
  );

  if (!fields.length) {
    return { ...node, label: 'Text', kind: 'block', fields: canonical };
  }
  return { ...node, label: 'Text', kind: 'block', fields };
}
