import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  imageWithTextSectionBaseFromNodeId,
  isImageWithTextImageBlockNodeId,
} from './theme-editor-image-with-text-block-panel.utils';

export const IMAGE_WITH_TEXT_IMAGE_PANEL_GROUP_ORDER = [
  'General',
  'Size',
  'Borders',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(IMAGE_WITH_TEXT_IMAGE_PANEL_GROUP_ORDER);

const FIT_FILL_CUSTOM = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'custom', label: 'Custom' },
] as const;

export const IMAGE_WITH_TEXT_IMAGE_FIELD_KEYS = new Set([
  'imageUrl',
  'imageLinkUrl',
  'imageAspectRatio',
  'imageDesktopWidth',
  'imageDesktopCustomWidth',
  'imageMobileWidth',
  'imageMobileCustomWidth',
  'imageBorderStyle',
  'imageBorderThickness',
  'imageBorderOpacity',
  'imageBorderColor',
  'imageCornerRadius',
  'imagePaddingTop',
  'imagePaddingBottom',
  'imagePaddingLeft',
  'imagePaddingRight',
]);

const FIELD_SORT: Record<string, number> = {
  imageUrl: 0,
  imageLinkUrl: 1,
  imageAspectRatio: 10,
  imageDesktopWidth: 11,
  imageDesktopCustomWidth: 12,
  imageMobileWidth: 13,
  imageMobileCustomWidth: 14,
  imageBorderStyle: 20,
  imageBorderThickness: 21,
  imageBorderOpacity: 22,
  imageBorderColor: 23,
  imageCornerRadius: 24,
  imagePaddingTop: 30,
  imagePaddingBottom: 31,
  imagePaddingLeft: 32,
  imagePaddingRight: 33,
};

export function imageWithTextImageDefaultSettings(): Record<string, string | number | boolean> {
  return {
    imageUrl: '',
    imageLinkUrl: '',
    imageAspectRatio: 'square',
    imageDesktopWidth: 'fill',
    imageDesktopCustomWidth: 100,
    imageMobileWidth: 'fill',
    imageMobileCustomWidth: 100,
    imageBorderStyle: 'none',
    imageBorderThickness: 1,
    imageBorderOpacity: 100,
    imageBorderColor: 'default',
    imageCornerRadius: 0,
    imagePaddingTop: 0,
    imagePaddingBottom: 0,
    imagePaddingLeft: 0,
    imagePaddingRight: 0,
  };
}

export const IMAGE_WITH_TEXT_IMAGE_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(imageWithTextImageDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

export function imageWithTextImageFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    {
      path: s('imageUrl'),
      type: 'text',
      label: 'Image',
      group: 'General',
      widget: 'image',
      sidebar: false,
    },
    {
      path: s('imageLinkUrl'),
      type: 'text',
      label: 'Link',
      group: 'General',
      widget: 'link',
      sidebar: false,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('imageAspectRatio'),
      type: 'select',
      label: 'Aspect ratio',
      group: 'Size',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'adapt', label: 'Adapt to image' },
        { value: 'portrait', label: 'Portrait' },
        { value: 'square', label: 'Square' },
        { value: 'landscape', label: 'Landscape' },
      ],
    },
    {
      path: s('imageDesktopWidth'),
      type: 'select',
      label: 'Desktop width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('imageDesktopCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 20,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: false,
    },
    {
      path: s('imageMobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('imageMobileCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 20,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: false,
    },
    {
      path: s('imageBorderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s('imageBorderThickness'),
      type: 'number',
      label: 'Thickness',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 10,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('imageBorderOpacity'),
      type: 'number',
      label: 'Opacity',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: false,
    },
    {
      path: s('imageBorderColor'),
      type: 'text',
      label: 'Color',
      group: 'Borders',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('imageCornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('imagePaddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('imagePaddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('imagePaddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('imagePaddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
  ];
}

export function imageWithTextImageFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = imageWithTextSectionBaseFromNodeId(nodeId);
  return sectionBase ? imageWithTextImageFieldDefs(sectionBase) : [];
}

export function pickImageWithTextImageField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isImageWithTextImagePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!IMAGE_WITH_TEXT_IMAGE_FIELD_KEYS.has(key)) return false;
  if (!/image_with_text/.test(field.path) || field.path.includes('.blocks.')) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isImageWithTextImagePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('imageUrl') && keys.has('imageAspectRatio') && path.includes('image_with_text');
}

export function groupImageWithTextImagePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isImageWithTextImagePanelField)) {
    const group = field.group ?? 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(
      group,
      [...list].sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path))
    );
  }
  return map;
}

export function prepareImageWithTextImageSettingsNode(node: SidebarNode): SidebarNode {
  const built = imageWithTextImageFieldDefsFromNodeId(node.id);
  const fromNode = (node.fields ?? []).filter(isImageWithTextImagePanelField);
  const fields = built.length > 0 ? built : fromNode;
  return { ...node, label: 'Image', kind: 'block', icon: 'image', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendImageWithTextImageBlockValues(
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
    const fallback = IMAGE_WITH_TEXT_IMAGE_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function isImageWithTextImageBlockNodeIdForSeed(nodeId: string): boolean {
  return isImageWithTextImageBlockNodeId(nodeId);
}
