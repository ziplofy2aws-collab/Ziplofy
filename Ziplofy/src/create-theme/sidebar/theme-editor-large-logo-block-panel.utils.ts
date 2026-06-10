import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateHeroSchemaPath } from '../../utils/theme-editor-insert-section';

export const LARGE_LOGO_BLOCK_PANEL_GROUP_ORDER = ['Typography', 'Size', 'Padding'] as const;

const PANEL_KEYS = new Set([
  'logoFont',
  'sizeUnit',
  'pixelHeight',
  'percentWidth',
  'customMobileSize',
  'mobileSizeUnit',
  'mobilePixelHeight',
  'mobilePercentWidth',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

const FONT_OPTIONS = [
  { value: 'body', label: 'Body' },
  { value: 'subheading', label: 'Subheading' },
  { value: 'heading', label: 'Heading' },
  { value: 'accent', label: 'Accent' },
] as const;

export function isHeroLargeLogoBlockNodeId(nodeId: string): boolean {
  return (
    /^template:[^:]+:hero_main(?:_\d+)?:block:logo$/.test(nodeId) ||
    /^layout:hero_main(?:_\d+)?:block:logo$/.test(nodeId)
  );
}

export function largeLogoBlockFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('logoFont'),
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...FONT_OPTIONS],
    },
    {
      path: s('sizeUnit'),
      type: 'select',
      label: 'Unit',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'pixel', label: 'Pixel' },
        { value: 'percent', label: 'Percent' },
      ],
    },
    {
      path: s('pixelHeight'),
      type: 'number',
      label: 'Height',
      group: 'Size',
      widget: 'slider',
      min: 16,
      max: 320,
      step: 8,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('percentWidth'),
      type: 'number',
      label: 'Width',
      group: 'Size',
      widget: 'slider',
      min: 10,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('customMobileSize'),
      type: 'boolean',
      label: 'Custom mobile size',
      group: 'Size',
      sidebar: true,
    },
    {
      path: s('mobileSizeUnit'),
      type: 'select',
      label: 'Unit',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'pixel', label: 'Pixel' },
        { value: 'percent', label: 'Percent' },
      ],
    },
    {
      path: s('mobilePixelHeight'),
      type: 'number',
      label: 'Height',
      group: 'Size',
      widget: 'slider',
      min: 16,
      max: 160,
      step: 8,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('mobilePercentWidth'),
      type: 'number',
      label: 'Width',
      group: 'Size',
      widget: 'slider',
      min: 10,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const template = nodeId.match(/^template:([^:]+):(hero_main(?:_\d+)?):block:logo$/);
  if (template) {
    return `templates.${template[1]}.sections.${template[2]}.blocks.logo`;
  }
  const layout = nodeId.match(/^layout:(hero_main(?:_\d+)?):block:logo$/);
  if (layout) {
    return `sections.${layout[1]}.blocks.logo`;
  }
  return null;
}

export function largeLogoBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  if (!base) return [];
  let fields = largeLogoBlockFieldDefs(base);
  const layout = nodeId.match(/^layout:(hero_main(?:_\d+)?):block:logo$/);
  if (layout) {
    fields = fields.map((f) => ({
      ...f,
      path: remapTemplateHeroSchemaPath(f.path, layout[1]!),
    }));
  }
  return fields;
}

export function isLargeLogoBlockPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!PANEL_KEYS.has(key)) return false;
  return /\.blocks\.[^.]+\.settings\./.test(field.path);
}

export function isLargeLogoBlockPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('logoFont') && keys.has('sizeUnit');
}

function fieldSortKey(path: string): number {
  const rank: Record<string, number> = {
    logoFont: 0,
    sizeUnit: 10,
    pixelHeight: 11,
    percentWidth: 12,
    customMobileSize: 13,
    mobileSizeUnit: 14,
    mobilePixelHeight: 15,
    mobilePercentWidth: 16,
    paddingTop: 30,
    paddingBottom: 31,
    paddingLeft: 32,
    paddingRight: 33,
  };
  return rank[path.split('.').pop() ?? ''] ?? 50;
}

export function sortLargeLogoBlockPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { Typography: 0, Size: 1, Padding: 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupLargeLogoBlockPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isLargeLogoBlockPanelField)) {
    const group = field.group ?? 'Size';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortLargeLogoBlockPanelFields(list));
  }
  return map;
}

export function prepareLargeLogoBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortLargeLogoBlockPanelFields(
    (node.fields ?? []).filter(isLargeLogoBlockPanelField)
  );
  return { ...node, label: 'Logo', kind: 'block', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/** Seed sidebar `values` for logo block panel fields from merged config. */
export function extendValuesForLargeLogoBlock(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = largeLogoBlockFieldDefsFromNodeId(nodeId);
  if (!defs.length) return values;
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
