import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';

/** Standard remote-theme section category ids (see Remote themes criteria.md). */
export const REMOTE_THEME_SECTION_CATEGORIES = [
  'banners',
  'collections',
  'products',
  'forms',
  'layout',
  'storytelling',
  'text',
] as const;

export type RemoteThemeSectionCategory = (typeof REMOTE_THEME_SECTION_CATEGORIES)[number];

const PRODUCTS_SECTION_ID_RE =
  /watch_bestsellers|watch_signature|watch_collection|watch_launches|featured_collection|product_highlight|product_hotspots|recommended_products|featured-collection|product-highlight|product-hotspots|recommended-products/i;

const COLLECTIONS_SECTION_ID_RE =
  /watch_category|collection_links|collection_list|collectionsPicker/i;

/** True when a schema/section is in the Products catalog category. */
export function isProductsCategorySection(
  sectionIdOrType: string | undefined | null,
  category?: string | null
): boolean {
  if ((category || '').trim().toLowerCase() === 'products') return true;
  return PRODUCTS_SECTION_ID_RE.test(String(sectionIdOrType || ''));
}

export function isCollectionsCategorySection(
  sectionIdOrType: string | undefined | null,
  category?: string | null
): boolean {
  if ((category || '').trim().toLowerCase() === 'collections') return true;
  return COLLECTIONS_SECTION_ID_RE.test(String(sectionIdOrType || ''));
}

export function sidebarNodeSectionKey(node: SidebarNode): string {
  // e.g. template:index:watch_bestsellers or layout:header
  const parts = String(node.id || '').split(':');
  return parts[parts.length - 1] || node.id || '';
}

/** Collect fields from a node and its block children (one level). */
export function collectSidebarProductFields(node: SidebarNode): EditorFieldDef[] {
  const out: EditorFieldDef[] = [];
  const visit = (fields?: EditorFieldDef[]) => {
    for (const field of fields || []) {
      if (field.widget === 'product' || /ProductId$/i.test(field.path) || field.path.endsWith('.productId')) {
        out.push(field);
      }
    }
  };
  visit(node.fields);
  for (const child of node.children || []) {
    if (child.kind === 'block' || child.kind === 'section') visit(child.fields);
  }
  return out;
}

export function sectionHasProductPicker(node: SidebarNode): boolean {
  return collectSidebarProductFields(node).length > 0;
}

/** Group order for catalog products sections — Product / Collection first. */
export const CATALOG_PRODUCTS_GROUP_ORDER = [
  'Product',
  'Collection',
  'Products',
  'Media',
  'Text',
  'Content',
  'Appearance',
  'Carousel',
] as const;
