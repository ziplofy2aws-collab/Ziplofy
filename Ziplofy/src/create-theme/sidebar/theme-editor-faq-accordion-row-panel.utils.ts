import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath } from '../../utils/theme-editor-insert-section';

export const FAQ_ACCORDION_ROW_PANEL_SETTING_KEYS = new Set([
  'heading',
  'openByDefault',
  'rowIcon',
  'rowImageIconUrl',
  'rowIconWidth',
]);

const ROW_ICON_OPTIONS = [{ value: 'none', label: 'None' }] as const;

export function faqAccordionRowDefaultSettings(
  heading = 'Accordion row'
): Record<string, string | number | boolean> {
  return {
    heading,
    openByDefault: false,
    rowIcon: 'none',
    rowImageIconUrl: '',
    rowIconWidth: 8,
  };
}

export function isFaqAccordionRowNestedNodeId(nodeId: string): boolean {
  return (
    /^template:[^:]+:[^:]+:block:accordion:nested:[^:]+$/.test(nodeId) ||
    /^layout:[^:]+:block:accordion:nested:[^:]+$/.test(nodeId)
  );
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const template = nodeId.match(/^template:([^:]+):([^:]+):block:accordion:nested:([^:]+)$/);
  if (template) {
    return `templates.${template[1]}.sections.${template[2]}.blocks.accordion.blocks.${template[3]}`;
  }
  const layout = nodeId.match(/^layout:([^:]+):block:accordion:nested:([^:]+)$/);
  if (layout) return `sections.${layout[1]}.blocks.accordion.blocks.${layout[2]}`;
  return null;
}

export function faqAccordionRowFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('heading'),
      type: 'text',
      label: 'Heading',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('openByDefault'),
      type: 'boolean',
      label: 'Open row by default',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('rowIcon'),
      type: 'select',
      label: 'Icon',
      group: 'Icon',
      widget: 'select',
      sidebar: true,
      options: [...ROW_ICON_OPTIONS],
    },
    {
      path: s('rowImageIconUrl'),
      type: 'text',
      label: 'Image icon',
      group: 'Icon',
      sidebar: true,
    },
    {
      path: s('rowIconWidth'),
      type: 'number',
      label: 'Width',
      group: 'Icon',
      widget: 'slider',
      min: 8,
      max: 64,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function faqAccordionRowFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? faqAccordionRowFieldDefs(base) : [];
}

export function faqAccordionRowFieldDefsFromSchema(
  schema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  if (!base) return [];
  const tplMatch = nodeId.match(/^template:([^:]+):([^:]+):/);
  const defs = faqAccordionRowFieldDefs(base);
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

export function isFaqAccordionRowField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return FAQ_ACCORDION_ROW_PANEL_SETTING_KEYS.has(key);
}

export function isFaqAccordionRowPanelFields(fields: EditorFieldDef[]): boolean {
  return fields.length > 0 && fields.every(isFaqAccordionRowField);
}

export function prepareFaqAccordionRowSettingsNode(node: SidebarNode): SidebarNode {
  const fields = (node.fields ?? []).filter(isFaqAccordionRowField);
  return { ...node, label: 'Accordion row', kind: 'block', fields };
}

function parseFaqAccordionRowNodeId(
  nodeId: string
): { scope: 'template' | 'layout'; tplId?: string; sectionId: string; rowId: string } | null {
  const template = nodeId.match(/^template:([^:]+):([^:]+):block:accordion:nested:([^:]+)$/);
  if (template) {
    return { scope: 'template', tplId: template[1], sectionId: template[2], rowId: template[3] };
  }
  const layout = nodeId.match(/^layout:([^:]+):block:accordion:nested:([^:]+)$/);
  if (layout) {
    return { scope: 'layout', sectionId: layout[1], rowId: layout[2] };
  }
  return null;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/** Seed sidebar `values` for accordion row panel fields from merged config. */
export function extendValuesForFaqAccordionRow(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const parsed = parseFaqAccordionRowNodeId(nodeId);
  if (!parsed) return values;
  const defs = faqAccordionRowFieldDefsFromSchema(editorSchema, nodeId);
  if (!defs.length) return values;
  const defaults = faqAccordionRowDefaultSettings();
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
