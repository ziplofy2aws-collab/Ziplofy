import { applyCollectionListGridPreset } from './collection-list-grid-preset.util';
import { creatorTemplateHasSections } from './theme-editor-static-pack';

export const COLLECTIONS_LIST_TEMPLATE_ID = 'collections-list';
export const COLLECTIONS_LIST_GRID_SECTION_ID = 'collection_list_grid';

function defaultCollectionsListGridSection(): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'collection-list-grid',
    enabled: true,
    settings: {
      catalogVariant: 'collection-list-grid',
      heading: '<strong>Collections</strong>',
      headingText: {
        settings: {
          text: '<strong>Collections</strong>',
          width: 'fit',
          maxWidth: 'normal',
          typographyPreset: 'default',
          textColor: 'default',
          backgroundEnabled: false,
          paddingTop: 0,
          paddingBottom: 16,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
      collectionsPicker: '',
      cardsLayoutType: 'grid',
      carouselOnMobile: false,
      columns: 3,
      mobileColumns: '2',
      horizontalGap: 8,
      verticalGap: 8,
      sectionWidth: 'page',
      layoutGap: 12,
      backgroundColor: 'default',
      paddingTop: 48,
      paddingBottom: 48,
      customCss: '',
    },
    blocks: {},
    block_order: [],
  };
  applyCollectionListGridPreset(section);
  return section;
}

/** Ensure the Collections list page template has a default Collection list: Grid section. */
export function ensureCollectionsListTemplateBlocks(config: Record<string, unknown>): boolean {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  let tpl = templates[COLLECTIONS_LIST_TEMPLATE_ID];
  if (!tpl || typeof tpl !== 'object') {
    tpl = {
      name: 'Collection list',
      sections: {},
      section_order: [],
    };
    templates[COLLECTIONS_LIST_TEMPLATE_ID] = tpl;
  }

  const sections = (tpl.sections ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(tpl.section_order) ? [...(tpl.section_order as string[])] : [];
  let changed = false;

  if (!tpl.name) {
    tpl.name = 'Collection list';
    changed = true;
  }

  if (!sections[COLLECTIONS_LIST_GRID_SECTION_ID]) {
    sections[COLLECTIONS_LIST_GRID_SECTION_ID] = defaultCollectionsListGridSection();
    changed = true;
  } else {
    const sec = sections[COLLECTIONS_LIST_GRID_SECTION_ID];
    if (sec.type === 'collection-list-grid') {
      applyCollectionListGridPreset(sec);
    }
  }

  if (!order.includes(COLLECTIONS_LIST_GRID_SECTION_ID)) {
    order.unshift(COLLECTIONS_LIST_GRID_SECTION_ID);
    changed = true;
  }

  tpl.sections = sections;
  tpl.section_order = order;
  return changed;
}

/** Seed collections-list from pack when the template bucket is empty. */
export function seedCollectionsListTemplateFromPack(
  config: Record<string, unknown>,
  packDefault: Record<string, unknown>
): boolean {
  if (creatorTemplateHasSections(config, COLLECTIONS_LIST_TEMPLATE_ID)) return false;

  const packTpl = (
    packDefault.templates as Record<string, Record<string, unknown>> | undefined
  )?.[COLLECTIONS_LIST_TEMPLATE_ID];
  if (packTpl && typeof packTpl === 'object') {
    if (!config.templates || typeof config.templates !== 'object') {
      config.templates = {};
    }
    const templates = config.templates as Record<string, Record<string, unknown>>;
    templates[COLLECTIONS_LIST_TEMPLATE_ID] = JSON.parse(JSON.stringify(packTpl));
    return true;
  }

  return ensureCollectionsListTemplateBlocks(config);
}
