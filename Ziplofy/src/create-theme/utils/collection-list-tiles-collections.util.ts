import type { Collection } from '../../contexts/collection.context';
import { setConfigAtPath } from '../../utils/theme-editor-config.utils';
import {
  sectionBaseFromCollectionsPickerPath,
  serializeCollectionLinksPicker,
} from './collection-links-collections.util';

const BENTO_TILE_SPECS = [
  { illustrationVariant: 'folded-shirts', columnSpan: 1 },
  { illustrationVariant: 'hanger-shirts', columnSpan: 2 },
  { illustrationVariant: 'hanging-sweaters', columnSpan: 2 },
  { illustrationVariant: 'clothing-rack', columnSpan: 1 },
] as const;

const TILE_VARIANTS = ['folded-shirts', 'hanger-shirts', 'hanging-sweaters', 'clothing-rack'] as const;

export type CollectionTileBlockSettings = {
  title: string;
  collectionHandle: string;
  href: string;
  illustrationVariant: string;
  columnSpan?: number;
  imageUrl: string;
};

export function isCollectionListTileSectionType(type: string | undefined | null): boolean {
  return (
    type === 'collection-list-bento' ||
    type === 'collection-list-carousel' ||
    type === 'collection-list-editorial' ||
    type === 'collection-list-grid'
  );
}

function getAtPath(config: Record<string, unknown>, dotPath: string): unknown {
  let cur: unknown = config;
  for (const seg of dotPath.split('.')) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

export function sectionTypeFromCollectionsPickerPath(
  config: Record<string, unknown>,
  settingsPath: string
): string | null {
  const sectionBase = sectionBaseFromCollectionsPickerPath(settingsPath);
  if (!sectionBase) return null;
  const section = getAtPath(config, sectionBase) as Record<string, unknown> | undefined;
  return typeof section?.type === 'string' ? section.type : null;
}

function tileDecor(
  index: number,
  sectionType: string,
  existing?: CollectionTileBlockSettings
): Pick<CollectionTileBlockSettings, 'illustrationVariant' | 'columnSpan'> {
  if (sectionType === 'collection-list-bento') {
    const spec = BENTO_TILE_SPECS[index % BENTO_TILE_SPECS.length];
    return {
      illustrationVariant: existing?.illustrationVariant ?? spec.illustrationVariant,
      columnSpan: existing?.columnSpan ?? spec.columnSpan,
    };
  }
  return {
    illustrationVariant: existing?.illustrationVariant ?? TILE_VARIANTS[index % TILE_VARIANTS.length],
  };
}

export function collectionTileBlocksFromCollections(
  collections: Pick<Collection, 'title' | 'urlHandle' | 'imageUrl'>[],
  sectionType: string,
  existingBlocks: Record<string, { type: string; settings: CollectionTileBlockSettings }> = {}
): {
  blocks: Record<string, { type: string; settings: CollectionTileBlockSettings }>;
  block_order: string[];
} {
  const blocks: Record<string, { type: string; settings: CollectionTileBlockSettings }> = {};
  const block_order: string[] = [];

  collections.forEach((col, index) => {
    const id = `tile_${index + 1}`;
    const existing = existingBlocks[id]?.settings;
    const handle = col.urlHandle?.trim() || '';
    const href = handle ? `/collections/${handle}` : '/collections/all';
    const decor = tileDecor(index, sectionType, existing);

    const settings: CollectionTileBlockSettings = {
      title: col.title?.trim() || existing?.title || 'Collection title',
      collectionHandle: handle,
      href,
      illustrationVariant: decor.illustrationVariant,
      imageUrl: col.imageUrl?.trim() || existing?.imageUrl || '',
    };
    if (sectionType === 'collection-list-bento') {
      settings.columnSpan = decor.columnSpan;
    }

    blocks[id] = { type: 'collection-tile', settings };
    block_order.push(id);
  });

  return { blocks, block_order };
}

export function valuePathsForCollectionTileBlocks(
  sectionBase: string,
  blocks: Record<string, { settings: CollectionTileBlockSettings }>,
  block_order: string[],
  sectionType: string
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of block_order) {
    const settings = blocks[id]?.settings;
    if (!settings) continue;
    const base = `${sectionBase}.blocks.${id}.settings`;
    out[`${base}.title`] = settings.title;
    out[`${base}.collectionHandle`] = settings.collectionHandle;
    out[`${base}.href`] = settings.href;
    out[`${base}.illustrationVariant`] = settings.illustrationVariant;
    out[`${base}.imageUrl`] = settings.imageUrl ?? '';
    if (sectionType === 'collection-list-bento' && settings.columnSpan != null) {
      out[`${base}.columnSpan`] = String(settings.columnSpan);
    }
  }
  return out;
}

export function pruneCollectionTileBlockValues(
  values: Record<string, string | boolean>,
  sectionBase: string,
  keepBlockIds: Set<string>
): Record<string, string | boolean> {
  const prefix = `${sectionBase}.blocks.`;
  const next: Record<string, string | boolean> = {};
  for (const [path, val] of Object.entries(values)) {
    if (!path.startsWith(prefix)) {
      next[path] = val;
      continue;
    }
    const rest = path.slice(prefix.length);
    const blockId = rest.split('.')[0];
    if (keepBlockIds.has(blockId)) next[path] = val;
  }
  return next;
}

export function applyCollectionListTilesSelectionToConfig(
  config: Record<string, unknown>,
  settingsPath: string,
  collections: Pick<Collection, 'title' | 'urlHandle' | 'imageUrl'>[]
): { config: Record<string, unknown>; blockValuePaths: Record<string, string>; pickerValue: string } {
  const sectionBase = sectionBaseFromCollectionsPickerPath(settingsPath);
  if (!sectionBase) {
    return { config, blockValuePaths: {}, pickerValue: '' };
  }

  const sectionType = sectionTypeFromCollectionsPickerPath(config, settingsPath) ?? 'collection-list-bento';
  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const handles = collections.map((c) => c.urlHandle).filter(Boolean);
  const pickerValue = serializeCollectionLinksPicker(handles);
  setConfigAtPath(next, settingsPath, pickerValue);

  const existingSection = getAtPath(next, sectionBase) as Record<string, unknown> | undefined;
  const existingBlocks = (existingSection?.blocks ?? {}) as Record<
    string,
    { type: string; settings: CollectionTileBlockSettings }
  >;

  const { blocks, block_order } = collectionTileBlocksFromCollections(
    collections,
    sectionType,
    existingBlocks
  );

  for (const id of block_order) {
    const settingsBase = `${sectionBase}.blocks.${id}.settings`;
    const block = blocks[id] as Record<string, unknown>;
    const order = [`${settingsBase}.title`, `${settingsBase}.collectionHandle`];
    if (sectionType === 'collection-list-bento') {
      order.push(`${settingsBase}.columnSpan`, `${settingsBase}.illustrationVariant`);
    } else {
      order.push(`${settingsBase}.illustrationVariant`);
    }
    block.settings_field_order = order;
  }

  setConfigAtPath(next, `${sectionBase}.blocks`, blocks);
  setConfigAtPath(next, `${sectionBase}.block_order`, block_order);

  const blockValuePaths = valuePathsForCollectionTileBlocks(
    sectionBase,
    blocks,
    block_order,
    sectionType
  );
  return { config: next, blockValuePaths, pickerValue };
}
