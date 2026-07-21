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
    settings.backgroundColor = settings.backgroundColor ?? 'default';
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
  header.titleWidth = header.titleWidth ?? 'fit';
  header.titleMaxWidth = header.titleMaxWidth ?? 'normal';
  header.titleAlignment = header.titleAlignment ?? 'left';
  header.titleBackgroundEnabled = header.titleBackgroundEnabled ?? false;
  header.titleBackgroundColor = header.titleBackgroundColor ?? '#00000026';
  header.titleCornerRadius = header.titleCornerRadius ?? 0;
  header.titleTypographyPreset = header.titleTypographyPreset ?? 'heading-3';
  header.titleColor = header.titleColor ?? 'default';
  header.viewAllOpenInNewTab = header.viewAllOpenInNewTab ?? false;
  header.viewAllStyle = header.viewAllStyle ?? 'link';
  header.viewAllLinkTextColor = header.viewAllLinkTextColor ?? 'default';
  header.viewAllCustomBackgroundColor = header.viewAllCustomBackgroundColor ?? 'palette:0';
  header.viewAllCustomTextColor = header.viewAllCustomTextColor ?? 'palette:1';
  header.viewAllCustomBorderColor = header.viewAllCustomBorderColor ?? 'palette:1';
  header.viewAllDesktopWidth = header.viewAllDesktopWidth ?? 'fit';
  header.viewAllDesktopCustomWidth = header.viewAllDesktopCustomWidth ?? 100;
  header.viewAllMobileWidth = header.viewAllMobileWidth ?? 'fit';
  header.viewAllMobileCustomWidth = header.viewAllMobileCustomWidth ?? 100;
  header.layoutAlignment = header.layoutAlignment ?? 'space-between';
  header.viewAllLabel = header.viewAllLabel ?? 'View all';
  header.subtitle = header.subtitle ?? '';
  if (blocks.collection_header) {
    blocks.collection_header.settings = header;
  }

  const card = (blocks.product_card?.settings ?? {}) as Record<string, unknown>;
  card.mediaAspectRatio = card.mediaAspectRatio ?? 'auto';
  card.productTitleWidth = card.productTitleWidth ?? 'fit';
  card.productTitleTypographyPreset = card.productTitleTypographyPreset ?? 'paragraph';
  card.priceTypographyPreset = card.priceTypographyPreset ?? 'heading-6';
  if (blocks.product_card) {
    blocks.product_card.settings = card;
  }
  section.blocks = blocks;
}
