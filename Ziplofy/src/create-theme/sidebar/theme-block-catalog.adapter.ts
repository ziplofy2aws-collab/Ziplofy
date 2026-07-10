import type { BlockCatalogCategory, BlockCatalogItem, CatalogSection } from './add-block-catalog';
import { BLOCK_CATALOG_CATEGORIES_COMPACT, BLOCK_CATALOG_CATEGORIES_EXTENDED } from './add-block-catalog';

export type ThemeBlockCatalogApi = {
  categories: Array<{ id: string; label: string }>;
  blocks: Array<{
    id: string;
    label: string;
    category: string;
    icon?: string;
    extendedOnly?: boolean;
  }>;
  sectionBlockAllowlist?: Record<string, string[]>;
};

function toBlockIcon(icon?: string): BlockCatalogItem['icon'] {
  const id = (icon ?? '').toLowerCase();
  if (id.includes('button') || id.includes('buy')) return 'button';
  if (id.includes('heading') || id.includes('title') || id.includes('text')) return 'text';
  if (id.includes('logo')) return 'logo';
  if (id.includes('price')) return 'price';
  if (id.includes('product')) return 'product-card';
  if (id.includes('link') || id.includes('menu')) return 'link';
  if (id.includes('spacer')) return 'spacer';
  if (id.includes('group')) return 'group';
  if (id.includes('marquee') || id.includes('announcement')) return 'marquee';
  if (id.includes('jumbo')) return 'jumbo';
  return 'placeholder';
}

export function themeCatalogToBlockItems(catalog: ThemeBlockCatalogApi | null): BlockCatalogItem[] {
  if (!catalog?.blocks?.length) return [];
  return catalog.blocks.map((b) => ({
    id: b.id,
    label: b.label,
    category: (b.category || 'basic') as BlockCatalogCategory,
    icon: toBlockIcon(b.icon ?? b.id),
    keywords: [b.id, b.label],
    extendedOnly: b.extendedOnly,
  }));
}

export function getThemeCatalogSections(
  catalog: ThemeBlockCatalogApi | null,
  showAll: boolean,
  searchQuery: string
): CatalogSection[] {
  const items = themeCatalogToBlockItems(catalog);
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? items.filter(
        (b) =>
          b.label.toLowerCase().includes(q) ||
          b.category.includes(q) ||
          b.keywords?.some((k) => k.includes(q))
      )
    : items;

  const categoryDefs = catalog?.categories?.length
    ? catalog.categories
    : [...BLOCK_CATALOG_CATEGORIES_COMPACT, ...BLOCK_CATALOG_CATEGORIES_EXTENDED];

  const compactIds = new Set(BLOCK_CATALOG_CATEGORIES_COMPACT.map((c) => c.id));
  const sections: CatalogSection[] = [];

  for (const cat of categoryDefs) {
    if (!showAll && !compactIds.has(cat.id as BlockCatalogCategory)) continue;
    const catItems = filtered.filter((b) => b.category === cat.id);
    if (catItems.length) {
      sections.push({
        type: 'category',
        id: cat.id as BlockCatalogCategory,
        label: cat.label,
      });
    }
  }

  const spacer = filtered.find((b) => b.id === 'spacer');
  if (showAll && spacer && !q) {
    sections.push({ type: 'standalone', item: spacer });
  }

  return sections;
}

/** Blocks available in the add-block picker for a given sidebar target (empty = no modal). */
export function getAddBlockCatalogItems(
  catalog: ThemeBlockCatalogApi | null,
  editorSchema: {
    templates?: Array<{ sections?: Array<{ id?: string; type?: string }> }>;
    layout?: Record<string, unknown>;
  } | null,
  addBlockNodeId: string | undefined,
  options?: { showAll?: boolean; search?: string }
): BlockCatalogItem[] {
  if (!catalog?.blocks?.length) return [];
  const showAll = options?.showAll ?? false;
  const search = options?.search ?? '';
  let items = themeCatalogToBlockItems(catalog);
  if (!showAll) items = items.filter((b) => !b.extendedOnly);
  const q = search.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (b) =>
        b.label.toLowerCase().includes(q) ||
        b.category.includes(q) ||
        b.keywords?.some((k) => k.includes(q))
    );
  }
  if (addBlockNodeId) {
    const nestedAllow = resolveNestedAddBlockAllowlist(addBlockNodeId);
    if (nestedAllow) {
      const set = new Set(nestedAllow);
      items = items.filter((b) => set.has(b.id));
    } else {
      const sectionType = resolveSectionTypeForAddBlock(editorSchema, addBlockNodeId);
      items = filterBlocksForSection(catalog, sectionType, items);
      if (sectionType === 'faq') {
        items = items.filter((b) => b.id !== 'accordion-row');
      }
    }
  }
  return items;
}

/** Hero (and custom section) use the full Shopify-style picker — not manifest allowlists. */
export function usesShopifyFullBlockPicker(sectionType: string | undefined): boolean {
  return sectionType === 'hero' || sectionType === 'custom-section';
}

export function filterBlocksForSection(
  catalog: ThemeBlockCatalogApi | null,
  sectionKey: string | undefined,
  blocks: BlockCatalogItem[]
): BlockCatalogItem[] {
  if (usesShopifyFullBlockPicker(sectionKey)) return blocks;
  if (!catalog?.sectionBlockAllowlist || !sectionKey) return blocks;
  const allow = catalog.sectionBlockAllowlist[sectionKey];
  if (allow === undefined) return blocks;
  const set = new Set(allow);
  return blocks.filter((b) => set.has(b.id));
}

export function resolveSectionKeyFromAddBlockNodeId(nodeId: string): string | undefined {
  const layoutMatch = nodeId.match(/^layout:([^:]+):/);
  if (layoutMatch) return layoutMatch[1];
  const m = nodeId.match(/^template:([^:]+):([^:]+):/);
  if (m) return m[2];
  return undefined;
}

function layoutBlueprintFromInstanceId(instanceId: string): string {
  const m = instanceId.match(/^(.+?)_\d+$/);
  return m ? m[1] : instanceId;
}

function layoutSectionTypeFromBlueprint(blueprintId: string): string {
  return blueprintId.replace(/_/g, '-');
}

/** Nested FAQ add-block targets only allow specific block ids. */
export function resolveNestedAddBlockAllowlist(addBlockNodeId: string): string[] | undefined {
  if (/:block:accordion:nested:[^:]+:inner-add-block$/.test(addBlockNodeId)) {
    return ['text'];
  }
  if (/:block:accordion:inner-add-block$/.test(addBlockNodeId)) {
    return ['accordion-row'];
  }
  return undefined;
}

/** Map add-block node id → section `type` for manifest.sectionBlocks allowlist. */
export function resolveSectionTypeForAddBlock(
  editorSchema: {
    templates?: Array<{ sections?: Array<{ id?: string; type?: string }> }>;
    layout?: Record<string, unknown>;
  } | null,
  addBlockNodeId: string
): string | undefined {
  const secId = resolveSectionKeyFromAddBlockNodeId(addBlockNodeId);
  if (!secId) return undefined;

  if (addBlockNodeId.startsWith('layout:')) {
    const blueprint = layoutBlueprintFromInstanceId(secId);
    return layoutSectionTypeFromBlueprint(blueprint);
  }

  for (const tpl of editorSchema?.templates ?? []) {
    const sec = tpl.sections?.find((s) => s.id === secId);
    if (sec?.type) return sec.type;
  }
  return secId;
}
