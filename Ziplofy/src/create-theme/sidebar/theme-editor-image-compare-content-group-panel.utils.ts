import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { imageCompareSectionBaseFromNodeId } from './theme-editor-image-compare-block-panel.utils';

export const IMAGE_COMPARE_CONTENT_GROUP_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Block link',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(IMAGE_COMPARE_CONTENT_GROUP_PANEL_GROUP_ORDER);

const FIT_FILL_CUSTOM = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'custom', label: 'Custom' },
] as const;

export const IMAGE_COMPARE_CONTENT_GROUP_FIELD_KEYS = new Set([
  'contentDirection',
  'contentAlignment',
  'contentPosition',
  'contentGap',
  'contentWidth',
  'contentCustomWidth',
  'contentMobileWidth',
  'contentMobileCustomWidth',
  'contentHeight',
  'contentCustomHeight',
  'contentInheritColorScheme',
  'contentBackgroundMedia',
  'contentBackgroundImageUrl',
  'contentBorderStyle',
  'contentCornerRadius',
  'contentBackgroundOverlay',
  'contentLinkUrl',
  'contentOpenInNewTab',
  'contentPaddingTop',
  'contentPaddingBottom',
  'contentPaddingLeft',
  'contentPaddingRight',
]);

const FIELD_SORT: Record<string, number> = {
  contentDirection: 0,
  contentAlignment: 1,
  contentPosition: 2,
  contentGap: 3,
  contentWidth: 10,
  contentCustomWidth: 11,
  contentMobileWidth: 12,
  contentMobileCustomWidth: 13,
  contentHeight: 14,
  contentCustomHeight: 15,
  contentInheritColorScheme: 20,
  contentBackgroundMedia: 21,
  contentBackgroundImageUrl: 22,
  contentBorderStyle: 23,
  contentCornerRadius: 24,
  contentBackgroundOverlay: 25,
  contentLinkUrl: 30,
  contentOpenInNewTab: 31,
  contentPaddingTop: 40,
  contentPaddingBottom: 41,
  contentPaddingLeft: 42,
  contentPaddingRight: 43,
};

export function imageCompareContentGroupDefaultSettings(): Record<string, string | number | boolean> {
  return {
    contentDirection: 'vertical',
    contentAlignment: 'center',
    contentPosition: 'center',
    contentGap: 30,
    contentWidth: 'fit',
    contentCustomWidth: 100,
    contentMobileWidth: 'fill',
    contentMobileCustomWidth: 100,
    contentHeight: 'fit',
    contentCustomHeight: 100,
    contentInheritColorScheme: true,
    contentBackgroundMedia: 'none',
    contentBackgroundImageUrl: '',
    contentBorderStyle: 'none',
    contentCornerRadius: 0,
    contentBackgroundOverlay: false,
    contentLinkUrl: '',
    contentOpenInNewTab: false,
    contentPaddingTop: 48,
    contentPaddingBottom: 48,
    contentPaddingLeft: 56,
    contentPaddingRight: 56,
  };
}

export function imageCompareContentGroupFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    {
      path: s('contentDirection'),
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
      path: s('contentAlignment'),
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
      path: s('contentPosition'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: s('contentGap'),
      type: 'number',
      label: 'Gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('contentWidth'),
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('contentCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('contentMobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('contentMobileCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('contentHeight'),
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('contentCustomHeight'),
      type: 'number',
      label: 'Custom height',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('contentInheritColorScheme'),
      type: 'boolean',
      label: 'Inherit color scheme',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s('contentBackgroundMedia'),
      type: 'select',
      label: 'Background media',
      group: 'Appearance',
      widget: 'select',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'image', label: 'Image' },
      ],
    },
    {
      path: s('contentBackgroundImageUrl'),
      type: 'text',
      label: 'Image',
      group: 'Appearance',
      widget: 'image',
      sidebar: true,
    },
    {
      path: s('contentBorderStyle'),
      type: 'select',
      label: 'Borders',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s('contentCornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('contentBackgroundOverlay'),
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s('contentLinkUrl'),
      type: 'text',
      label: 'Link',
      group: 'Block link',
      widget: 'link',
      sidebar: true,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('contentOpenInNewTab'),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Block link',
      sidebar: true,
    },
    {
      path: s('contentPaddingTop'),
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
      path: s('contentPaddingBottom'),
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
      path: s('contentPaddingLeft'),
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
      path: s('contentPaddingRight'),
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

export function imageCompareContentGroupFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = imageCompareSectionBaseFromNodeId(nodeId);
  if (!sectionBase) return [];
  return imageCompareContentGroupFieldDefs(sectionBase);
}

export function pickImageCompareContentGroupField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function sortImageCompareContentGroupPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    'Block link': 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupImageCompareContentGroupPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isImageCompareContentGroupField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/image_compare/.test(field.path) || field.path.includes('.blocks.')) return false;
  return IMAGE_COMPARE_CONTENT_GROUP_FIELD_KEYS.has(key);
}

export function isImageCompareContentGroupFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isImageCompareContentGroupField);
}

export function prepareImageCompareContentGroupSettingsNode(node: SidebarNode): SidebarNode {
  const fromNode = imageCompareContentGroupFieldDefsFromNodeId(node.id);
  const fields = sortImageCompareContentGroupPanelFields(
    fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isImageCompareContentGroupField)
  );
  return { ...node, label: 'Content', kind: 'block', fields };
}
