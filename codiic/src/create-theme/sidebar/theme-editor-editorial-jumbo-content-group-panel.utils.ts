import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  editorialJumboSectionBaseFromNodeId,
  isEditorialJumboContentGroupNodeId,
} from './theme-editor-editorial-jumbo-block-panel.utils';

export const EDITORIAL_JUMBO_CONTENT_GROUP_PANEL_GROUP_ORDER = ['Layout'] as const;

const CONTENT_GROUP_KEYS = new Set(['layoutAlignment', 'position', 'layoutGap']);

function contentGroupBase(settingsBase: string): string {
  return `${settingsBase}.contentGroup`;
}

export function editorialJumboContentGroupDefaultSettings(): Record<string, string | number | boolean> {
  return {
    layoutAlignment: 'left',
    position: 'bottom',
    layoutGap: 24,
  };
}

export function editorialJumboContentGroupFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${contentGroupBase(settingsBase)}.${key}`;
  return [
    {
      path: s('layoutAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s('position'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: s('layoutGap'),
      type: 'number',
      label: 'Gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function editorialJumboContentGroupFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = editorialJumboSectionBaseFromNodeId(nodeId);
  if (!sectionBase) return [];
  return editorialJumboContentGroupFieldDefs(`${sectionBase}.settings`);
}

export function editorialJumboContentGroupSettingsBaseFromNodeId(nodeId: string): string | null {
  const sectionBase = editorialJumboSectionBaseFromNodeId(nodeId);
  return sectionBase ? `${sectionBase}.settings` : null;
}

export function pickEditorialJumboContentGroupField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

export function isEditorialJumboContentGroupPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!CONTENT_GROUP_KEYS.has(key)) return false;
  return /\.settings\.contentGroup\./.test(field.path);
}

export function isEditorialJumboContentGroupPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isEditorialJumboContentGroupPanelField);
}

export function groupEditorialJumboContentGroupPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isEditorialJumboContentGroupPanelField)) {
    const group = field.group ?? 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function prepareEditorialJumboContentGroupSettingsNode(node: SidebarNode): SidebarNode {
  const fields = editorialJumboContentGroupFieldDefsFromNodeId(node.id);
  return { ...node, label: 'Content', kind: 'block', icon: 'group', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export const EDITORIAL_JUMBO_CONTENT_GROUP_DEFAULTS: Record<string, string | boolean> =
  Object.fromEntries(
    Object.entries(editorialJumboContentGroupDefaultSettings()).map(([k, v]) => [
      k,
      typeof v === 'boolean' ? v : String(v),
    ])
  ) as Record<string, string | boolean>;

export function extendEditorialJumboContentGroupValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const fromConfig = getNested(config, field.path.split('.'));
    if (fromConfig !== undefined && fromConfig !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = EDITORIAL_JUMBO_CONTENT_GROUP_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function isEditorialJumboContentGroupBlockNodeId(nodeId: string): boolean {
  return isEditorialJumboContentGroupNodeId(nodeId);
}

export function seedEditorialJumboContentGroupInSettings(
  settings: Record<string, unknown>
): Record<string, unknown> {
  const existing = settings.contentGroup;
  if (existing && typeof existing === 'object') {
    return {
      ...settings,
      contentGroup: {
        ...editorialJumboContentGroupDefaultSettings(),
        ...(existing as Record<string, unknown>),
      },
    };
  }
  return {
    ...settings,
    contentGroup: editorialJumboContentGroupDefaultSettings(),
  };
}
