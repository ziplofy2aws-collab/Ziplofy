import { remapTemplateSchemaPath } from '../../utils/theme-editor-insert-section';
import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';

export const VIEW_ALL_BUTTON_PANEL_GROUP_ORDER = ['Content', 'Appearance', 'Size'] as const;

const PANEL_GROUPS = new Set<string>(VIEW_ALL_BUTTON_PANEL_GROUP_ORDER);

export const VIEW_ALL_BUTTON_PANEL_KEYS = new Set([
  'viewAllLabel',
  'viewAllOpenInNewTab',
  'viewAllStyle',
  'viewAllLinkTextColor',
  'viewAllCustomBackgroundColor',
  'viewAllCustomTextColor',
  'viewAllCustomBorderColor',
  'viewAllDesktopWidth',
  'viewAllDesktopCustomWidth',
  'viewAllMobileWidth',
  'viewAllMobileCustomWidth',
]);

export const VIEW_ALL_CUSTOM_COLOR_KEYS = [
  'viewAllCustomBackgroundColor',
  'viewAllCustomTextColor',
  'viewAllCustomBorderColor',
] as const;

const VIEW_ALL_CUSTOM_COLOR_KEY_SET = new Set<string>(VIEW_ALL_CUSTOM_COLOR_KEYS);

const VIEW_ALL_WIDTH_MODE_OPTIONS = [
  { value: 'fit', label: 'Fit' },
  { value: 'custom', label: 'Custom' },
] as const;

export const VIEW_ALL_STYLE_OPTIONS = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'link', label: 'Link' },
  { value: 'custom', label: 'Custom' },
] as const;

export function viewAllButtonStyleMode(
  values: Record<string, string | boolean>,
  stylePath: string
): string {
  const raw = values[stylePath];
  return typeof raw === 'string' ? raw : raw == null ? 'link' : String(raw);
}

/** Hide link / custom color fields based on the selected style preset. */
export function filterViewAllButtonPanelFieldsForStyle(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const styleField = fields.find((f) => f.path.endsWith('viewAllStyle'));
  if (!styleField) return fields;
  const mode = viewAllButtonStyleMode(values, styleField.path);
  return fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    if (key === 'viewAllLinkTextColor') return mode === 'link';
    if (VIEW_ALL_CUSTOM_COLOR_KEY_SET.has(key)) return mode === 'custom';
    return true;
  });
}

export function resolveViewAllButtonColorField(
  key: (typeof VIEW_ALL_CUSTOM_COLOR_KEYS)[number] | 'viewAllLinkTextColor',
  settingsBase: string,
  fields: EditorFieldDef[],
  label: string
): EditorFieldDef {
  const fromSchema = fields.find((f) => f.path.endsWith(key));
  if (fromSchema) return { ...fromSchema, label: fromSchema.label ?? label };
  return {
    path: `${settingsBase}.${key}`,
    type: 'text',
    label,
    group: 'Appearance',
    widget: 'color',
  };
}

export function isViewAllButtonNestedNodeId(nodeId: string): boolean {
  return /:block:collection_header:nested:view_all_button$/.test(nodeId);
}

/** @deprecated Use {@link isViewAllButtonNestedNodeId} */
export function isFeaturedCollectionHeaderNestedNodeId(nodeId: string): boolean {
  return isViewAllButtonNestedNodeId(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    viewAllLabel: 0,
    viewAllOpenInNewTab: 1,
    viewAllStyle: 10,
    viewAllLinkTextColor: 11,
    viewAllCustomBackgroundColor: 12,
    viewAllCustomTextColor: 13,
    viewAllCustomBorderColor: 14,
    viewAllDesktopWidth: 20,
    viewAllDesktopCustomWidth: 21,
    viewAllMobileWidth: 22,
    viewAllMobileCustomWidth: 23,
  };
  return rank[key] ?? 50;
}

export function isViewAllButtonPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!VIEW_ALL_BUTTON_PANEL_KEYS.has(key)) return false;
  if (!/\.blocks\.collection_header\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isViewAllButtonPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('viewAllLabel') && (keys.has('viewAllStyle') || keys.has('viewAllOpenInNewTab'));
}

export function sortViewAllButtonPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { Content: 0, Appearance: 1, Size: 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupViewAllButtonPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isViewAllButtonPanelField)) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortViewAllButtonPanelFields(list));
  }
  return map;
}

export function prepareViewAllButtonSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortViewAllButtonPanelFields(
    (node.fields ?? []).filter(isViewAllButtonPanelField)
  );
  return { ...node, label: 'View all button', kind: 'block', fields };
}

/** @deprecated Use {@link prepareViewAllButtonSettingsNode} */
export function prepareFeaturedCollectionHeaderNestedNode(node: SidebarNode): SidebarNode {
  return prepareViewAllButtonSettingsNode(node);
}

export function pickViewAllButtonPanelField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

export function viewAllButtonWidthModeField(
  field: EditorFieldDef | undefined
): EditorFieldDef | null {
  if (!field) return null;
  return {
    ...field,
    options: [...VIEW_ALL_WIDTH_MODE_OPTIONS],
    widget: 'segmented',
  };
}

export function resolveViewAllButtonCustomWidthField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined,
  key: 'viewAllDesktopCustomWidth' | 'viewAllMobileCustomWidth'
): EditorFieldDef | null {
  const existing = pickViewAllButtonPanelField(fields, key);
  if (existing) {
    return {
      ...existing,
      label: 'Custom width',
      type: 'number',
      min: existing.min ?? 1,
      max: existing.max ?? 100,
      step: existing.step ?? 1,
      unit: existing.unit ?? '%',
      group: 'Size',
    };
  }
  if (!anchor) return null;
  const prefix = anchor.path.replace(/\.viewAll(?:Desktop|Mobile)Width$/, '');
  return {
    path: `${prefix}.${key}`,
    label: 'Custom width',
    type: 'number',
    group: 'Size',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
  };
}

export function viewAllButtonSettingsBaseFromNodeId(nodeId: string): string | null {
  const match = nodeId.match(/^template:([^:]+):(featured_collection(?:_\d+)?):block:collection_header/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.collection_header.settings`;
}

export function viewAllButtonSettingsBaseFromPrefix(prefix: string): string | null {
  const match = prefix.match(/^template:([^:]+):(featured_collection(?:_\d+)?)$/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.collection_header.settings`;
}

export function viewAllButtonFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('viewAllLabel'),
      type: 'text',
      label: 'Label',
      group: 'Content',
      sidebar: false,
    },
    {
      path: s('viewAllOpenInNewTab'),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Content',
      sidebar: false,
    },
    {
      path: s('viewAllStyle'),
      type: 'select',
      label: 'Style',
      group: 'Appearance',
      widget: 'select',
      sidebar: false,
      options: [...VIEW_ALL_STYLE_OPTIONS],
    },
    {
      path: s('viewAllLinkTextColor'),
      type: 'text',
      label: 'Link text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('viewAllCustomBackgroundColor'),
      type: 'text',
      label: 'Background',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('viewAllCustomTextColor'),
      type: 'text',
      label: 'Text',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('viewAllCustomBorderColor'),
      type: 'text',
      label: 'Borders',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('viewAllDesktopWidth'),
      type: 'select',
      label: 'Desktop width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...VIEW_ALL_WIDTH_MODE_OPTIONS],
    },
    {
      path: s('viewAllDesktopCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      sidebar: false,
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
    },
    {
      path: s('viewAllMobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...VIEW_ALL_WIDTH_MODE_OPTIONS],
    },
    {
      path: s('viewAllMobileCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      sidebar: false,
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
    },
  ];
}

function canonicalViewAllButtonFieldsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => s.id === 'featured_collection');
  const header = sec?.blocks?.find((b) => b.id === 'collection_header');
  const nested = header?.blocks?.find((b) => b.id === 'view_all_button');
  return nested?.settingsFields ?? [];
}

export function viewAllButtonFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId?: string
): EditorFieldDef[] {
  const canon = canonicalViewAllButtonFieldsFromSchema(editorSchema).filter((field) => {
    const key = field.path.split('.').pop() ?? '';
    return VIEW_ALL_BUTTON_PANEL_KEYS.has(key);
  });
  const settingsBase = nodeId ? viewAllButtonSettingsBaseFromNodeId(nodeId) : null;
  if (settingsBase) {
    if (canon.length) {
      const match = nodeId?.match(/^template:([^:]+):(featured_collection(?:_\d+)?):/);
      const schemaKeys = new Set(canon.map((field) => field.path.split('.').pop() ?? ''));
      const fromSchema = match
        ? canon.map((field) => ({
            ...field,
            path: remapTemplateSchemaPath(field.path, match[1]!, match[2]!),
          }))
        : canon;
      const fromBuilt = viewAllButtonFieldDefs(settingsBase).filter(
        (field) => !schemaKeys.has(field.path.split('.').pop() ?? '')
      );
      return [...fromSchema, ...fromBuilt];
    }
    return viewAllButtonFieldDefs(settingsBase);
  }
  return canon;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendValuesForViewAllButtonBlock(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = viewAllButtonFieldDefsFromSchema(editorSchema, nodeId);
  const match = nodeId.match(/^template:([^:]+):(featured_collection(?:_\d+)?):/);
  const settingsBase = match
    ? `templates.${match[1]}.sections.${match[2]}.blocks.collection_header.settings`
    : '';
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

  if (settingsBase) {
    const defaults: Record<string, string | boolean> = {
      [`${settingsBase}.viewAllLabel`]: 'View all',
      [`${settingsBase}.viewAllOpenInNewTab`]: false,
      [`${settingsBase}.viewAllStyle`]: 'link',
      [`${settingsBase}.viewAllLinkTextColor`]: 'default',
      [`${settingsBase}.viewAllCustomBackgroundColor`]: 'palette:0',
      [`${settingsBase}.viewAllCustomTextColor`]: 'palette:1',
      [`${settingsBase}.viewAllCustomBorderColor`]: 'palette:1',
      [`${settingsBase}.viewAllDesktopWidth`]: 'fit',
      [`${settingsBase}.viewAllDesktopCustomWidth`]: '100',
      [`${settingsBase}.viewAllMobileWidth`]: 'fit',
      [`${settingsBase}.viewAllMobileCustomWidth`]: '100',
    };
    for (const [path, fallback] of Object.entries(defaults)) {
      if (next[path] !== undefined) continue;
      const fromConfig = getNested(config, path.split('.'));
      if (fromConfig !== undefined && fromConfig !== null && fromConfig !== '') {
        next[path] =
          typeof fallback === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      } else {
        next[path] = fallback;
      }
      changed = true;
    }
  }

  if (!defs.length && !changed) return values;
  return changed ? next : values;
}
