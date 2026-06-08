import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { layoutBlueprintKey } from '../../utils/theme-editor-insert-section';

/** Groups shown in the Header bottom settings sheet (Shopify-style). */
const HEADER_PANEL_GROUPS = new Set([
  'Logo',
  'Menu',
  'Customer account',
  'Search',
  'Localization',
  'Appearance',
  'Utilities',
  'Colors',
  'Page backgrounds',
  'Theme settings',
  'Custom CSS',
]);

const LAYOUT_ONLY_BLOCK_KEYS = new Set(['position', 'row']);

/** Keys excluded from the Header element sheet (theme settings / internal only). */
const HEADER_ELEMENT_EXCLUDED_KEYS = new Set(['searchPlaceholder', 'localizationRow', 'cartLabel']);

const FIELD_SORT: Record<string, number> = {
  position: 0,
  row: 1,
  customerAccountMenu: 10,
  searchIcon: 20,
  searchPosition: 21,
  searchRow: 22,
  countryRegionEnabled: 30,
  showFlag: 31,
  languageSelectorEnabled: 32,
  localizationFont: 33,
  localizationSize: 34,
  localizationPosition: 35,
  sectionWidth: 40,
  headerHeight: 41,
  stickyMode: 42,
  borderThickness: 43,
  menuStyle: 50,
  colorScheme: 60,
  homeTransparentBackground: 70,
  productTransparentBackground: 71,
  collectionTransparentBackground: 72,
  defaultLogoUrl: 80,
  cartType: 81,
  productTitleCase: 82,
  emptyCartLink: 83,
  cartDrawerAutoOpen: 84,
  customCss: 100,
};

export function isHeaderLayoutNodeId(nodeId: string): boolean {
  const m = nodeId.match(/^layout:(header(?:_\d+)?)$/);
  return Boolean(m && layoutBlueprintKey(m[1]) === 'header');
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

/** Resolve layout header section node when a child row (block, field) is selected. */
export function findHeaderSectionInTree(nodeId: string, tree: SidebarNode[]): SidebarNode | null {
  if (isHeaderLogoBlockNodeId(nodeId) || isHeaderMenuBlockNodeId(nodeId)) {
    return null;
  }
  if (isHeaderLayoutNodeId(nodeId)) {
    return findSidebarNodeById(tree, nodeId);
  }
  const m = nodeId.match(/^layout:(header(?:_\d+)?)/);
  if (!m) return null;
  return findSidebarNodeById(tree, `layout:${m[1]}`);
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

function isHeaderPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !HEADER_PANEL_GROUPS.has(field.group)) return false;
  const key = field.path.split('.').pop() ?? '';
  if (HEADER_ELEMENT_EXCLUDED_KEYS.has(key)) return false;
  if (field.path.includes('.blocks.logo.') && !LAYOUT_ONLY_BLOCK_KEYS.has(key)) {
    if (key === 'text' || key === 'tagline') return false;
  }
  if (field.path.includes('.blocks.menu.')) {
    if (LAYOUT_ONLY_BLOCK_KEYS.has(key)) return true;
    return false;
  }
  if (field.path.includes('.blocks.menu.settings.items')) return false;
  if (field.path.includes('.blocks.menu.blocks.')) return false;
  if (key === 'text' || key === 'tagline' || key === 'label' || key === 'href') return false;
  return true;
}

/** Shopify Header element sheet section order. */
export const HEADER_ELEMENT_GROUP_ORDER = [
  'Logo',
  'Menu',
  'Customer account',
  'Search',
  'Localization',
  '__appearance__',
  'Utilities',
  'Colors',
  '__page_home__',
  '__page_product__',
  '__page_collection__',
  'Theme settings',
  'Custom CSS',
] as const;

export function headerPanelGroupKey(field: EditorFieldDef): string {
  if (field.group === 'Appearance') return '__appearance__';
  if (field.group === 'Page backgrounds') {
    const key = field.path.split('.').pop() ?? '';
    if (key === 'homeTransparentBackground') return '__page_home__';
    if (key === 'productTransparentBackground') return '__page_product__';
    return '__page_collection__';
  }
  return field.group ?? 'Settings';
}

export function groupHeaderPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const label = headerPanelGroupKey(field);
    const list = map.get(label) ?? [];
    list.push(field);
    map.set(label, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path));
  }
  return map;
}

export function sortHeaderPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Logo: 0,
    Menu: 1,
    'Customer account': 2,
    Search: 3,
    Localization: 4,
    __appearance__: 5,
    Utilities: 6,
    Colors: 7,
    __page_home__: 8,
    __page_product__: 9,
    __page_collection__: 10,
    'Theme settings': 11,
    'Custom CSS': 12,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[headerPanelGroupKey(a)] ?? 99;
    const gb = groupRank[headerPanelGroupKey(b)] ?? 99;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareHeaderSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortHeaderPanelFields((node.fields ?? []).filter(isHeaderPanelField));
  return { ...node, label: 'Header', kind: 'section', fields };
}

export function isHeaderLogoBlockNodeId(nodeId: string): boolean {
  return /^layout:header(?:_\d+)?:block:logo$/.test(nodeId);
}

export function isHeaderMenuBlockNodeId(nodeId: string): boolean {
  return /^layout:header(?:_\d+)?:block:menu$/.test(nodeId);
}

export { prepareHeaderLogoBlockSettingsNode } from './theme-editor-header-logo-block-panel.utils';

export { prepareHeaderMenuBlockSettingsNode } from './theme-editor-header-menu-block-panel.utils';

/** Section + logo/menu layout fields for the Header settings sheet. */
export function collectHeaderPanelFieldDefs(
  sec: { settingsFields?: EditorFieldDef[]; blocks?: Array<{ id?: string; settingsFields?: EditorFieldDef[] }> },
  instanceId: string,
  remap: (fields: EditorFieldDef[] | undefined, id: string) => EditorFieldDef[]
): EditorFieldDef[] {
  const out: EditorFieldDef[] = [...remap(sec.settingsFields, instanceId)];
  for (const block of sec.blocks ?? []) {
    if (block.id !== 'logo' && block.id !== 'menu') continue;
    for (const f of remap(block.settingsFields, instanceId)) {
      const key = f.path.split('.').pop() ?? '';
      if (key === 'position' || key === 'row') out.push(f);
    }
  }
  return out;
}
