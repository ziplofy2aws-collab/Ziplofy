import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { enrichHeroPanelField, isHeroSettingsPath } from './theme-editor-hero-panel.utils';
import { ensureMulticolumnBorderFieldDefs } from './theme-editor-multicolumn-panel.utils';

export const LARGE_LOGO_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
] as const;

const LARGE_LOGO_PANEL_KEYS = new Set([
  'direction',
  'layoutAlignment',
  'position',
  'layoutGap',
  'sectionWidth',
  'height',
  'customHeight',
  'backgroundMedia',
  'backgroundColor',
  'backgroundImageUrl',
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'borderColor',
  'cornerRadius',
  'mediaOverlay',
  'overlayColor',
  'overlayStyle',
  'overlayGradientDirection',
  'paddingTop',
  'paddingBottom',
]);

const LAYOUT_KEYS = new Set(['direction', 'layoutAlignment', 'position', 'layoutGap']);
const SIZE_KEYS = new Set(['sectionWidth', 'height', 'customHeight']);

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    direction: 0,
    layoutAlignment: 1,
    position: 2,
    layoutGap: 3,
    sectionWidth: 10,
    height: 11,
    customHeight: 12,
    backgroundMedia: 21,
    backgroundColor: 22,
    backgroundImageUrl: 23,
    mediaOverlay: 24,
    overlayStyle: 25,
    overlayGradientDirection: 26,
    overlayColor: 27,
    borderStyle: 28,
    borderThickness: 29,
    borderOpacity: 30,
    borderColor: 31,
    cornerRadius: 32,
    paddingTop: 40,
    paddingBottom: 41,
  };
  return rank[key] ?? 50;
}

export function isLargeLogoPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!LARGE_LOGO_PANEL_KEYS.has(key)) return false;
  if (!isHeroSettingsPath(field.path)) return false;
  return true;
}

function remapLargeLogoGroup(field: EditorFieldDef): EditorFieldDef {
  const key = field.path.split('.').pop() ?? '';
  let next = enrichHeroPanelField(field);
  if (LAYOUT_KEYS.has(key)) {
    next = { ...next, group: 'Layout' };
  } else if (SIZE_KEYS.has(key)) {
    next = { ...next, group: 'Size' };
  } else if (key === 'mediaOverlay') {
    next = { ...next, label: 'Background overlay', group: 'Appearance', widget: 'toggle' };
  } else if (key === 'overlayColor') {
    next = { ...next, label: 'Overlay color', group: 'Appearance', widget: 'color' };
  } else if (key === 'overlayStyle') {
    next = { ...next, label: 'Overlay style', group: 'Appearance', widget: 'segmented' };
  } else if (key === 'overlayGradientDirection') {
    next = { ...next, label: 'Gradient direction', group: 'Appearance', widget: 'segmented' };
  } else if (key === 'customHeight') {
    next = { ...next, label: 'Custom height', group: 'Size', widget: 'slider' };
  } else if (key === 'backgroundMedia') {
    next = { ...next, group: 'Appearance', widget: 'select-inline' };
  } else if (key === 'backgroundColor') {
    next = { ...next, label: 'Background color', group: 'Appearance', widget: 'color' };
  } else if (key === 'backgroundImageUrl') {
    next = { ...next, group: 'Appearance', widget: 'image' };
  } else if (key === 'borderStyle') {
    next = {
      ...next,
      group: 'Borders',
      widget: 'segmented',
      label: 'Style',
      options:
        next.options && next.options.length
          ? next.options
          : [
              { value: 'none', label: 'None' },
              { value: 'solid', label: 'Solid' },
            ],
    };
  } else if (key === 'borderThickness') {
    next = {
      ...next,
      group: 'Borders',
      widget: 'slider',
      label: 'Thickness',
      min: next.min ?? 0,
      max: next.max ?? 10,
      step: next.step ?? 1,
      unit: next.unit ?? 'px',
    };
  } else if (key === 'borderOpacity') {
    next = {
      ...next,
      group: 'Borders',
      widget: 'slider',
      label: 'Opacity',
      min: next.min ?? 0,
      max: next.max ?? 100,
      step: next.step ?? 1,
      unit: next.unit ?? '%',
    };
  } else if (key === 'borderColor') {
    next = { ...next, group: 'Borders', widget: 'color', label: 'Color' };
  } else if (key === 'cornerRadius') {
    next = { ...next, group: 'Borders', widget: 'slider', label: 'Corner radius' };
  }
  return next;
}

export function sortLargeLogoPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function prepareLargeLogoSettingsNode(node: SidebarNode): SidebarNode {
  let fields = sortLargeLogoPanelFields(
    (node.fields ?? []).filter(isLargeLogoPanelField).map(remapLargeLogoGroup)
  );
  const settingsBase = (() => {
    const sample = fields[0]?.path ?? '';
    const m = sample.match(/^(.*)\.settings\.[^.]+$/);
    return m?.[1] ? `${m[1]}.settings` : null;
  })();
  if (settingsBase && !fields.some((f) => f.path.endsWith('.customHeight'))) {
    fields = sortLargeLogoPanelFields([
      ...fields,
      remapLargeLogoGroup({
        path: `${settingsBase}.customHeight`,
        type: 'number',
        label: 'Custom height',
        group: 'Size',
        widget: 'slider',
        min: 200,
        max: 1200,
        step: 10,
        unit: 'px',
        sidebar: true,
      }),
    ]);
  }
  const overlayKeys = ['overlayColor', 'overlayStyle', 'overlayGradientDirection'] as const;
  if (settingsBase) {
    const extras: EditorFieldDef[] = [];
    for (const key of overlayKeys) {
      if (fields.some((f) => f.path.endsWith(`.${key}`))) continue;
      if (key === 'overlayColor') {
        extras.push(
          remapLargeLogoGroup({
            path: `${settingsBase}.overlayColor`,
            type: 'color',
            label: 'Overlay color',
            group: 'Appearance',
            widget: 'color',
            sidebar: true,
          })
        );
      } else if (key === 'overlayStyle') {
        extras.push(
          remapLargeLogoGroup({
            path: `${settingsBase}.overlayStyle`,
            type: 'select',
            label: 'Overlay style',
            group: 'Appearance',
            widget: 'segmented',
            sidebar: true,
            options: [
              { value: 'solid', label: 'Solid' },
              { value: 'gradient', label: 'Gradient' },
            ],
          })
        );
      } else {
        extras.push(
          remapLargeLogoGroup({
            path: `${settingsBase}.overlayGradientDirection`,
            type: 'select',
            label: 'Gradient direction',
            group: 'Appearance',
            widget: 'segmented',
            sidebar: true,
            options: [
              { value: 'up', label: 'Up' },
              { value: 'down', label: 'Down' },
            ],
          })
        );
      }
    }
    if (extras.length) fields = sortLargeLogoPanelFields([...fields, ...extras]);
  }
  fields = sortLargeLogoPanelFields(
    ensureMulticolumnBorderFieldDefs(fields).map(remapLargeLogoGroup)
  );
  return { ...node, label: 'Large logo', kind: 'section', fields };
}

export function groupLargeLogoPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const sorted = sortLargeLogoPanelFields(
    fields.filter(isLargeLogoPanelField).map(remapLargeLogoGroup)
  );
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of sorted) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isLargeLogoSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isLargeLogoPanelField);
}
