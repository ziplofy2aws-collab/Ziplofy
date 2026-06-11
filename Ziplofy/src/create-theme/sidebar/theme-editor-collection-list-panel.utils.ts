import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { fieldValueAsString } from './create-theme-field.utils';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export type CollectionListCardsLayoutType = 'bento' | 'grid' | 'carousel' | 'editorial';

export const COLLECTION_LIST_PANEL_GROUP_ORDER = [
  'Collections',
  'Cards layout',
  'Carousel navigation',
  'Section layout',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_LIST_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  collectionsPicker: 0,
  cardsLayoutType: 0,
  carouselOnMobile: 1,
  cardsGap: 2,
  columns: 3,
  mobileColumns: 4,
  horizontalGap: 5,
  verticalGap: 6,
  collectionCount: 2,
  navigationIcon: 0,
  navigationIconBackground: 1,
  sectionWidth: 0,
  layoutGap: 1,
  colorScheme: 2,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

const CARDS_LAYOUT_OPTIONS = [
  { value: 'bento', label: 'Bento' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'grid', label: 'Grid' },
] as const;

const WIDTH_OPTIONS = [
  { value: 'page', label: 'Page' },
  { value: 'full', label: 'Full' },
];

const SCHEME_OPTIONS = [
  { value: 'scheme-1', label: 'Scheme 1' },
  { value: 'scheme-2', label: 'Scheme 2' },
  { value: 'scheme-3', label: 'Scheme 3' },
  { value: 'scheme-4', label: 'Scheme 4' },
];

function fieldDef(settingsBase: string, key: string, spec: Omit<EditorFieldDef, 'path'>): EditorFieldDef {
  return { path: `${settingsBase}.${key}`, ...spec };
}

/** Full panel field set for a collection list section (all layout-specific keys). */
export function buildCollectionListPanelFieldDefs(settingsBase: string): EditorFieldDef[] {
  return [
    fieldDef(settingsBase, 'collectionsPicker', {
      type: 'text',
      label: 'Collections',
      group: 'Collections',
      widget: 'collections',
    }),
    fieldDef(settingsBase, 'cardsLayoutType', {
      type: 'select',
      label: 'Type',
      group: 'Cards layout',
      widget: 'select-inline',
      options: [...CARDS_LAYOUT_OPTIONS],
    }),
    fieldDef(settingsBase, 'carouselOnMobile', {
      type: 'boolean',
      label: 'Carousel on mobile',
      group: 'Cards layout',
      widget: 'toggle',
    }),
    fieldDef(settingsBase, 'cardsGap', {
      type: 'number',
      label: 'Gap',
      group: 'Cards layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
    }),
    fieldDef(settingsBase, 'columns', {
      type: 'number',
      label: 'Columns',
      group: 'Cards layout',
      widget: 'slider',
      min: 1,
      max: 6,
      step: 1,
    }),
    fieldDef(settingsBase, 'mobileColumns', {
      type: 'select',
      label: 'Mobile columns',
      group: 'Cards layout',
      widget: 'segmented',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
      ],
    }),
    fieldDef(settingsBase, 'horizontalGap', {
      type: 'number',
      label: 'Horizontal gap',
      group: 'Cards layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
    }),
    fieldDef(settingsBase, 'verticalGap', {
      type: 'number',
      label: 'Vertical gap',
      group: 'Cards layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
    }),
    fieldDef(settingsBase, 'collectionCount', {
      type: 'number',
      label: 'Collection count',
      group: 'Cards layout',
      widget: 'slider',
      min: 1,
      max: 8,
      step: 1,
    }),
    fieldDef(settingsBase, 'navigationIcon', {
      type: 'select',
      label: 'Icon',
      group: 'Carousel navigation',
      widget: 'select-inline',
      options: [
        { value: 'arrows', label: 'Arrows' },
        { value: 'chevron', label: 'Chevron' },
        { value: 'none', label: 'None' },
      ],
    }),
    fieldDef(settingsBase, 'navigationIconBackground', {
      type: 'select',
      label: 'Icon background',
      group: 'Carousel navigation',
      widget: 'segmented',
      options: [
        { value: 'none', label: 'None' },
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square' },
      ],
    }),
    fieldDef(settingsBase, 'sectionWidth', {
      type: 'select',
      label: 'Width',
      group: 'Section layout',
      widget: 'segmented',
      options: [...WIDTH_OPTIONS],
    }),
    fieldDef(settingsBase, 'layoutGap', {
      type: 'number',
      label: 'Gap',
      group: 'Section layout',
      widget: 'slider',
      min: 0,
      max: 64,
      step: 1,
      unit: 'px',
    }),
    fieldDef(settingsBase, 'colorScheme', {
      type: 'select',
      label: 'Color scheme',
      group: 'Section layout',
      widget: 'color-scheme',
      options: [...SCHEME_OPTIONS],
    }),
    fieldDef(settingsBase, 'paddingTop', {
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
    }),
    fieldDef(settingsBase, 'paddingBottom', {
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
    }),
    fieldDef(settingsBase, 'customCss', {
      type: 'textarea',
      label: 'Custom CSS',
      group: 'Custom CSS',
      widget: 'accordion',
    }),
  ];
}

export function settingsBaseFromCollectionListFields(fields: EditorFieldDef[]): string | null {
  const match = fields.find((f) => f.path.endsWith('.cardsLayoutType'))?.path;
  if (match) return match.replace(/\.cardsLayoutType$/, '');
  const picker = fields.find((f) => f.path.endsWith('.collectionsPicker'))?.path;
  if (picker) return picker.replace(/\.collectionsPicker$/, '');
  return null;
}

export function augmentCollectionListPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const base = settingsBaseFromCollectionListFields(fields);
  if (!base) return fields;
  const built = buildCollectionListPanelFieldDefs(base);
  const byKey = new Map<string, EditorFieldDef>();
  for (const field of [...fields, ...built]) {
    const key = field.path.split('.').pop() ?? field.path;
    if (!byKey.has(key)) byKey.set(key, field);
    else if (field.path.startsWith(base)) byKey.set(key, field);
  }
  return built.map((f) => byKey.get(f.path.split('.').pop() ?? '') ?? f);
}

const LAYOUT_VISIBLE_KEYS: Record<CollectionListCardsLayoutType, Set<string>> = {
  bento: new Set(['collectionsPicker', 'cardsLayoutType', 'carouselOnMobile', 'cardsGap']),
  grid: new Set([
    'collectionsPicker',
    'cardsLayoutType',
    'carouselOnMobile',
    'columns',
    'mobileColumns',
    'horizontalGap',
    'verticalGap',
  ]),
  carousel: new Set([
    'collectionsPicker',
    'cardsLayoutType',
    'columns',
    'mobileColumns',
    'horizontalGap',
    'navigationIcon',
    'navigationIconBackground',
  ]),
  editorial: new Set(['collectionsPicker', 'cardsLayoutType', 'carouselOnMobile', 'collectionCount']),
};

const SHARED_KEYS = new Set([
  'sectionWidth',
  'layoutGap',
  'colorScheme',
  'paddingTop',
  'paddingBottom',
  'customCss',
]);

export function parseCollectionListCardsLayoutType(raw: string): CollectionListCardsLayoutType {
  if (raw === 'grid' || raw === 'carousel' || raw === 'editorial') return raw;
  return 'bento';
}

export function filterCollectionListPanelFieldsForLayout(
  fields: EditorFieldDef[],
  layoutType: CollectionListCardsLayoutType
): EditorFieldDef[] {
  const visible = LAYOUT_VISIBLE_KEYS[layoutType];
  return fields.filter((field) => {
    const key = field.path.split('.').pop() ?? '';
    if (SHARED_KEYS.has(key)) return true;
    if (field.group === 'Carousel navigation') return layoutType === 'carousel';
    return visible.has(key);
  });
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isCollectionListPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortCollectionListPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Collections: 0,
    'Cards layout': 1,
    'Carousel navigation': 2,
    'Section layout': 3,
    Padding: 4,
    'Custom CSS': 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupCollectionListPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Collections';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isCollectionListUnifiedSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('cardsLayoutType') && keys.has('collectionsPicker');
}

export function collectionListCardsLayoutTypeFromValues(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): CollectionListCardsLayoutType {
  const layoutField = fields.find((f) => f.path.endsWith('.cardsLayoutType'));
  if (!layoutField) return 'bento';
  return parseCollectionListCardsLayoutType(fieldValueAsString(values, layoutField));
}

export function prepareCollectionListSettingsNode(node: SidebarNode): SidebarNode {
  const augmented = augmentCollectionListPanelFields(node.fields ?? []);
  const fields = sortCollectionListPanelFields(
    filterSidebarSectionPanelFields(augmented, isCollectionListPanelField)
  );
  const label = node.label?.startsWith('Collection list:') ? node.label : 'Collection list: Bento';
  return { ...node, label, kind: 'section', fields };
}
