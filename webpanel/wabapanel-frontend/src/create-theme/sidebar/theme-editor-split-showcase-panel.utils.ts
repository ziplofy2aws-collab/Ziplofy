import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { enrichHeroPanelField, isHeroSettingsPath } from './theme-editor-hero-panel.utils';
import { ensureMulticolumnBorderFieldDefs } from './theme-editor-multicolumn-panel.utils';

/** Shopify-style Split showcase section settings sheet order. */
export const SPLIT_SHOWCASE_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
] as const;

const SPLIT_SHOWCASE_PANEL_KEYS = new Set([
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
  'sectionWidth',
  'height',
  'customHeight',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundColor',
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'borderColor',
  'cornerRadius',
  'mediaOverlay',
  'paddingTop',
  'paddingBottom',
]);

const LAYOUT_KEYS = new Set([
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
]);
const SIZE_KEYS = new Set(['sectionWidth', 'height']);

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    direction: 0,
    verticalOnMobile: 1,
    layoutAlignment: 2,
    position: 3,
    layoutGap: 4,
    sectionWidth: 10,
    height: 11,
    customHeight: 12,
    backgroundMedia: 21,
    backgroundColor: 22,
    backgroundImageUrl: 23,
    mediaOverlay: 25,
    borderStyle: 26,
    borderThickness: 27,
    borderOpacity: 28,
    borderColor: 29,
    cornerRadius: 30,
    paddingTop: 40,
    paddingBottom: 41,
  };
  return rank[key] ?? 50;
}

export function isSplitShowcasePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!SPLIT_SHOWCASE_PANEL_KEYS.has(key)) return false;
  if (!isHeroSettingsPath(field.path)) return false;
  return true;
}

function settingsBaseFromFields(fields: EditorFieldDef[]): string | null {
  const anchor =
    fields.find((f) => f.path.endsWith('.backgroundMedia')) ??
    fields.find((f) => f.path.endsWith('.direction')) ??
    fields.find((f) => isHeroSettingsPath(f.path));
  if (!anchor) return null;
  return anchor.path.replace(/\.[^.]+$/, '');
}

/** The shared hero schema has no backgroundColor; synthesize one so Split showcase can expose it. */
function withSplitShowcaseBackgroundColor(fields: EditorFieldDef[]): EditorFieldDef[] {
  if (fields.some((f) => f.path.endsWith('.backgroundColor'))) return fields;
  const base = settingsBaseFromFields(fields);
  if (!base) return fields;
  return [
    ...fields,
    {
      path: `${base}.backgroundColor`,
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
  ];
}

/** Ensure Custom height slider exists when Height → Custom is available. */
function withSplitShowcaseCustomHeight(fields: EditorFieldDef[]): EditorFieldDef[] {
  if (fields.some((f) => f.path.endsWith('.customHeight'))) return fields;
  const heightField = fields.find((f) => f.path.endsWith('.height'));
  if (!heightField) return fields;
  const base = heightField.path.replace(/\.height$/, '');
  return [
    ...fields,
    {
      path: `${base}.customHeight`,
      type: 'number',
      label: 'Custom height',
      group: 'Size',
      widget: 'slider',
      min: 200,
      max: 1200,
      step: 10,
      unit: 'px',
      sidebar: true,
    },
  ];
}

/** Ensure Borders: Style + Thickness / Opacity / Color + Corner radius. */
function withSplitShowcaseBorderFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return ensureMulticolumnBorderFieldDefs(fields);
}

function prepareSplitShowcasePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const prepared = withSplitShowcaseBorderFields(
    withSplitShowcaseCustomHeight(
      withSplitShowcaseBackgroundColor(fields.filter(isSplitShowcasePanelField))
    )
  );
  return sortSplitShowcasePanelFields(prepared.map(remapSplitShowcaseField));
}

function remapSplitShowcaseField(field: EditorFieldDef): EditorFieldDef {
  const key = field.path.split('.').pop() ?? '';
  let next = enrichHeroPanelField(field);

  if (LAYOUT_KEYS.has(key)) {
    next = { ...next, group: 'Layout' };
    if (key === 'verticalOnMobile') {
      next = { ...next, label: 'Vertical on mobile', widget: 'toggle' };
    }
    if (key === 'direction') {
      next = { ...next, widget: 'segmented' };
    }
    if (key === 'layoutAlignment' || key === 'position') {
      next = { ...next, widget: 'select-inline' };
    }
  } else if (SIZE_KEYS.has(key)) {
    next = { ...next, group: 'Size' };
  } else if (key === 'customHeight') {
    next = {
      ...next,
      label: 'Custom height',
      group: 'Size',
      widget: 'slider',
      min: next.min ?? 200,
      max: next.max ?? 1200,
      step: next.step ?? 10,
      unit: next.unit ?? 'px',
    };
  } else if (key === 'mediaOverlay') {
    next = {
      ...next,
      label: 'Background overlay',
      group: 'Appearance',
      widget: 'toggle',
      sidebar: true,
    };
  } else if (key === 'backgroundMedia') {
    next = { ...next, group: 'Appearance', widget: 'select-inline' };
  } else if (key === 'backgroundColor') {
    next = { ...next, label: 'Background color', group: 'Appearance', widget: 'color' };
  } else if (key === 'backgroundImageUrl') {
    next = { ...next, group: 'Appearance', widget: 'image' };
  } else if (key === 'borderStyle') {
    next = {
      ...next,
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
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
      label: 'Thickness',
      group: 'Borders',
      widget: 'slider',
      min: next.min ?? 0,
      max: next.max ?? 10,
      step: next.step ?? 1,
      unit: next.unit ?? 'px',
    };
  } else if (key === 'borderOpacity') {
    next = {
      ...next,
      label: 'Opacity',
      group: 'Borders',
      widget: 'slider',
      min: next.min ?? 0,
      max: next.max ?? 100,
      step: next.step ?? 1,
      unit: next.unit ?? '%',
    };
  } else if (key === 'borderColor') {
    next = { ...next, label: 'Color', group: 'Borders', widget: 'color' };
  } else if (key === 'cornerRadius') {
    next = {
      ...next,
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: next.min ?? 0,
      max: next.max ?? 40,
      step: next.step ?? 1,
      unit: next.unit ?? 'px',
    };
  } else if (key === 'paddingTop' || key === 'paddingBottom') {
    next = { ...next, group: 'Padding', widget: 'slider' };
  }

  return next;
}

export function sortSplitShowcasePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function prepareSplitShowcaseSettingsNode(node: SidebarNode): SidebarNode {
  const fields = prepareSplitShowcasePanelFields(node.fields ?? []);
  return { ...node, label: 'Split showcase', kind: 'section', fields };
}

export function groupSplitShowcasePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const sorted = prepareSplitShowcasePanelFields(fields);
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of sorted) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isSplitShowcaseSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('media1Type') || keys.has('marqueeText') || keys.has('media1ImageUrl')) return false;
  return keys.has('verticalOnMobile') && keys.has('direction') && keys.has('sectionWidth');
}
