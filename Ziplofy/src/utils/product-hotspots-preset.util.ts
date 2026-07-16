import {
  mergeProductHotspotsHeadingSettings,
} from '../create-theme/sidebar/theme-editor-product-hotspots-heading-panel.utils';
import { mergeProductHotspotsHotspotSettings } from '../create-theme/sidebar/theme-editor-product-hotspots-block-panel.utils';

const DEFAULT_POSITIONS = [
  { x: 50, y: 10 },
  { x: 22, y: 38 },
  { x: 58, y: 55 },
  { x: 35, y: 50 },
  { x: 76, y: 48 },
] as const;

function makeHotspot(x: number, y: number) {
  const settings = {
    positionX: x,
    positionY: y,
    productId: '',
    productImageUrl: '',
    productTitle: 'Product title',
    price: 'Rs. 19.99',
  };
  mergeProductHotspotsHotspotSettings(settings);
  return {
    type: 'product-hotspot',
    settings,
  };
}

export function applyProductHotspotsPreset(section: Record<string, unknown>): void {
  if (section.type !== 'product-hotspots') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'product-hotspots';
  settings.heading = settings.heading ?? 'Shop the look';
  mergeProductHotspotsHeadingSettings(settings);
  settings.imageUrl = settings.imageUrl ?? '';
  settings.mediaOverlay = settings.mediaOverlay ?? false;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.sectionHeight = settings.sectionHeight ?? 'auto';
  settings.hotspotColor = settings.hotspotColor ?? '#FFFFFF57';
  settings.innerColor = settings.innerColor ?? '#FFFFFF';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundColor = settings.backgroundColor ?? 'default';
  settings.popoverGap = settings.popoverGap ?? 8;
  settings.titleTypography = settings.titleTypography ?? 'default';
  settings.priceTypography = settings.priceTypography ?? 'default';
  settings.paddingTop = settings.paddingTop ?? 40;
  settings.paddingBottom = settings.paddingBottom ?? 40;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];

  // Only seed default hotspots on first create (block_order never set).
  // An explicit empty array means the merchant deleted all hotspots — keep it empty.
  if (!Array.isArray(section.block_order)) {
    const nextBlocks: Record<string, Record<string, unknown>> = {};
    const nextOrder: string[] = [];
    DEFAULT_POSITIONS.forEach((p, i) => {
      const id = `hotspot_${i + 1}`;
      nextBlocks[id] = makeHotspot(p.x, p.y);
      nextOrder.push(id);
    });
    section.blocks = nextBlocks;
    section.block_order = nextOrder;
    return;
  }

  section.blocks = blocks;
  section.block_order = order;

  for (const block of Object.values(blocks)) {
    const blockSettings = (block as { settings?: Record<string, unknown> }).settings;
    if (blockSettings) mergeProductHotspotsHotspotSettings(blockSettings);
  }
}

/** Ensure product-hotspots sections have heading + hotspot blocks (for older configs). */
export function ensureProductHotspotsSectionBlocks(config: Record<string, unknown>): boolean {
  let changed = false;
  const templates = config.templates as
    | Record<string, { sections?: Record<string, Record<string, unknown>> }>
    | undefined;

  for (const tpl of Object.values(templates ?? {})) {
    for (const sec of Object.values(tpl?.sections ?? {})) {
      if (sec.type !== 'product-hotspots') continue;
      const settings = (sec.settings ?? {}) as Record<string, unknown>;
      if (settings.catalogVariant !== 'product-hotspots' && settings.catalogVariant !== undefined) {
        continue;
      }

      const before = JSON.stringify(sec);
      applyProductHotspotsPreset(sec);
      if (JSON.stringify(sec) !== before) changed = true;
    }
  }

  const layoutSections = config.sections as Record<string, Record<string, unknown>> | undefined;
  for (const sec of Object.values(layoutSections ?? {})) {
    if (sec.type !== 'product-hotspots') continue;
    const settings = (sec.settings ?? {}) as Record<string, unknown>;
    if (settings.catalogVariant !== 'product-hotspots' && settings.catalogVariant !== undefined) {
      continue;
    }

    const before = JSON.stringify(sec);
    applyProductHotspotsPreset(sec);
    if (JSON.stringify(sec) !== before) changed = true;
  }

  return changed;
}
