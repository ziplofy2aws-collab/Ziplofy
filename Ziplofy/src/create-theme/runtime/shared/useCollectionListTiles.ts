import { useEffect, useMemo } from 'react';
import {
  useStorefront,
  useStorefrontCollections,
  useThemeConfig,
  type StorefrontCollection,
} from '@render-store/sdk';
import { parseCollectionLinksPicker } from '../../utils/collection-links-collections.util';
import type { CollectionIllustrationVariant } from '../../collection-list-bento/runtime/CollectionBentoIllustrations';
import {
  readCollectionTiles,
  type CollectionTileData,
} from '../../collection-list-bento/runtime/collectionListBentoStyles';
import { cfgString } from './config';

const TILE_VARIANTS: CollectionIllustrationVariant[] = [
  'folded-shirts',
  'hanger-shirts',
  'hanging-sweaters',
  'clothing-rack',
];

const BENTO_COLUMN_SPANS: Array<1 | 2> = [1, 2, 2, 1];

function sectionTypeFromConfig(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): string {
  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  let cur: unknown = config;
  for (const seg of sectionBase.split('.')) {
    if (!cur || typeof cur !== 'object') return 'collection-list-grid';
    cur = (cur as Record<string, unknown>)[seg];
  }
  const type = (cur as { type?: string } | null)?.type;
  return typeof type === 'string' ? type : 'collection-list-grid';
}

function resolveStorefrontCollections(
  storefrontCollections: StorefrontCollection[],
  pickerRaw: string
): StorefrontCollection[] {
  const handles = parseCollectionLinksPicker(pickerRaw);
  if (!handles.length) return storefrontCollections;
  return handles
    .map((handle) => storefrontCollections.find((col) => col.urlHandle === handle))
    .filter((col): col is StorefrontCollection => Boolean(col));
}

function mapStorefrontCollectionsToTiles(
  collections: StorefrontCollection[],
  sectionType: string,
  configTiles: CollectionTileData[]
): CollectionTileData[] {
  const existingByHandle = new Map(
    configTiles.map((tile) => {
      const handle = tile.href
        .replace(/^\/collections\//, '')
        .replace(/^\/collection\//, '');
      return [handle, tile] as const;
    })
  );

  return collections.map((col, index) => {
    const handle = col.urlHandle?.trim() || '';
    const href = handle ? `/collection/${handle}` : '/collections/all';
    const existing = handle ? existingByHandle.get(handle) : undefined;
    const id = existing?.id ?? `tile_${index + 1}`;
    const columnSpan =
      sectionType === 'collection-list-bento'
        ? (existing?.columnSpan ?? BENTO_COLUMN_SPANS[index % BENTO_COLUMN_SPANS.length])
        : (existing?.columnSpan ?? 1);

    return {
      id,
      title: col.title?.trim() || existing?.title || 'Collection title',
      href,
      illustrationVariant:
        existing?.illustrationVariant ?? TILE_VARIANTS[index % TILE_VARIANTS.length],
      columnSpan,
      imageUrl: col.imageUrl?.trim() || existing?.imageUrl || '',
    };
  });
}

/** Live store collections for collection list sections; empty picker = all collections. */
export function useCollectionListTiles(
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template',
  settingsBase: string
): CollectionTileData[] {
  const config = useThemeConfig();
  const { storeFrontMeta } = useStorefront();
  const storeId = storeFrontMeta?.storeId ?? '';
  const { collections, fetchCollectionsByStoreId } = useStorefrontCollections();

  useEffect(() => {
    if (!storeId) return;
    void fetchCollectionsByStoreId(storeId);
  }, [storeId, fetchCollectionsByStoreId]);

  const configTiles = useMemo(
    () => readCollectionTiles(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  return useMemo(() => {
    const pickerRaw = cfgString(config, `${settingsBase}.collectionsPicker`, '');
    const sectionType = sectionTypeFromConfig(config, templateId, sectionId, placement);
    const resolved = resolveStorefrontCollections(collections, pickerRaw);
    if (!resolved.length) return configTiles;
    return mapStorefrontCollectionsToTiles(resolved, sectionType, configTiles);
  }, [
    collections,
    config,
    configTiles,
    placement,
    sectionId,
    settingsBase,
    templateId,
  ]);
}
