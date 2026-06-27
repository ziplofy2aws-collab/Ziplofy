import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';

const PANEL_GROUPS = new Set([
  'Collection',
  'Section layout',
  'Padding',
  'Carousel navigation',
  'Theme settings',
  'Custom CSS',
]);

const FIELD_SORT: Record<string, number> = {
  collectionHandle: 0,
  layoutType: 1,
  carouselOnMobile: 2,
  productsToShow: 3,
  columns: 4,
  mobileColumns: 5,
  horizontalGap: 6,
  verticalGap: 7,
  navIcon: 8,
  navIconBackground: 9,
  sectionWidth: 10,
  alignment: 11,
  sectionGap: 12,
  colorScheme: 13,
  paddingTop: 20,
  paddingBottom: 21,
  customCss: 30,
  subtitle: 40,
  showRating: 41,
  emptyMessage: 42,
};

export function isFeaturedCollectionSectionNodeId(nodeId: string): boolean {
  return /^template:[^:]+:featured_collection(?:_\d+)?$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isFeaturedCollectionPanelField(field: EditorFieldDef): boolean {
  if (!/\.sections\.featured_collection(?:_\d+)?\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedCollectionGroupedPanelSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'featured-collection' && isFeaturedCollectionCatalogVariant(catalogVariant);
}

export function isFeaturedCollectionCatalogVariant(catalogVariant: string): boolean {
  return (
    catalogVariant === 'featured-collection-carousel' ||
    catalogVariant === 'featured-collection-editorial' ||
    catalogVariant === 'featured-collection-grid' ||
    catalogVariant === 'featured-collection'
  );
}

export function featuredCollectionSettingsBaseFromNodeId(nodeId: string): string | null {
  const sectionMatch = nodeId.match(/^template:([^:]+):(featured_collection(?:_\d+)?)$/);
  if (sectionMatch) {
    return `templates.${sectionMatch[1]}.sections.${sectionMatch[2]}.settings`;
  }
  const childMatch = nodeId.match(/^template:([^:]+):(featured_collection(?:_\d+)?):/);
  if (childMatch) {
    return `templates.${childMatch[1]}.sections.${childMatch[2]}.settings`;
  }
  return null;
}

function readSettingString(
  config: Record<string, unknown> | null,
  settingsBase: string,
  key: string
): string {
  if (!config) return '';
  const parts = `${settingsBase}.${key}`.split('.');
  let cur: unknown = config;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : '';
}

function readFlatValueString(
  values: Record<string, unknown> | undefined,
  path: string
): string {
  if (!values) return '';
  const value = values[path];
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
}

/** Read `settings.layoutType` for a featured collection section from the merged config. */
export function readFeaturedCollectionLayoutType(
  config: Record<string, unknown> | null,
  settingsBase: string
): string {
  return readSettingString(config, settingsBase, 'layoutType');
}

/** Read `settings.catalogVariant` for a featured collection section from the merged config. */
export function readFeaturedCollectionCatalogVariant(
  config: Record<string, unknown> | null,
  settingsBase: string
): string {
  return readSettingString(config, settingsBase, 'catalogVariant');
}

export function groupFeaturedCollectionPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Collection';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export const FEATURED_COLLECTION_PANEL_GROUP_ORDER = [
  'Collection',
  'Carousel navigation',
  'Section layout',
  'Padding',
  'Theme settings',
  'Custom CSS',
] as const;

const EDITORIAL_COLLECTION_FIELD_KEYS = new Set([
  'collectionHandle',
  'layoutType',
  'carouselOnMobile',
  'productsToShow',
]);

export function isFeaturedCollectionGridSettingsPanelFields(
  fields: EditorFieldDef[]
): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    keys.has('collectionHandle') &&
    keys.has('columns') &&
    keys.has('horizontalGap') &&
    keys.has('verticalGap') &&
    keys.has('mobileColumns') &&
    !keys.has('navIcon')
  );
}

export function isFeaturedCollectionEditorialSettingsPanelFields(
  fields: EditorFieldDef[]
): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('navIcon') || isFeaturedCollectionGridSettingsPanelFields(fields)) return false;
  return (
    keys.has('collectionHandle') &&
    keys.has('carouselOnMobile') &&
    keys.has('productsToShow')
  );
}

export function isFeaturedCollectionCarouselSettingsPanelFields(
  fields: EditorFieldDef[]
): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('collectionHandle') && keys.has('productsToShow') && keys.has('navIcon');
}

export type FeaturedCollectionVariant = 'carousel' | 'editorial' | 'grid' | 'default';

export function featuredCollectionVariantLabel(
  variant: FeaturedCollectionVariant
): string {
  if (variant === 'carousel') return 'Featured collection: Carousel';
  if (variant === 'editorial') return 'Featured collection: Editorial';
  if (variant === 'grid') return 'Featured collection: Grid';
  return 'Featured collection';
}

export function resolveFeaturedCollectionVariant(opts: {
  label?: string;
  layoutType?: string;
  catalogVariant?: string;
  fields?: EditorFieldDef[];
}): FeaturedCollectionVariant {
  const label = opts.label ?? '';
  if (label.includes('Carousel')) return 'carousel';
  if (label.includes('Editorial')) return 'editorial';
  if (label.includes('Grid')) return 'grid';

  const layoutType = opts.layoutType ?? '';
  // Non-grid layout types reflect an explicit user layout change.
  if (layoutType === 'carousel' || layoutType === 'editorial') return layoutType;

  const catalogVariant = opts.catalogVariant ?? '';
  if (catalogVariant === 'featured-collection-carousel') return 'carousel';
  if (catalogVariant === 'featured-collection-editorial') return 'editorial';
  if (catalogVariant === 'featured-collection-grid') return 'grid';

  if (layoutType === 'grid') return 'grid';

  const raw = opts.fields ?? [];
  if (isFeaturedCollectionCarouselSettingsPanelFields(raw)) return 'carousel';
  if (isFeaturedCollectionEditorialSettingsPanelFields(raw)) return 'editorial';
  if (isFeaturedCollectionGridSettingsPanelFields(raw)) return 'grid';
  return 'default';
}

export function resolveFeaturedCollectionLabel(opts: {
  label?: string;
  layoutType?: string;
  catalogVariant?: string;
  fields?: EditorFieldDef[];
}): string {
  return featuredCollectionVariantLabel(resolveFeaturedCollectionVariant(opts));
}

export function featuredCollectionSidebarLabel(
  catalogVariant: string,
  fallback: string,
  layoutType?: string
): string {
  const variant = resolveFeaturedCollectionVariant({ catalogVariant, layoutType });
  if (variant !== 'default') return featuredCollectionVariantLabel(variant);
  return fallback;
}

export function filterFeaturedCollectionPanelFieldsForVariant(
  fields: EditorFieldDef[],
  variant: 'carousel' | 'editorial' | 'grid' | 'default'
): EditorFieldDef[] {
  if (variant === 'carousel') return fields;
  if (variant === 'editorial') {
    return fields
      .filter((f) => !f.path.endsWith('.navIcon') && !f.path.endsWith('.navIconBackground'))
      .filter((f) => {
        if (f.group !== 'Collection') return true;
        const key = f.path.split('.').pop() ?? '';
        return EDITORIAL_COLLECTION_FIELD_KEYS.has(key);
      });
  }
  return fields.filter(
    (f) => !f.path.endsWith('.navIcon') && !f.path.endsWith('.navIconBackground')
  );
}

export function sortFeaturedCollectionPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Collection: 0,
    'Carousel navigation': 1,
    'Section layout': 2,
    Padding: 3,
    'Theme settings': 4,
    'Custom CSS': 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function readFeaturedCollectionSettingValue(
  values: Record<string, unknown> | undefined,
  config: Record<string, unknown> | null | undefined,
  settingsBase: string,
  key: 'layoutType' | 'catalogVariant'
): string {
  const flat = readFlatValueString(values, `${settingsBase}.${key}`);
  if (flat) return flat;
  return readSettingString(config ?? null, settingsBase, key);
}

export function prepareFeaturedCollectionSettingsNode(
  node: SidebarNode,
  values?: Record<string, unknown>,
  config?: Record<string, unknown> | null
): SidebarNode {
  const raw = sortFeaturedCollectionPanelFields(
    (node.fields ?? []).filter(isFeaturedCollectionPanelField)
  );
  const settingsBase = featuredCollectionSettingsBaseFromNodeId(node.id);
  const layoutType = settingsBase
    ? readFeaturedCollectionSettingValue(values, config, settingsBase, 'layoutType')
    : '';
  const catalogVariant = settingsBase
    ? readFeaturedCollectionSettingValue(values, config, settingsBase, 'catalogVariant')
    : '';
  const variant = resolveFeaturedCollectionVariant({
    label: node.label,
    layoutType,
    catalogVariant,
    fields: raw,
  });
  const fields = filterFeaturedCollectionPanelFieldsForVariant(raw, variant);
  const label = featuredCollectionVariantLabel(variant);
  return { ...node, label, kind: 'section', fields };
}

function findSidebarNodeById(nodes: SidebarNode[], id: string): SidebarNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const hit = findSidebarNodeById(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

/** Resolve featured collection section when a block/child row is selected. */
export function findFeaturedCollectionSectionInTree(
  nodeId: string,
  tree: SidebarNode[]
): SidebarNode | null {
  if (isFeaturedCollectionSectionNodeId(nodeId)) {
    return findSidebarNodeById(tree, nodeId);
  }
  const m = nodeId.match(/^template:([^:]+):(featured_collection(?:_\d+)?)/);
  if (!m) return null;
  return findSidebarNodeById(tree, `template:${m[1]}:${m[2]}`);
}
