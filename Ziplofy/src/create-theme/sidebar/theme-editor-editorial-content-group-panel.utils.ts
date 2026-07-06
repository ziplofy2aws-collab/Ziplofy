import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  editorialSectionBaseFromNodeId,
  isEditorialContentGroupNodeId,
} from './theme-editor-editorial-block-panel.utils';

const CONTENT_GROUP_KEYS = new Set(['layoutAlignment', 'position', 'layoutGap']);

function contentGroupBase(settingsBase: string): string {
  return `${settingsBase}.contentGroup`;
}

export function editorialContentGroupDefaultSettings(): Record<string, string | number | boolean> {
  return {
    layoutAlignment: 'left',
    position: 'space-between',
    layoutGap: 24,
  };
}

export function editorialContentGroupFieldDefs(settingsBase: string): EditorFieldDef[] {
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
        { value: 'space-between', label: 'Space between' },
        { value: 'space-around', label: 'Space around' },
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

export function editorialContentGroupFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = editorialSectionBaseFromNodeId(nodeId);
  if (!sectionBase) return [];
  return editorialContentGroupFieldDefs(`${sectionBase}.settings`);
}

export function pickEditorialContentGroupField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

export function isEditorialContentGroupPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!CONTENT_GROUP_KEYS.has(key)) return false;
  return /\.settings\.contentGroup\./.test(field.path);
}

export function isEditorialContentGroupPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isEditorialContentGroupPanelField);
}

export function prepareEditorialContentGroupSettingsNode(node: SidebarNode): SidebarNode {
  const fields = editorialContentGroupFieldDefsFromNodeId(node.id);
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

export const EDITORIAL_CONTENT_GROUP_DEFAULTS: Record<string, string | boolean> =
  Object.fromEntries(
    Object.entries(editorialContentGroupDefaultSettings()).map(([k, v]) => [
      k,
      typeof v === 'boolean' ? v : String(v),
    ])
  ) as Record<string, string | boolean>;

export function extendEditorialContentGroupValues(
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
    const fallback = EDITORIAL_CONTENT_GROUP_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function isEditorialContentGroupBlockNodeId(nodeId: string): boolean {
  return isEditorialContentGroupNodeId(nodeId);
}

export function seedEditorialContentGroupInSettings(
  settings: Record<string, unknown>
): Record<string, unknown> {
  const existing = settings.contentGroup;
  if (existing && typeof existing === 'object') {
    return {
      ...settings,
      contentGroup: {
        ...editorialContentGroupDefaultSettings(),
        ...(existing as Record<string, unknown>),
      },
    };
  }
  return {
    ...settings,
    contentGroup: editorialContentGroupDefaultSettings(),
  };
}
