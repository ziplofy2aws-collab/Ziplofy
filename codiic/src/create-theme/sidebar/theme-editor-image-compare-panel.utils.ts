import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

/** Shopify-style Image compare section settings sheet order. */
export const IMAGE_COMPARE_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
  'Theme Settings',
  'Custom CSS',
] as const;

export const IMAGE_COMPARE_LAYOUT_FIELD_ORDER = [
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
  'mediaPosition',
] as const;

const PANEL_GROUPS = new Set<string>(IMAGE_COMPARE_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  verticalOnMobile: 1,
  layoutAlignment: 2,
  position: 3,
  layoutGap: 4,
  mediaPosition: 5,
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
  paddingTop: 31,
  paddingBottom: 32,
  colorScheme: 35,
  customCss: 40,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isImageCompareSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'image-compare' || catalogVariant === 'image-compare';
}

export function isImageComparePanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (field.sidebar === false) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

function remapImageCompareField(field: EditorFieldDef): EditorFieldDef {
  const key = field.path.split('.').pop() ?? '';
  let next = { ...field };

  if (key === 'verticalOnMobile') {
    next = { ...next, label: 'Vertical on mobile', widget: 'toggle', group: 'Layout', type: 'boolean' };
  }
  if (key === 'direction') {
    next = {
      ...next,
      widget: 'segmented',
      group: 'Layout',
      type: 'select',
      options:
        next.options && next.options.length
          ? next.options
          : [
              { value: 'vertical', label: 'Vertical' },
              { value: 'horizontal', label: 'Horizontal' },
            ],
    };
  }
  if (key === 'layoutAlignment') {
    next = {
      ...next,
      label: 'Alignment',
      widget: 'select-inline',
      group: 'Layout',
      type: 'select',
      options:
        next.options && next.options.length
          ? next.options
          : [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
              { value: 'space-between', label: 'Space between' },
            ],
    };
  }
  if (key === 'position') {
    next = {
      ...next,
      widget: 'select-inline',
      group: 'Layout',
      type: 'select',
      options:
        next.options && next.options.length
          ? next.options
          : [
              { value: 'top', label: 'Top' },
              { value: 'center', label: 'Center' },
              { value: 'bottom', label: 'Bottom' },
            ],
    };
  }
  if (key === 'layoutGap') {
    next = {
      ...next,
      label: 'Gap',
      widget: 'slider',
      group: 'Layout',
      type: 'number',
      min: next.min ?? 0,
      max: next.max ?? 100,
      step: next.step ?? 1,
      unit: next.unit ?? 'px',
    };
  }
  if (key === 'mediaPosition') {
    next = {
      ...next,
      label: 'Media position',
      widget: 'segmented',
      group: 'Layout',
      type: 'select',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
    };
  }
  if (key === 'sectionWidth') {
    next = { ...next, widget: 'segmented', group: 'Size' };
  }
  if (key === 'height') {
    next = {
      ...next,
      widget: 'select-inline',
      group: 'Size',
      type: 'select',
      options:
        next.options && next.options.length
          ? next.options
          : [
              { value: 'auto', label: 'Auto' },
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ],
    };
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
    next = { ...next, group: 'Appearance', widget: 'color', type: 'color' };
  }
  if (key === 'borderStyle') {
    next = { ...next, label: 'Style', group: 'Borders', widget: 'segmented' };
  }
  if (key === 'cornerRadius') {
    next = { ...next, group: 'Borders', widget: 'slider' };
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

export function sortImageComparePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupImageComparePanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isImageComparePanelField).map(remapImageCompareField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isImageCompareSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const path = fields[0]?.path ?? '';
  if (!path.includes('image_compare')) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('direction') && keys.has('layoutGap') && keys.has('height') && keys.has('sectionWidth');
}

export function prepareImageCompareSettingsNode(node: SidebarNode): SidebarNode {
  const settingsBase = (() => {
    const path = (node.fields ?? [])[0]?.path ?? '';
    const m = path.match(/^(templates\.[^.]+\.sections\.[^.]+\.settings|sections\.[^.]+\.settings)/);
    if (m) return m[1]!;
    const layout = node.id.match(/^layout:([^:]+)$/);
    if (layout) return `sections.${layout[1]}.settings`;
    const tpl = node.id.match(/^template:([^:]+):([^:]+)$/);
    if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}.settings`;
    return '';
  })();

  let fields = filterSidebarSectionPanelFields(node.fields ?? [], isImageComparePanelField).map(
    remapImageCompareField
  );
  fields = ensureImageCompareSectionFieldDefs(fields, settingsBase);
  fields = sortImageComparePanelFields(fields);
  return { ...node, label: 'Image compare', kind: 'section', fields };
}

/** Ensure Appearance background color + Layout media position exist even if schema is stale. */
export function ensureImageCompareSectionFieldDefs(
  fields: EditorFieldDef[],
  settingsBase: string
): EditorFieldDef[] {
  if (!settingsBase) return fields;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const next = [...fields];
  if (!keys.has('backgroundColor')) {
    next.push({
      path: `${settingsBase}.backgroundColor`,
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    });
  }
  if (!keys.has('mediaPosition')) {
    next.push({
      path: `${settingsBase}.mediaPosition`,
      type: 'select',
      label: 'Media position',
      group: 'Layout',
      widget: 'segmented',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      sidebar: true,
    });
  }
  if (!keys.has('height')) {
    next.push({
      path: `${settingsBase}.height`,
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'select-inline',
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
      sidebar: true,
    });
  } else {
    const idx = next.findIndex((f) => f.path.split('.').pop() === 'height');
    if (idx >= 0) {
      const field = next[idx]!;
      if (!field.options?.length) {
        next[idx] = {
          ...field,
          type: 'select',
          widget: 'select-inline',
          group: 'Size',
          options: [
            { value: 'auto', label: 'Auto' },
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ],
        };
      }
    }
  }
  if (!keys.has('borderStyle')) {
    next.push({
      path: `${settingsBase}.borderStyle`,
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
      sidebar: true,
    });
  }
  if (!keys.has('borderThickness')) {
    next.push({
      path: `${settingsBase}.borderThickness`,
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
    next.push({
      path: `${settingsBase}.borderOpacity`,
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
    next.push({
      path: `${settingsBase}.borderColor`,
      type: 'text',
      label: 'Color',
      group: 'Borders',
      widget: 'color',
      sidebar: true,
    });
  }
  if (!keys.has('cornerRadius')) {
    next.push({
      path: `${settingsBase}.cornerRadius`,
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
  return next;
}
