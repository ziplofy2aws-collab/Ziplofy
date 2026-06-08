import type { ThemePreviewPage } from '../ThemeLivePreviewFrame';
import { collectionLinkBlockPaths } from '../../../utils/collection-links-spotlight-sidebar.util';
import { bottomAlignedHeroStructureOrder } from '../../../utils/hero-bottom-aligned.util';

function collectionLinksSpotlightStructureOrder(
  prefix: string,
  blocksBase: string,
  blockOrder: string[],
  sectionChildrenListKey: string,
  _catalogVariant: string
): Record<string, string[]> {
  const out: Record<string, string[]> = {
    [sectionChildrenListKey]: blockOrder.map((id) => `${prefix}:block:${id}`),
  };

  for (const blockId of blockOrder) {
    const blockPrefix = `${prefix}:block:${blockId}`;
    const paths = collectionLinkBlockPaths(blocksBase, blockId);
    out[listKeyBlockChildren(blockPrefix)] = [
      `field:${paths.title}`,
      `field:${paths.imageUrl}`,
    ];
  }

  return out;
}
import type { SidebarNode } from './theme-editor-sidebar.types';

function templateIdForPage(page: ThemePreviewPage): string {
  return page || 'index';
}

export function listKeyTemplateSections(tplId: string): string {
  return `sections:template:${tplId}`;
}

export function listKeyHeaderSections(): string {
  return 'sections:header';
}

export function listKeyFooterSections(): string {
  return 'sections:footer';
}

export function listKeySectionChildren(tplId: string, secId: string): string {
  return `children:template:${tplId}:${secId}`;
}

/** Layout sections use the same children list shape with a synthetic tpl id. */
export function listKeyLayoutSectionChildren(layoutKey: string): string {
  return `children:layout:${layoutKey}`;
}

export function listKeyLayoutBlocks(layoutKey: string): string {
  return `blocks:layout:${layoutKey}`;
}

/** Field order inside a block group (e.g. Media, Product title, Price under Product card). */
export function listKeyBlockChildren(blockPrefix: string): string {
  return `fields:${blockPrefix}`;
}

function getNested(obj: Record<string, unknown>, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function setNested(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const p = path[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

function sectionIdFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:[^:]+:([^:]+)/);
  return m?.[1] ?? null;
}

function blockIdFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/:block:([^:]+)/);
  return m?.[1] ?? null;
}

function fieldPathFromNodeId(nodeId: string): string | null {
  if (!nodeId.startsWith('field:')) return null;
  return nodeId.slice('field:'.length);
}

function blockPrefixFromListKey(listKey: string): string | null {
  if (!listKey.startsWith('fields:')) return null;
  return listKey.slice('fields:'.length);
}

function nestedIdFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/:nested:([^:]+)/);
  return m?.[1] ?? null;
}

function applyBlockStructureOrder(
  blockPrefix: string,
  blockCfg: { settings_field_order?: string[]; nested_block_order?: string[] },
  out: Record<string, string[]>
): void {
  if (blockCfg.settings_field_order?.length) {
    out[listKeyBlockChildren(blockPrefix)] = [
      `${blockPrefix}:inner-add-block`,
      ...blockCfg.settings_field_order.map((p) => `field:${p}`),
      `${blockPrefix}:inner-add-block`,
    ];
  }
  if (blockCfg.nested_block_order?.length) {
    out[listKeyBlockChildren(`${blockPrefix}:nested`)] = blockCfg.nested_block_order.map(
      (id) => `${blockPrefix}:nested:${id}`
    );
  }
}

/** Build sidebar list order from merged theme config. */
export function readStructureOrderFromConfig(
  config: Record<string, unknown> | null,
  page: ThemePreviewPage
): Record<string, string[]> {
  if (!config) return {};
  const tplId = templateIdForPage(page);
  const out: Record<string, string[]> = {};

  const layoutOrder = getNested(config, ['layout_order']) as
    | { header?: string[]; footer?: string[] }
    | undefined;

  if (layoutOrder?.header?.length) {
    out[listKeyHeaderSections()] = layoutOrder.header.map((id) => `layout:${id}`);
  } else {
    const layoutSections = config.sections as Record<string, unknown> | undefined;
    if (layoutSections) {
      const headerIds = Object.keys(layoutSections).filter(
        (k) =>
          k === 'announcement_bar' ||
          k.startsWith('announcement_bar_') ||
          k === 'header' ||
          k.startsWith('header_')
      );
      if (headerIds.length) {
        out[listKeyHeaderSections()] = headerIds.map((id) => `layout:${id}`);
      }
    }
  }

  if (layoutOrder?.footer?.length) {
    out[listKeyFooterSections()] = layoutOrder.footer.map((id) => `layout:${id}`);
  }

  const tpl = getNested(config, ['templates', tplId]) as
    | {
        section_order?: string[];
        sections?: Record<
          string,
          {
            block_order?: string[];
            settings_field_order?: string[];
            blocks?: Record<
              string,
              { settings_field_order?: string[]; nested_block_order?: string[] }
            >;
          }
        >;
      }
    | undefined;

  if (tpl?.section_order?.length) {
    out[listKeyTemplateSections(tplId)] = tpl.section_order.map((id) => `template:${tplId}:${id}`);
  } else if (tpl?.sections) {
    out[listKeyTemplateSections(tplId)] = Object.keys(tpl.sections).map((id) => `template:${tplId}:${id}`);
  }

  const tplCfg = getNested(config, ['templates', tplId]) as
    | { sections?: Record<string, { type?: string; settings?: { catalogVariant?: string } }> }
    | undefined;

  for (const [secId, sec] of Object.entries(tpl?.sections ?? {})) {
    const listKey = listKeySectionChildren(tplId, secId);
    const isHero = (sec as { type?: string }).type === 'hero';
    const catalogVariant = tplCfg?.sections?.[secId]?.settings?.catalogVariant;
    const isBottomAlignedHero =
      catalogVariant === 'hero-bottom-aligned' ||
      sec.block_order?.includes('content_group');
    if (isHero && isBottomAlignedHero) {
      Object.assign(
        out,
        bottomAlignedHeroStructureOrder(`template:${tplId}:${secId}`, listKey, listKeyBlockChildren)
      );
      continue;
    }

    const isCollectionLinks =
      (sec as { type?: string }).type === 'collection-links-spotlight' ||
      catalogVariant === 'collection-links-spotlight' ||
      catalogVariant === 'collection-links-text';
    if (isCollectionLinks && sec.block_order?.length) {
      const sectionPrefix = `template:${tplId}:${secId}`;
      const blocksBase = `templates.${tplId}.sections.${secId}.blocks`;
      Object.assign(
        out,
        collectionLinksSpotlightStructureOrder(
          sectionPrefix,
          blocksBase,
          sec.block_order,
          listKey,
          catalogVariant ?? 'collection-links-spotlight'
        )
      );
      continue;
    }

    const ids: string[] = [];
    if (isHero) {
      ids.push(`template:${tplId}:${secId}:add-block`);
    } else if (sec.settings_field_order?.length) {
      for (const path of sec.settings_field_order) {
        ids.push(`field:${path}`);
      }
    }
    if (sec.block_order?.length) {
      for (const blockId of sec.block_order) {
        ids.push(`template:${tplId}:${secId}:block:${blockId}`);
        const blockCfg = sec.blocks?.[blockId];
        const blockPrefix = `template:${tplId}:${secId}:block:${blockId}`;
        if (blockCfg) applyBlockStructureOrder(blockPrefix, blockCfg, out);
      }
    }
    if (ids.length) out[listKey] = ids;
  }

  const layoutSections = config.sections as
    | Record<
        string,
        {
          block_order?: string[];
          settings_field_order?: string[];
          blocks?: Record<
            string,
            { settings_field_order?: string[]; nested_block_order?: string[] }
          >;
        }
      >
    | undefined;

  for (const [layoutKey, layoutSec] of Object.entries(layoutSections ?? {})) {
    const secListKey = listKeyLayoutSectionChildren(layoutKey);
    const secType = (layoutSec as { type?: string }).type;
    const isHero = secType === 'hero';
    const isAnnouncementBar = secType === 'announcement-bar';
    const catalogVariant = getNested(config, ['sections', layoutKey, 'settings', 'catalogVariant']);
    const isBottomAlignedHero =
      catalogVariant === 'hero-bottom-aligned' ||
      layoutSec.block_order?.includes('content_group');
    if (isHero && isBottomAlignedHero) {
      Object.assign(
        out,
        bottomAlignedHeroStructureOrder(`layout:${layoutKey}`, secListKey, listKeyBlockChildren)
      );
      continue;
    }

    const secIds: string[] = [];
    if (layoutSec.settings_field_order?.length) {
      for (const path of layoutSec.settings_field_order) {
        secIds.push(`field:${path}`);
      }
    }
    if (layoutSec.block_order?.length) {
      if (isHero || isAnnouncementBar) {
        secIds.push(`layout:${layoutKey}:add-block`);
      }
      for (const blockId of layoutSec.block_order) {
        secIds.push(`layout:${layoutKey}:block:${blockId}`);
        const blockCfg = layoutSec.blocks?.[blockId];
        const blockPrefix = `layout:${layoutKey}:block:${blockId}`;
        if (blockCfg) applyBlockStructureOrder(blockPrefix, blockCfg, out);
      }
      out[listKeyLayoutBlocks(layoutKey)] = layoutSec.block_order.map(
        (id) => `layout:${layoutKey}:block:${id}`
      );
    }
    if (secIds.length) out[secListKey] = secIds;
  }

  return out;
}

/** Apply a reorder action to in-memory config (mutates clone). */
export function applyStructureOrderToConfig(
  config: Record<string, unknown>,
  listKey: string,
  orderedNodeIds: string[],
  page: ThemePreviewPage
): void {
  const tplId = templateIdForPage(page);

  if (listKey === listKeyHeaderSections()) {
    const sectionIds = orderedNodeIds
      .map((id) => (id.startsWith('layout:') ? id.slice('layout:'.length) : null))
      .filter((id): id is string => Boolean(id));
    setNested(config, ['layout_order', 'header'], sectionIds);
    return;
  }

  if (listKey === listKeyFooterSections()) {
    const sectionIds = orderedNodeIds
      .map((id) => (id.startsWith('layout:') ? id.slice('layout:'.length) : null))
      .filter((id): id is string => Boolean(id));
    setNested(config, ['layout_order', 'footer'], sectionIds);
    return;
  }

  if (listKey === listKeyTemplateSections(tplId)) {
    const sectionIds = orderedNodeIds
      .map(sectionIdFromNodeId)
      .filter((id): id is string => Boolean(id));
    setNested(config, ['templates', tplId, 'section_order'], sectionIds);
    return;
  }

  const nestedGroupMatch = listKey.match(/^fields:(.+):nested$/);
  if (nestedGroupMatch) {
    const blockPrefix = nestedGroupMatch[1];
    const nestedIds = orderedNodeIds
      .map(nestedIdFromNodeId)
      .filter((id): id is string => Boolean(id));

    if (blockPrefix.startsWith('layout:')) {
      const m = blockPrefix.match(/^layout:([^:]+):block:(.+)$/);
      if (m) {
        setNested(config, ['sections', m[1], 'blocks', m[2], 'nested_block_order'], nestedIds);
      }
      return;
    }

    const m = blockPrefix.match(/^template:([^:]+):([^:]+):block:(.+)$/);
    if (m) {
      const [, tpl, secId, blockId] = m;
      setNested(
        config,
        ['templates', tpl, 'sections', secId, 'blocks', blockId, 'nested_block_order'],
        nestedIds
      );
    }
    return;
  }

  const blockFieldsMatch = listKey.match(/^fields:(.+)$/);
  if (blockFieldsMatch) {
    const blockPrefix = blockFieldsMatch[1];
    const fieldPaths = orderedNodeIds
      .map(fieldPathFromNodeId)
      .filter((p): p is string => Boolean(p));

    if (blockPrefix.startsWith('layout:')) {
      const m = blockPrefix.match(/^layout:([^:]+):block:(.+)$/);
      if (m) {
        setNested(config, ['sections', m[1], 'blocks', m[2], 'settings_field_order'], fieldPaths);
      }
      return;
    }

    const m = blockPrefix.match(/^template:([^:]+):([^:]+):block:(.+)$/);
    if (m) {
      const [, tpl, secId, blockId] = m;
      setNested(
        config,
        ['templates', tpl, 'sections', secId, 'blocks', blockId, 'settings_field_order'],
        fieldPaths
      );
    }
    return;
  }

  const childrenMatch = listKey.match(/^children:template:([^:]+):(.+)$/);
  if (childrenMatch) {
    const [, tpl, secId] = childrenMatch;
    const fieldPaths = orderedNodeIds
      .map(fieldPathFromNodeId)
      .filter((p): p is string => Boolean(p));
    const blockIds = orderedNodeIds
      .map(blockIdFromNodeId)
      .filter((id): id is string => Boolean(id));

    if (fieldPaths.length) {
      setNested(config, ['templates', tpl, 'sections', secId, 'settings_field_order'], fieldPaths);
    }
    if (blockIds.length) {
      setNested(config, ['templates', tpl, 'sections', secId, 'block_order'], blockIds);
    }
    return;
  }

  const layoutChildrenMatch = listKey.match(/^children:layout:(.+)$/);
  if (layoutChildrenMatch) {
    const layoutKey = layoutChildrenMatch[1];
    const fieldPaths = orderedNodeIds
      .map(fieldPathFromNodeId)
      .filter((p): p is string => Boolean(p));
    const blockIds = orderedNodeIds
      .map(blockIdFromNodeId)
      .filter((id): id is string => Boolean(id));
    if (fieldPaths.length) {
      setNested(config, ['sections', layoutKey, 'settings_field_order'], fieldPaths);
    }
    if (blockIds.length) {
      setNested(config, ['sections', layoutKey, 'block_order'], blockIds);
    }
    return;
  }

  const layoutMatch = listKey.match(/^blocks:layout:(.+)$/);
  if (layoutMatch) {
    const layoutKey = layoutMatch[1];
    const blockIds = orderedNodeIds
      .map(blockIdFromNodeId)
      .filter((id): id is string => Boolean(id));
    setNested(config, ['sections', layoutKey, 'block_order'], blockIds);
  }
}

export function isSortableSidebarNode(node: SidebarNode): boolean {
  return node.kind === 'section' || node.kind === 'block' || node.kind === 'field';
}

/** Reorder sibling nodes; keeps Add block / Add section rows pinned. */
export function reorderSidebarChildren(
  children: SidebarNode[],
  listKey: string,
  itemOrder: Record<string, string[]>
): SidebarNode[] {
  const order = itemOrder[listKey];
  if (!order?.length) return children;

  const pinned = children.filter((c) => c.kind === 'add-block' || c.kind === 'add-section');
  const sortable = children.filter((c) => isSortableSidebarNode(c));
  const byId = new Map(sortable.map((n) => [n.id, n]));
  const sorted: SidebarNode[] = [];

  for (const id of order) {
    const node = byId.get(id);
    if (node) {
      sorted.push(node);
      byId.delete(id);
    }
  }
  for (const node of byId.values()) sorted.push(node);

  const pinnedStart = pinned.filter((p) => p.label === 'Add block' && p.id.includes('inner-add-block'));
  const pinnedEnd = pinned.filter((p) => !pinnedStart.includes(p));

  return [...pinnedStart, ...sorted, ...pinnedEnd];
}

export function mergeItemOrder(
  prev: Record<string, string[]>,
  listKey: string,
  orderedIds: string[]
): Record<string, string[]> {
  return { ...prev, [listKey]: orderedIds };
}
