import type { Collection } from '../../contexts/collection.context';
import { setConfigAtPath } from '../../utils/theme-editor-config.utils';

export function sectionBaseFromCollectionsPickerPath(settingsPath: string): string | null {
  const suffix = '.settings.collectionsPicker';
  if (!settingsPath.endsWith(suffix)) return null;
  return settingsPath.slice(0, -suffix.length);
}

export function parseCollectionLinksPicker(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  try {
    const parsed = JSON.parse(t) as unknown;
    if (Array.isArray(parsed)) return parsed.map((h) => String(h).trim()).filter(Boolean);
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { handles?: string[] }).handles)) {
      return (parsed as { handles: string[] }).handles.map((h) => String(h).trim()).filter(Boolean);
    }
  } catch {
    /* comma-separated fallback */
  }
  return t
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
}

export function serializeCollectionLinksPicker(handles: string[]): string {
  if (!handles.length) return '';
  return JSON.stringify(handles);
}

export type CollectionLinkBlockSettings = {
  title: string;
  titleFont: string;
  titleWeight: string;
  titleLineHeight: string;
  titleLetterSpacing: string;
  titleCase: string;
  productCount: number;
  collectionHandle: string;
  href: string;
  imageUrl: string;
  imageHeight: string;
  imageRatio: string;
  imageCornerRadius: number;
};

export function collectionLinkBlocksFromCollections(
  collections: Pick<Collection, 'title' | 'urlHandle' | 'productCount' | 'imageUrl'>[]
): {
  blocks: Record<string, { type: string; settings: CollectionLinkBlockSettings }>;
  block_order: string[];
} {
  const blocks: Record<string, { type: string; settings: CollectionLinkBlockSettings }> = {};
  const block_order: string[] = [];

  collections.forEach((col, index) => {
    const id = `link_${index + 1}`;
    const handle = col.urlHandle?.trim() || '';
    const href = handle ? `/collections/${handle}` : '/collections/all';
    blocks[id] = {
      type: 'collection-link',
      settings: {
        title: col.title?.trim() || 'Collection title',
        titleFont: 'subheading',
        titleWeight: 'default',
        titleLineHeight: 'normal',
        titleLetterSpacing: 'normal',
        titleCase: 'default',
        productCount: Math.max(0, Number(col.productCount ?? 0)),
        collectionHandle: handle,
        href,
        imageUrl: col.imageUrl?.trim() || '',
        imageHeight: 'large',
        imageRatio: 'square',
        imageCornerRadius: 0,
      },
    };
    block_order.push(id);
  });

  return { blocks, block_order };
}

export function valuePathsForCollectionLinkBlocks(
  sectionBase: string,
  blocks: Record<string, { settings: CollectionLinkBlockSettings }>,
  block_order: string[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of block_order) {
    const settings = blocks[id]?.settings;
    if (!settings) continue;
    const base = `${sectionBase}.blocks.${id}.settings`;
    out[`${base}.title`] = settings.title;
    out[`${base}.titleFont`] = settings.titleFont;
    out[`${base}.titleWeight`] = settings.titleWeight;
    out[`${base}.titleLineHeight`] = settings.titleLineHeight;
    out[`${base}.titleLetterSpacing`] = settings.titleLetterSpacing;
    out[`${base}.titleCase`] = settings.titleCase;
    out[`${base}.productCount`] = String(settings.productCount);
    out[`${base}.collectionHandle`] = settings.collectionHandle;
    out[`${base}.href`] = settings.href;
    out[`${base}.imageUrl`] = settings.imageUrl ?? '';
    out[`${base}.imageHeight`] = settings.imageHeight ?? 'large';
    out[`${base}.imageRatio`] = settings.imageRatio ?? 'square';
    out[`${base}.imageCornerRadius`] = String(settings.imageCornerRadius ?? 0);
  }
  return out;
}

export function pruneCollectionLinkBlockValues(
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

export function applyCollectionLinksSelectionToConfig(
  config: Record<string, unknown>,
  settingsPath: string,
  collections: Pick<Collection, 'title' | 'urlHandle' | 'productCount' | 'imageUrl'>[]
): { config: Record<string, unknown>; blockValuePaths: Record<string, string>; pickerValue: string } {
  const sectionBase = sectionBaseFromCollectionsPickerPath(settingsPath);
  if (!sectionBase) {
    return { config, blockValuePaths: {}, pickerValue: '' };
  }

  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const handles = collections.map((c) => c.urlHandle).filter(Boolean);
  const pickerValue = serializeCollectionLinksPicker(handles);
  setConfigAtPath(next, settingsPath, pickerValue);

  const { blocks, block_order } = collectionLinkBlocksFromCollections(collections);
  for (const id of block_order) {
    const settingsBase = `${sectionBase}.blocks.${id}.settings`;
    const block = blocks[id] as Record<string, unknown>;
    block.settings_field_order = [`${settingsBase}.title`, `${settingsBase}.imageUrl`];
  }
  setConfigAtPath(next, `${sectionBase}.blocks`, blocks);
  setConfigAtPath(next, `${sectionBase}.block_order`, block_order);

  const blockValuePaths = valuePathsForCollectionLinkBlocks(sectionBase, blocks, block_order);
  return { config: next, blockValuePaths, pickerValue };
}
