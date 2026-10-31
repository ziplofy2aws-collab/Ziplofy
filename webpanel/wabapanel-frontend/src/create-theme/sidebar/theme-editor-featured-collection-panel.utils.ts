import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';
import { resolveEditingPanelForNode } from '../../theme-editor/section-editing-support.util';

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
  backgroundColor: 13,
  colorScheme: 14,
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

function s(settingsBase: string, key: string): string {
  return `${settingsBase}.${key}`;
}

/** Canonical Shopify-order field defs for featured collection section settings. */
export function featuredCollectionFieldDefs(settingsBase: string): EditorFieldDef[] {
  return [
    {
      path: s(settingsBase, 'collectionHandle'),
      type: 'text',
      label: 'Collection',
      group: 'Collection',
      widget: 'collection',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'layoutType'),
      type: 'select',
      label: 'Type',
      group: 'Collection',
      sidebar: true,
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'carousel', label: 'Carousel' },
        { value: 'editorial', label: 'Editorial' },
      ],
    },
    {
      path: s(settingsBase, 'carouselOnMobile'),
      type: 'boolean',
      label: 'Carousel on mobile',
      group: 'Collection',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'productsToShow'),
      type: 'number',
      label: 'Product count',
      group: 'Collection',
      widget: 'slider',
      min: 1,
      max: 24,
      step: 1,
      sidebar: true,
    },
    {
      path: s(settingsBase, 'columns'),
      type: 'number',
      label: 'Columns',
      group: 'Collection',
      widget: 'slider',
      min: 1,
      max: 6,
      step: 1,
      sidebar: true,
    },
    {
      path: s(settingsBase, 'mobileColumns'),
      type: 'select',
      label: 'Mobile columns',
      group: 'Collection',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
      ],
    },
    {
      path: s(settingsBase, 'horizontalGap'),
      type: 'number',
      label: 'Horizontal gap',
      group: 'Collection',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'verticalGap'),
      type: 'number',
      label: 'Vertical gap',
      group: 'Collection',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'navIcon'),
      type: 'select',
      label: 'Icon',
      group: 'Carousel navigation',
      sidebar: true,
      options: [
        { value: 'arrows', label: 'Arrows' },
        { value: 'chevron', label: 'Chevron' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: s(settingsBase, 'navIconBackground'),
      type: 'select',
      label: 'Icon background',
      group: 'Carousel navigation',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square' },
      ],
    },
    {
      path: s(settingsBase, 'sectionWidth'),
      type: 'select',
      label: 'Width',
      group: 'Section layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: s(settingsBase, 'alignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Section layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s(settingsBase, 'sectionGap'),
      type: 'number',
      label: 'Gap',
      group: 'Section layout',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'backgroundColor'),
      type: 'text',
      label: 'Background color',
      group: 'Section layout',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'paddingTop'),
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
      path: s(settingsBase, 'paddingBottom'),
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
  ];
}

/** Theme settings + Custom CSS — carousel / editorial only (not grid). */
export function featuredCollectionThemeCssFieldDefs(settingsBase: string): EditorFieldDef[] {
  return [
    {
      path: s(settingsBase, 'colorScheme'),
      type: 'select',
      label: 'Color scheme',
      group: 'Theme settings',
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
      path: s(settingsBase, 'customCss'),
      type: 'textarea',
      label: 'Custom CSS',
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: true,
    },
  ];
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

export const FEATURED_COLLECTION_GRID_PANEL_GROUP_ORDER = [
  'Collection',
  'Carousel navigation',
  'Section layout',
  'Padding',
] as const;

const EDITORIAL_COLLECTION_FIELD_KEYS = new Set([
  'collectionHandle',
  'layoutType',
  'carouselOnMobile',
  'productsToShow',
]);

const CAROUSEL_HIDDEN_COLLECTION_FIELD_KEYS = new Set([
  'verticalGap',
  'carouselOnMobile',
  'subtitle',
  'showRating',
  'emptyMessage',
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
  // Prefer live settings over sidebar label — a stale "Carousel" label previously
  // overrode catalogVariant/layoutType=grid and kept Theme settings visible.
  const layoutType = opts.layoutType ?? '';
  if (layoutType === 'carousel' || layoutType === 'editorial' || layoutType === 'grid') {
    return layoutType;
  }

  const catalogVariant = opts.catalogVariant ?? '';
  if (catalogVariant === 'featured-collection-carousel') return 'carousel';
  if (catalogVariant === 'featured-collection-editorial') return 'editorial';
  if (
    catalogVariant === 'featured-collection-grid' ||
    catalogVariant === 'featured-collection'
  ) {
    return 'grid';
  }

  const label = opts.label ?? '';
  if (label.includes('Carousel')) return 'carousel';
  if (label.includes('Editorial')) return 'editorial';
  if (label.includes('Grid')) return 'grid';

  // Shared field defs include navIcon for every variant, so field heuristics are unreliable.
  const raw = opts.fields ?? [];
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
  if (variant === 'carousel') {
    return fields.filter((f) => {
      if (f.group !== 'Collection') return true;
      const key = f.path.split('.').pop() ?? '';
      return !CAROUSEL_HIDDEN_COLLECTION_FIELD_KEYS.has(key);
    });
  }
  if (variant === 'editorial') {
    return fields
      .filter((f) => !f.path.endsWith('.navIcon') && !f.path.endsWith('.navIconBackground'))
      .filter((f) => {
        if (f.group !== 'Collection') return true;
        const key = f.path.split('.').pop() ?? '';
        return EDITORIAL_COLLECTION_FIELD_KEYS.has(key);
      });
  }
  // Grid (and unknown/default treated as grid UI): never expose Theme settings / Custom CSS.
  return fields.filter((f) => {
    if (f.path.endsWith('.navIcon') || f.path.endsWith('.navIconBackground')) return false;
    const key = f.path.split('.').pop() ?? '';
    if (key === 'customCss' || key === 'colorScheme') return false;
    const group = (f.group ?? '').toLowerCase();
    if (group === 'theme settings' || group === 'custom css') return false;
    return true;
  });
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
  const settingsBase = featuredCollectionSettingsBaseFromNodeId(node.id);
  const catalog = resolveEditingPanelForNode(node.id);
  const canonical = settingsBase ? featuredCollectionFieldDefs(settingsBase) : [];
  const source = canonical.length
    ? canonical
    : catalog?.fields.length
      ? catalog.fields
      : (node.fields ?? []);
  const raw = sortFeaturedCollectionPanelFields(
    filterSidebarSectionPanelFields(source, isFeaturedCollectionPanelField)
  );
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
  const withTheme =
    settingsBase && (variant === 'carousel' || variant === 'editorial')
      ? [...raw, ...featuredCollectionThemeCssFieldDefs(settingsBase)]
      : raw;
  const fields = filterFeaturedCollectionPanelFieldsForVariant(withTheme, variant);
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

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function featuredCollectionDefaultsForVariant(
  variant: FeaturedCollectionVariant
): Record<string, string | number | boolean> {
  const shared = {
    collectionHandle: 'products',
    sectionWidth: 'page',
    alignment: 'left',
    sectionGap: 28,
    backgroundColor: 'default',
    colorScheme: 'scheme-1',
    paddingTop: 48,
    paddingBottom: 48,
    customCss: '',
  };
  if (variant === 'carousel') {
    return {
      ...shared,
      layoutType: 'carousel',
      catalogVariant: 'featured-collection-carousel',
      productsToShow: 6,
      columns: 4,
      mobileColumns: '1',
      horizontalGap: 8,
      navIcon: 'arrows',
      navIconBackground: 'circle',
    };
  }
  if (variant === 'editorial') {
    return {
      ...shared,
      layoutType: 'editorial',
      catalogVariant: 'featured-collection-editorial',
      carouselOnMobile: false,
      productsToShow: 4,
      columns: 2,
      mobileColumns: '1',
      horizontalGap: 24,
      verticalGap: 24,
      sectionGap: 64,
    };
  }
  if (variant === 'grid') {
    return {
      ...shared,
      layoutType: 'grid',
      catalogVariant: 'featured-collection-grid',
      carouselOnMobile: false,
      productsToShow: 8,
      columns: 4,
      mobileColumns: '2',
      horizontalGap: 8,
      verticalGap: 24,
    };
  }
  return {
    ...shared,
    layoutType: 'grid',
    catalogVariant: 'featured-collection',
    carouselOnMobile: false,
    productsToShow: 4,
    columns: 4,
    mobileColumns: '2',
    horizontalGap: 16,
    verticalGap: 24,
    navIcon: 'arrows',
    navIconBackground: 'circle',
  };
}

export function extendFeaturedCollectionSectionValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null,
  variant: FeaturedCollectionVariant
): Record<string, string | boolean> {
  const defaults = featuredCollectionDefaultsForVariant(variant);
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = defaults[key];
    if (fallback !== undefined) {
      next[field.path] = field.type === 'boolean' ? Boolean(fallback) : String(fallback);
    }
  }
  return next;
}
