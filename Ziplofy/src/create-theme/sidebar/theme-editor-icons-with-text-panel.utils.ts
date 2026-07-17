import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const ICON_WITH_TEXT_ICON_OPTIONS = [
  { value: 'eye', label: 'Eye' },
  { value: 'heart', label: 'Heart' },
  { value: 'person', label: 'Person' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'truck', label: 'Truck' },
  { value: 'shield', label: 'Shield' },
  { value: 'star', label: 'Star' },
  { value: 'gift', label: 'Gift' },
] as const;

export const ICONS_WITH_TEXT_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(ICONS_WITH_TEXT_PANEL_GROUP_ORDER);

const BORDER_KEYS = new Set([
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'borderColor',
  'cornerRadius',
]);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  verticalOnMobile: 1,
  layoutAlignment: 2,
  position: 3,
  layoutGap: 4,
  sectionWidth: 10,
  height: 11,
  colorScheme: 20,
  backgroundMedia: 21,
  backgroundImageUrl: 22,
  backgroundColor: 23,
  backgroundOverlay: 24,
  borderStyle: 30,
  borderThickness: 31,
  borderOpacity: 32,
  borderColor: 33,
  cornerRadius: 34,
  paddingTop: 40,
  paddingBottom: 41,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

function iconsWithTextPanelGroupForKey(key: string, fallback?: string): string {
  if (BORDER_KEYS.has(key)) return 'Borders';
  if (fallback && PANEL_GROUPS.has(fallback)) return fallback;
  return 'Layout';
}

export function isIconsWithTextSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'icons-with-text' || catalogVariant === 'icons-with-text';
}

export function isIconsWithTextPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'customCss') return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  if (BORDER_KEYS.has(key)) return true;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isIconsWithTextBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'icon' || key === 'heading' || key === 'text';
}

export function sortIconsWithTextPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const keyA = a.path.split('.').pop() ?? '';
    const keyB = b.path.split('.').pop() ?? '';
    const ga = groupRank[iconsWithTextPanelGroupForKey(keyA, a.group)] ?? 9;
    const gb = groupRank[iconsWithTextPanelGroupForKey(keyB, b.group)] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupIconsWithTextPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const key = field.path.split('.').pop() ?? '';
    const group = iconsWithTextPanelGroupForKey(key, field.group);
    const list = map.get(group) ?? [];
    list.push(
      key === 'borderStyle'
        ? { ...field, label: 'Style', group: 'Borders' }
        : BORDER_KEYS.has(key)
          ? { ...field, group: 'Borders' }
          : field
    );
    map.set(group, list);
  }
  return map;
}

export function isIconsWithTextSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (
    keys.has('caption') ||
    keys.has('videoUrl') ||
    keys.has('heading') ||
    keys.has('openFirstItem') ||
    keys.has('logoText')
  ) {
    return false;
  }
  const path = fields[0]?.path ?? '';
  return (
    keys.has('verticalOnMobile') &&
    keys.has('direction') &&
    keys.has('layoutGap') &&
    keys.has('columns') &&
    (path.includes('icons_with_text') || path.includes('icons-with-text'))
  );
}

export function iconsWithTextBlocksBaseFromNodeId(nodeId: string): string | null {
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  const layout = nodeId.match(/^layout:([^:]+):block:/);
  if (layout) return `sections.${layout[1]}`;
  return null;
}

export function iconsWithTextBlockInstanceIdFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/:block:([^:]+)/);
  return m?.[1] ?? null;
}

export function isIconsWithTextBlockNodeId(nodeId: string): boolean {
  const tpl = nodeId.match(/^template:([^:]+):(icons_with_text[^:]*):block:/);
  if (tpl) return true;
  const layout = nodeId.match(/^layout:(icons_with_text[^:]*):block:/);
  return Boolean(layout);
}

export function iconWithTextBlockFieldDefs(
  blocksBase: string,
  blockInstanceId: string
): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.blocks.${blockInstanceId}.settings.${key}`;
  return [
    {
      path: s('icon'),
      type: 'select',
      label: 'Icon',
      group: 'Content',
      widget: 'select',
      sidebar: true,
      options: [...ICON_WITH_TEXT_ICON_OPTIONS],
    },
    {
      path: s('heading'),
      type: 'text',
      label: 'Heading',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('text'),
      type: 'textarea',
      label: 'Description',
      group: 'Content',
      sidebar: true,
    },
  ];
}

export function iconWithTextBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = iconsWithTextBlocksBaseFromNodeId(nodeId);
  const blockId = iconsWithTextBlockInstanceIdFromNodeId(nodeId);
  if (!base || !blockId) return [];
  return iconWithTextBlockFieldDefs(base, blockId);
}

export function prepareIconsWithTextSettingsNode(node: SidebarNode): SidebarNode {
  const filtered = filterSidebarSectionPanelFields(node.fields ?? [], isIconsWithTextPanelField).map(
    (field) => {
      const key = field.path.split('.').pop() ?? '';
      if (key === 'borderStyle') {
        return { ...field, label: 'Style', group: 'Borders' };
      }
      if (BORDER_KEYS.has(key)) {
        return { ...field, group: 'Borders' };
      }
      return field;
    }
  );
  const fields = sortIconsWithTextPanelFields(ensureIconsWithTextBorderFieldDefs(filtered));
  return { ...node, label: 'Icons with text', kind: 'section', fields };
}

/** Section `.settings` base from field paths (skips block settings). */
export function iconsWithTextSectionSettingsBaseFromFields(
  fields: EditorFieldDef[]
): string | null {
  for (const field of fields) {
    const path = field.path ?? '';
    if (path.includes('.blocks.')) continue;
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
export function ensureIconsWithTextBorderFieldDefs(fields: EditorFieldDef[]): EditorFieldDef[] {
  const settingsBase = iconsWithTextSectionSettingsBaseFromFields(fields);
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

  return extra.length ? [...fields, ...extra] : fields;
}

export function prepareIconsWithTextBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fromNode = iconWithTextBlockFieldDefsFromNodeId(node.id);
  const fields =
    node.fields?.length
      ? node.fields.filter(isIconsWithTextBlockField)
      : fromNode;
  return { ...node, label: node.label || 'Icon with text', kind: 'block', fields };
}
