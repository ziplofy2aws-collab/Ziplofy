import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const COLLECTION_LINKS_SPOTLIGHT_PANEL_GROUP_ORDER = [
  'Collections',
  'Layout',
  'Appearance',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_LINKS_SPOTLIGHT_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  collectionsPicker: 0,
  layoutMode: 0,
  sectionWidth: 1,
  alignment: 2,
  imagePosition: 3,
  backgroundColor: 0,
  textColor: 1,
  paddingTop: 0,
  paddingBottom: 1,
};

const HIDDEN_PANEL_KEYS = new Set(['customCss', 'colorScheme', 'layoutMode']);

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

function settingsBaseFromAnyFieldPath(path: string): string | null {
  const m = path.match(
    /^(?:templates\.[^.]+\.sections\.[^.]+|sections\.[^.]+)\.settings\./
  );
  if (!m) return null;
  return path.slice(0, path.lastIndexOf('.'));
}

export function isCollectionLinksSpotlightSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return (
    secType === 'collection-links-spotlight' ||
    catalogVariant === 'collection-links-spotlight' ||
    catalogVariant === 'collection-links-text'
  );
}

export function isCollectionLinksSpotlightPanelSectionSettingsPath(path: string): boolean {
  return (
    /^sections\.[^.]+\.settings\./.test(path) ||
    /^templates\.[^.]+\.sections\.[^.]+\.settings\./.test(path)
  );
}

export function isCollectionLinksSpotlightPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  const key = field.path.split('.').pop() ?? '';
  if (HIDDEN_PANEL_KEYS.has(key)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return isCollectionLinksSpotlightPanelSectionSettingsPath(field.path);
}

export function collectionLinksSpotlightAppearanceFieldDefs(settingsBase: string): EditorFieldDef[] {
  return [
    {
      path: `${settingsBase}.backgroundColor`,
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
    },
    {
      path: `${settingsBase}.textColor`,
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
    },
  ];
}

export function sortCollectionLinksSpotlightPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Collections: 0,
    Layout: 1,
    Appearance: 2,
    Padding: 3,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupCollectionLinksSpotlightPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of sortCollectionLinksSpotlightPanelFields(fields)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isCollectionLinksSpotlightSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('collectionsPicker') && keys.has('alignment');
}

export function isCollectionLinksTextSectionFromFields(fields: EditorFieldDef[]): boolean {
  return fields.some(
    (f) =>
      f.path.includes('.collection_links_text.') ||
      /\.sections\.collection_links_text(?:_\d+)?\.settings\./.test(f.path)
  );
}

function normalizeCollectionLinksSpotlightPanelField(field: EditorFieldDef): EditorFieldDef {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'backgroundColor' || key === 'textColor') {
    return {
      ...field,
      type: 'color',
      widget: 'color',
      group: 'Appearance',
      label: key === 'backgroundColor' ? 'Background color' : 'Text color',
    };
  }
  return field;
}

export function prepareCollectionLinksSpotlightSettingsNode(node: SidebarNode): SidebarNode {
  let fields = sortCollectionLinksSpotlightPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isCollectionLinksSpotlightPanelField)
  ).map(normalizeCollectionLinksSpotlightPanelField);

  const hasBackground = fields.some((f) => f.path.endsWith('.backgroundColor'));
  const hasText = fields.some((f) => f.path.endsWith('.textColor'));
  if (!hasBackground || !hasText) {
    const samplePath = fields[0]?.path ?? (node.fields?.[0] as EditorFieldDef | undefined)?.path ?? '';
    const settingsBase =
      settingsBaseFromAnyFieldPath(samplePath) ||
      (samplePath.includes('.settings.')
        ? samplePath.replace(/\.[^.]+$/, '')
        : null);
    if (settingsBase) {
      const appearance = collectionLinksSpotlightAppearanceFieldDefs(settingsBase);
      const existing = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
      fields = sortCollectionLinksSpotlightPanelFields([
        ...fields,
        ...appearance.filter((f) => !existing.has(f.path.split('.').pop() ?? '')),
      ]);
    }
  }

  const isTextSection =
    node.label === 'Collection links: Text' ||
    node.id.includes('collection_links_text');
  const label = isTextSection ? 'Collection links: Text' : 'Collection links: Spotlight';
  return { ...node, label, kind: 'section', fields };
}
