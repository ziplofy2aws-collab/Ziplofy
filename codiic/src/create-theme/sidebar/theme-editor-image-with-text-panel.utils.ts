import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

/** Shopify-style Image with text section settings sheet order. */
export const IMAGE_WITH_TEXT_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
  'Theme Settings',
  'Custom CSS',
] as const;

export const IMAGE_WITH_TEXT_LAYOUT_FIELD_ORDER = [
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
] as const;

const PANEL_GROUPS = new Set<string>(IMAGE_WITH_TEXT_PANEL_GROUP_ORDER);

export const IMAGE_WITH_TEXT_SECTION_FIELD_KEYS = new Set([
  'direction',
  'verticalOnMobile',
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
  'colorScheme',
  'customCss',
]);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  verticalOnMobile: 1,
  layoutAlignment: 2,
  position: 3,
  layoutGap: 4,
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
  paddingTop: 35,
  paddingBottom: 36,
  colorScheme: 40,
  customCss: 45,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isImageWithTextSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'image-with-text' || catalogVariant === 'image-with-text';
}

function remapImageWithTextField(field: EditorFieldDef): EditorFieldDef {
  const key = field.path.split('.').pop() ?? '';
  let next = { ...field };

  if (key === 'verticalOnMobile') {
    next = { ...next, label: 'Vertical on mobile', widget: 'toggle', group: 'Layout' };
  }
  if (key === 'direction') {
    next = { ...next, widget: 'segmented', group: 'Layout' };
  }
  if (key === 'layoutAlignment') {
    next = { ...next, widget: 'select-inline', group: 'Layout' };
  }
  if (key === 'position') {
    next = { ...next, widget: 'select-inline', group: 'Layout' };
  }
  if (key === 'layoutGap') {
    next = { ...next, widget: 'slider', group: 'Layout' };
  }
  if (key === 'sectionWidth') {
    next = { ...next, widget: 'segmented', group: 'Size' };
  }
  if (key === 'height') {
    next = { ...next, widget: 'select-inline', group: 'Size' };
  }
  if (key === 'colorScheme') {
    next = { ...next, widget: 'color-scheme', group: 'Theme Settings' };
  }
  if (key === 'backgroundMedia') {
    next = { ...next, group: 'Appearance', widget: 'select-inline' };
  }
  if (key === 'backgroundImageUrl') {
    next = { ...next, group: 'Appearance', widget: 'image' };
  }
  if (key === 'backgroundColor') {
    next = { ...next, label: 'Background color', group: 'Appearance', widget: 'color', type: 'color' };
  }
  if (key === 'borderStyle') {
    next = { ...next, label: 'Style', group: 'Borders', widget: 'segmented' };
  }
  if (key === 'borderThickness' || key === 'borderOpacity' || key === 'cornerRadius') {
    next = { ...next, group: 'Borders', widget: 'slider' };
  }
  if (key === 'borderColor') {
    next = { ...next, label: 'Color', group: 'Borders', widget: 'color', type: 'text' };
  }
  if (key === 'backgroundOverlay') {
    next = { ...next, group: 'Appearance', widget: 'toggle' };
  }
  if (key === 'paddingTop' || key === 'paddingBottom') {
    next = { ...next, group: 'Padding', widget: 'slider' };
  }
  if (key === 'customCss') {
    next = { ...next, group: 'Custom CSS', widget: 'accordion' };
  }

  return next;
}

export function isImageWithTextPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!IMAGE_WITH_TEXT_SECTION_FIELD_KEYS.has(key)) return false;
  if (
    !/\.sections\.[^.]+\.settings\./.test(field.path) &&
    !/\.templates\.[^.]+\.sections\.[^.]+\.settings\./.test(field.path)
  ) {
    return false;
  }
  if (key === 'colorScheme') return true;
  if (
    key === 'borderStyle' ||
    key === 'borderThickness' ||
    key === 'borderOpacity' ||
    key === 'borderColor' ||
    key === 'cornerRadius'
  ) {
    return true;
  }
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortImageWithTextPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
    'Theme Settings': 5,
    'Custom CSS': 6,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupImageWithTextPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isImageWithTextPanelField).map(remapImageWithTextField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isImageWithTextSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  if (!path.includes('image_with_text')) return false;
  /** Collection links also has imageUrl — do not classify as Image with text. */
  if (keys.has('collectionsPicker') || keys.has('layoutMode')) return false;
  if (!keys.has('direction') || !keys.has('layoutGap') || !keys.has('height')) return false;
  if (keys.has('imageBeforeUrl')) return false;
  return true;
}

export function prepareImageWithTextSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortImageWithTextPanelFields(
    ensureImageWithTextBorderFieldDefs(
      filterSidebarSectionPanelFields(node.fields ?? [], isImageWithTextPanelField).map(
        remapImageWithTextField
      )
    )
  );
  return { ...node, label: 'Image with text', kind: 'section', fields };
}

/** Section `.settings` base from field paths. */
export function imageWithTextSectionSettingsBaseFromFields(
  fields: EditorFieldDef[]
): string | null {
  for (const field of fields) {
    const path = field.path ?? '';
    if (path.includes('.blocks.') || path.includes('.contentGroup.')) continue;
    const match = path.match(/^(.*?\.settings)\./);
    if (match) return match[1];
  }
  for (const field of fields) {
    const path = field.path ?? '';
    const match = path.match(/^(.*?\.settings)\./);
    if (match) return match[1];
  }
  return null;
}

/** Ensure Borders has Style / Thickness / Opacity / Color / Corner radius defs. */
export function ensureImageWithTextBorderFieldDefs(fields: EditorFieldDef[]): EditorFieldDef[] {
  const settingsBase = imageWithTextSectionSettingsBaseFromFields(fields);
  if (!settingsBase) return fields;

  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const extra: EditorFieldDef[] = [];
  const s = (key: string) => `${settingsBase}.${key}`;

  if (!keys.has('borderStyle')) {
    extra.push({
      path: s('borderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    });
  }
  if (!keys.has('borderThickness')) {
    extra.push({
      path: s('borderThickness'),
      type: 'number',
      label: 'Thickness',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 10,
      step: 1,
      unit: 'px',
      sidebar: true,
    });
  }
  if (!keys.has('borderOpacity')) {
    extra.push({
      path: s('borderOpacity'),
      type: 'number',
      label: 'Opacity',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    });
  }
  if (!keys.has('borderColor')) {
    extra.push({
      path: s('borderColor'),
      type: 'text',
      label: 'Color',
      group: 'Borders',
      widget: 'color',
      sidebar: true,
    });
  }
  if (!keys.has('cornerRadius')) {
    extra.push({
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: true,
    });
  }

  return extra.length ? [...fields, ...extra.map(remapImageWithTextField)] : fields;
}
