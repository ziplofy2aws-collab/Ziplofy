import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';
import { isStorytellingCarouselSectionInstanceId } from './theme-editor-storytelling-carousel-block-panel.utils';

export const STORYTELLING_CAROUSEL_PANEL_GROUP_ORDER = [
  'Layout',
  'Navigation',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_CAROUSEL_PANEL_GROUP_ORDER);

const SECTION_PANEL_KEYS = new Set([
  'columns',
  'mobileColumns',
  'sectionWidth',
  'horizontalGap',
  'colorScheme',
  'navIcon',
  'navIconBackground',
  'paddingTop',
  'paddingBottom',
  'customCss',
]);

const FIELD_SORT: Record<string, number> = {
  columns: 0,
  mobileColumns: 1,
  sectionWidth: 2,
  horizontalGap: 3,
  colorScheme: 4,
  navIcon: 0,
  navIconBackground: 1,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isStorytellingCarouselSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'storytelling-carousel' || catalogVariant === 'storytelling-carousel';
}

export function storytellingCarouselSectionSettingsBaseFromNodeId(
  nodeId: string
): string | null {
  const layout = nodeId.match(/^layout:(.+)$/);
  if (layout) {
    const secId = layout[1]!;
    if (!isStorytellingCarouselSectionInstanceId(secId)) return null;
    return `sections.${secId}.settings`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isStorytellingCarouselSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}.settings`;
  }
  return null;
}

export function storytellingCarouselSectionFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('columns'),
      type: 'number',
      label: 'Columns',
      group: 'Layout',
      widget: 'slider',
      min: 1,
      max: 4,
      step: 1,
      sidebar: true,
    },
    {
      path: s('mobileColumns'),
      type: 'select',
      label: 'Mobile columns',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
      ],
    },
    {
      path: s('sectionWidth'),
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: s('horizontalGap'),
      type: 'number',
      label: 'Horizontal gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('colorScheme'),
      type: 'select',
      label: 'Background color',
      group: 'Layout',
      widget: 'color-scheme',
      sidebar: true,
      options: [
        { value: 'scheme-1', label: 'Scheme 1' },
        { value: 'scheme-2', label: 'Scheme 2' },
        { value: 'scheme-3', label: 'Scheme 3' },
        { value: 'scheme-4', label: 'Scheme 4' },
      ],
    },
    {
      path: s('navIcon'),
      type: 'select',
      label: 'Icon',
      group: 'Navigation',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'arrows', label: 'Arrows' },
        { value: 'chevron', label: 'Chevron' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: s('navIconBackground'),
      type: 'select',
      label: 'Icon background',
      group: 'Navigation',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square' },
      ],
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('customCss'),
      type: 'textarea',
      label: 'Custom CSS',
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: true,
    },
  ];
}

export function storytellingCarouselSectionFieldDefsFromNodeId(
  nodeId: string
): EditorFieldDef[] {
  const settingsBase = storytellingCarouselSectionSettingsBaseFromNodeId(nodeId);
  return settingsBase ? storytellingCarouselSectionFieldDefs(settingsBase) : [];
}

export function pickStorytellingCarouselSectionField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

export function isStorytellingCarouselPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (field.sidebar === false) return false;
  const key = field.path.split('.').pop() ?? '';
  if (!SECTION_PANEL_KEYS.has(key)) return false;
  if (!/storytelling_carousel/.test(field.path)) return false;
  if (/\.blocks\./.test(field.path)) return false;
  if (/\.settings\.(headerGroup|contentGroup)\./.test(field.path)) return false;
  return /\.settings\./.test(field.path);
}

export function sortStorytellingCarouselPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Navigation: 1,
    Padding: 2,
    'Custom CSS': 3,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupStorytellingCarouselPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isStorytellingCarouselPanelField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
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

export function isStorytellingCarouselSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('columns') &&
    keys.has('mobileColumns') &&
    keys.has('navIcon') &&
    /storytelling_carousel/.test(path) &&
    !keys.has('postCount') &&
    !keys.has('blogHandle') &&
    !keys.has('verticalGap') &&
    !keys.has('cardHeight') &&
    !keys.has('direction')
  );
}

export function prepareStorytellingCarouselSettingsNode(node: SidebarNode): SidebarNode {
  const built = storytellingCarouselSectionFieldDefsFromNodeId(node.id);
  const fromNode = filterSidebarSectionPanelFields(
    node.fields ?? [],
    isStorytellingCarouselPanelField
  );
  const fields = sortStorytellingCarouselPanelFields(built.length ? built : fromNode);
  return { ...node, label: 'Carousel', kind: 'section', fields };
}
