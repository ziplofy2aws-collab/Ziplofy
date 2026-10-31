import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';
import { layoutBlueprintKey, templateBlueprintKey } from '../../utils/theme-editor-insert-section';
import { STORYTELLING_VIDEO_MEDIA_FIELD_KEYS } from './theme-editor-storytelling-video-media-panel.utils';

/** Shopify-style Video section settings sheet order. */
export const STORYTELLING_VIDEO_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_VIDEO_PANEL_GROUP_ORDER);

export const STORYTELLING_VIDEO_SECTION_FIELD_KEYS = new Set([
  'direction',
  'layoutAlignment',
  'position',
  'layoutGap',
  'sectionWidth',
  'height',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundColor',
  'backgroundOverlay',
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'borderColor',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
]);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  layoutAlignment: 1,
  position: 2,
  layoutGap: 3,
  sectionWidth: 10,
  height: 11,
  backgroundMedia: 21,
  backgroundImageUrl: 22,
  backgroundColor: 23,
  backgroundOverlay: 24,
  borderStyle: 26,
  borderThickness: 27,
  borderOpacity: 28,
  borderColor: 29,
  cornerRadius: 30,
  paddingTop: 40,
  paddingBottom: 41,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

function s(settingsBase: string, key: string): string {
  return `${settingsBase}.${key}`;
}

/** Section node only — not Video/Caption/Text/Button block ids. */
export function storytellingVideoSettingsBaseFromNodeId(nodeId: string): string | null {
  const templateMatch = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (templateMatch) {
    const secId = templateMatch[2]!;
    if (templateBlueprintKey(secId) !== 'storytelling_video') return null;
    return `templates.${templateMatch[1]}.sections.${secId}.settings`;
  }
  const layoutMatch = nodeId.match(/^layout:([^:]+)$/);
  if (layoutMatch) {
    const secId = layoutMatch[1]!;
    if (layoutBlueprintKey(secId) !== 'storytelling_video') return null;
    return `sections.${secId}.settings`;
  }
  return null;
}

export function isStorytellingVideoSectionNodeId(nodeId: string): boolean {
  return storytellingVideoSettingsBaseFromNodeId(nodeId) !== null;
}

export function isStorytellingVideoSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'storytelling-video' || catalogVariant === 'video';
}

/** Canonical section settings so Layout / Size / Appearance work even if pack schema drifts. */
export function storytellingVideoSectionFieldDefs(settingsBase: string): EditorFieldDef[] {
  return [
    {
      path: s(settingsBase, 'direction'),
      type: 'select',
      label: 'Direction',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
    },
    {
      path: s(settingsBase, 'layoutAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s(settingsBase, 'position'),
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
      path: s(settingsBase, 'layoutGap'),
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
    {
      path: s(settingsBase, 'sectionWidth'),
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: s(settingsBase, 'height'),
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'select',
      sidebar: true,
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    },
    {
      path: s(settingsBase, 'backgroundMedia'),
      type: 'select',
      label: 'Background',
      group: 'Appearance',
      widget: 'select',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'image', label: 'Image' },
        { value: 'color', label: 'Color' },
      ],
    },
    {
      path: s(settingsBase, 'backgroundImageUrl'),
      type: 'text',
      label: 'Background image',
      group: 'Appearance',
      widget: 'image',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'backgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'backgroundOverlay'),
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'borderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s(settingsBase, 'borderThickness'),
      type: 'number',
      label: 'Thickness',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 10,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'borderOpacity'),
      type: 'number',
      label: 'Opacity',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'borderColor'),
      type: 'color',
      label: 'Color',
      group: 'Borders',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function isStorytellingVideoPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  const key = field.path.split('.').pop() ?? '';
  return STORYTELLING_VIDEO_SECTION_FIELD_KEYS.has(key);
}

export function sortStorytellingVideoPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupStorytellingVideoPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isStorytellingVideoPanelField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isStorytellingVideoSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  if (!path.includes('storytelling_video')) return false;
  if (!keys.has('direction') || !keys.has('layoutGap')) return false;
  if ([...STORYTELLING_VIDEO_MEDIA_FIELD_KEYS].some((key) => keys.has(key))) return false;
  if (keys.has('caption') && keys.has('captionWidth')) return false;
  if (keys.has('linkLabel') && keys.has('buttonStyle')) return false;
  if (fields.some((f) => f.path.includes('.captionGroup.'))) return false;
  return true;
}

export function prepareStorytellingVideoSettingsNode(node: SidebarNode): SidebarNode {
  const settingsBase = storytellingVideoSettingsBaseFromNodeId(node.id);
  const canonical = settingsBase ? storytellingVideoSectionFieldDefs(settingsBase) : [];
  if (canonical.length) {
    return {
      ...node,
      label: 'Video',
      kind: 'section',
      fields: sortStorytellingVideoPanelFields(canonical),
    };
  }
  const fields = sortStorytellingVideoPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isStorytellingVideoPanelField)
  );
  return { ...node, label: 'Video', kind: 'section', fields };
}

export const STORYTELLING_VIDEO_SECTION_DEFAULTS: Record<string, string | boolean> = {
  direction: 'vertical',
  layoutAlignment: 'left',
  position: 'center',
  layoutGap: '16',
  sectionWidth: 'page',
  height: 'auto',
  backgroundMedia: 'none',
  backgroundImageUrl: '',
  backgroundColor: '',
  backgroundOverlay: false,
  borderStyle: 'none',
  borderThickness: '1',
  borderOpacity: '100',
  borderColor: '',
  cornerRadius: '0',
  paddingTop: '32',
  paddingBottom: '32',
};

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendStorytellingVideoSectionValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = STORYTELLING_VIDEO_SECTION_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}
