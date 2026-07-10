/** Catalog presets for featured collection layout variants. */

export function applyFeaturedCollectionCatalogPreset(
  section: Record<string, unknown>,
  catalogId: string
): void {
  if (section.type !== 'featured-collection') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = catalogId;

  if (catalogId === 'featured-collection-carousel') {
    settings.layoutType = 'carousel';
    settings.carouselOnMobile = true;
    settings.productsToShow = settings.productsToShow ?? 6;
    settings.columns = settings.columns ?? 4;
    settings.mobileColumns = settings.mobileColumns ?? '1';
    settings.horizontalGap = settings.horizontalGap ?? 8;
    settings.verticalGap = settings.verticalGap ?? 8;
    settings.sectionWidth = settings.sectionWidth ?? 'page';
    settings.alignment = settings.alignment ?? 'left';
    settings.sectionGap = settings.sectionGap ?? 28;
    settings.colorScheme = settings.colorScheme ?? 'scheme-1';
    settings.navIcon = settings.navIcon ?? 'arrows';
    settings.navIconBackground = settings.navIconBackground ?? 'circle';
    settings.paddingTop = settings.paddingTop ?? 48;
    settings.paddingBottom = settings.paddingBottom ?? 48;
    settings.collectionHandle = settings.collectionHandle ?? 'products';
    return;
  }

  if (catalogId === 'featured-collection-grid') {
    settings.layoutType = 'grid';
    settings.carouselOnMobile = false;
    settings.productsToShow = settings.productsToShow ?? 8;
    settings.columns = settings.columns ?? 4;
    settings.mobileColumns = settings.mobileColumns ?? '2';
    settings.horizontalGap = settings.horizontalGap ?? 8;
    settings.verticalGap = settings.verticalGap ?? 24;
    settings.sectionWidth = settings.sectionWidth ?? 'page';
    settings.alignment = settings.alignment ?? 'left';
    settings.sectionGap = settings.sectionGap ?? 28;
    settings.colorScheme = settings.colorScheme ?? 'scheme-1';
    settings.paddingTop = settings.paddingTop ?? 48;
    settings.paddingBottom = settings.paddingBottom ?? 48;
    settings.collectionHandle = settings.collectionHandle ?? 'products';
    return;
  }

  if (catalogId === 'featured-collection-editorial') {
    settings.layoutType = 'editorial';
    settings.carouselOnMobile = false;
    settings.productsToShow = settings.productsToShow ?? 4;
    settings.columns = settings.columns ?? 2;
    settings.mobileColumns = settings.mobileColumns ?? '1';
    settings.horizontalGap = settings.horizontalGap ?? 24;
    settings.verticalGap = settings.verticalGap ?? 24;
    settings.sectionWidth = settings.sectionWidth ?? 'page';
    settings.alignment = settings.alignment ?? 'left';
    settings.sectionGap = settings.sectionGap ?? 64;
    settings.colorScheme = settings.colorScheme ?? 'scheme-1';
    settings.paddingTop = settings.paddingTop ?? 48;
    settings.paddingBottom = settings.paddingBottom ?? 48;
    settings.collectionHandle = settings.collectionHandle ?? 'products';
    return;
  }

  settings.layoutType = settings.layoutType ?? 'grid';
  settings.carouselOnMobile = settings.carouselOnMobile ?? false;
  settings.productsToShow = settings.productsToShow ?? 4;
  settings.columns = settings.columns ?? 4;
  settings.mobileColumns = settings.mobileColumns ?? '2';
  settings.horizontalGap = settings.horizontalGap ?? 16;
  settings.verticalGap = settings.verticalGap ?? 24;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.alignment = settings.alignment ?? 'left';
  settings.sectionGap = settings.sectionGap ?? 28;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.collectionHandle = settings.collectionHandle ?? 'products';
  settings.showRating = settings.showRating ?? false;
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const header = (blocks.collection_header?.settings ?? {}) as Record<string, unknown>;
  header.title = header.title ?? 'Products';
  header.titleTypographyPreset = header.titleTypographyPreset ?? 'heading-2';
  header.layoutAlignment = header.layoutAlignment ?? 'left';
  header.viewAllLabel = header.viewAllLabel ?? '';
  header.subtitle = header.subtitle ?? '';
  if (blocks.collection_header) {
    blocks.collection_header.settings = header;
  }

  const card = (blocks.product_card?.settings ?? {}) as Record<string, unknown>;
  card.mediaAspectRatio = card.mediaAspectRatio ?? '1/1';
  card.productTitleTypographyPreset = card.productTitleTypographyPreset ?? 'body';
  card.priceTypographyPreset = card.priceTypographyPreset ?? 'body';
  if (blocks.product_card) {
    blocks.product_card.settings = card;
  }
  section.blocks = blocks;
}
