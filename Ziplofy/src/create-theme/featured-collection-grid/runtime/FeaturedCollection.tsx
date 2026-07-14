import { useCallback, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  useStorefront,
  useStorefrontCart,
  useStorefrontProductVariants,
  useThemeConfig,
} from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { combineResponsiveCss, mobileMedia, sectionScopeClass } from '../../runtime/shared/responsive';
import { orderedIds } from '../../runtime/shared/structureOrder';
import { formatThemePrice } from '../../runtime/shared/themePricesRuntime';
import {
  readThemeProductCardsQuickAddFlags,
  resolveThemeProductCardInlineStyle,
} from '../../runtime/shared/themeProductCardsRuntime';
import { FeaturedProductShirtIllustration } from '../../product-highlight/runtime/FeaturedProductArt';
import { readCollectionTitleStyle } from '../../runtime/shared/collectionTitleStyles';
import {
  collectionHeaderResponsiveCss,
  readCollectionHeaderLayout,
} from '../../runtime/shared/collectionHeaderStyles';
import { readViewAllButtonStyle, viewAllButtonAnchorCss, viewAllButtonWrapperCss } from '../../runtime/shared/viewAllButtonStyles';
import { resolveThemeTypographyStyle } from '../../runtime/shared/themeTypographyRuntime';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { richTextHasBlockMarkup } from '../../../utils/theme-editor-rich-text.util';
import { productPath } from '../../../utils/storefront-paths';
import { useFeaturedCollectionProducts } from '../../runtime/shared/useFeaturedCollectionProducts';
import type { SectionRuntimeProps } from '../../runtime/types';

type GridProduct = {
  _id: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrls?: string[];
  urlHandle?: string;
  placeholder?: boolean;
};

function resolveFeaturedProductHref(product: GridProduct): string | null {
  if (product.placeholder) return null;
  const handle = product.urlHandle?.trim();
  if (handle) return productPath(handle);
  // Last resort if API omitted handle (legacy); prefer never linking by bare id in UI when possible.
  const id = product._id?.trim();
  return id ? productPath(id) : null;
}

const PRICE_TYPOGRAPHY_PRESETS: Record<
  string,
  { fontSize: number; fontWeight: number; lineHeight: number }
> = {
  default: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
  'heading-6': { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
  'heading-5': { fontSize: 16, fontWeight: 600, lineHeight: 1.35 },
  'heading-4': { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
};

export function FeaturedCollection({
  sectionId,
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { storeFrontMeta } = useStorefront();
  const storeId = storeFrontMeta?.storeId ?? '';
  const { createCartEntry } = useStorefrontCart();
  const { fetchVariantsByProductId } = useStorefrontProductVariants();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const { fontBody, fontHeading, background, text, muted, primary } = useThemeColors();
  const { maxWidth } = useThemeLayout();

  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const settingsBase = `${sectionBase}.settings`;
  const collectionHandle = cfgString(config, `${settingsBase}.collectionHandle`, '');
  const blocksBase = `${sectionBase}.blocks`;
  const headerBase = `${blocksBase}.collection_header.settings`;
  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const columns = Math.max(1, Math.min(6, cfgNumber(config, `${settingsBase}.columns`, 4)));
  const mobileColumns = Math.max(
    1,
    Math.min(2, Number(cfgString(config, `${settingsBase}.mobileColumns`, '2')) || 2)
  );
  const hGap = Math.max(0, cfgNumber(config, `${settingsBase}.horizontalGap`, 16));
  const vGap = Math.max(0, cfgNumber(config, `${settingsBase}.verticalGap`, 24));
  const limit = Math.max(1, cfgNumber(config, `${settingsBase}.productsToShow`, 8));
  const paddingTop = cfgNumber(config, `${settingsBase}.paddingTop`, 40);
  const paddingBottom = cfgNumber(config, `${settingsBase}.paddingBottom`, 40);
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const sectionGap = Math.max(0, cfgNumber(config, `${settingsBase}.sectionGap`, 48));
  const layoutType = cfgString(config, `${settingsBase}.layoutType`, 'grid');
  const isEditorial = layoutType === 'editorial';
  const isCarousel = layoutType === 'carousel';
  const navIcon = cfgString(config, `${settingsBase}.navIcon`, 'arrows');
  const navIconBackground = cfgString(config, `${settingsBase}.navIconBackground`, 'circle');
  const sectionBackgroundRaw = cfgString(config, `${settingsBase}.backgroundColor`, 'default');
  const sectionBackground =
    sectionBackgroundRaw === 'default' || !sectionBackgroundRaw.trim()
      ? background
      : resolveThemePaletteColorSetting(config, sectionBackgroundRaw, 0, background);
  const trackRef = useRef<HTMLDivElement>(null);

  const title = cfgString(config, `${headerBase}.title`, 'Featured products');
  const titleStyle = useMemo(
    () =>
      readCollectionTitleStyle(config, headerBase, { heading: fontHeading, body: fontBody }, {
        text,
        heading: text,
        accent: primary,
        background,
      }),
    [config, headerBase, fontHeading, fontBody, text, primary, background]
  );
  const viewAllLabel = cfgString(config, `${headerBase}.viewAllLabel`, 'View all');
  const viewAllHref = cfgString(config, `${headerBase}.viewAllHref`, '#');
  const viewAllStyle = useMemo(
    () =>
      readViewAllButtonStyle(config, headerBase, {
        primary,
        background,
        text,
        line: text,
      }),
    [config, headerBase, primary, background, text]
  );
  const headerLayout = useMemo(
    () =>
      readCollectionHeaderLayout(config, headerBase, { background, color: text }, muted),
    [config, headerBase, background, text, muted]
  );
  const emptyMessage = cfgString(config, `${settingsBase}.emptyMessage`, '');
  const showMedia = cfgBool(config, `${blocksBase}.product_card.settings.showMedia`, true);
  const showTitle = cfgBool(config, `${blocksBase}.product_card.settings.showTitle`, true);
  const showPrice = cfgBool(config, `${blocksBase}.product_card.settings.showPrice`, true);

  const blockOrder = orderedIds(config, `${sectionBase}.block_order`, `${blocksBase}`, [
    'collection_header',
    'product_card',
  ]);
  const headerNestedOrder = orderedIds(
    config,
    `${blocksBase}.collection_header.nested_block_order`,
    `${blocksBase}.collection_header.blocks`,
    ['collection_title', 'view_all_button']
  );
  const productNestedOrder = orderedIds(
    config,
    `${blocksBase}.product_card.nested_block_order`,
    `${blocksBase}.product_card.blocks`,
    ['media', 'product_title', 'price']
  );

  const priceStyle = useMemo(() => {
    const base = `${blocksBase}.product_card.settings`;
    const preset = cfgString(config, `${base}.priceTypographyPreset`, 'heading-6');
    const typo = PRICE_TYPOGRAPHY_PRESETS[preset] ?? PRICE_TYPOGRAPHY_PRESETS['heading-6'];
    const widthMode = cfgString(config, `${base}.priceWidth`, 'fill');
    const align = cfgString(config, `${base}.priceAlignment`, 'left');
    const colorKey = cfgString(config, `${base}.priceColor`, '');
    const color =
      colorKey === '' || colorKey === 'default' || colorKey === 'text'
        ? text
        : colorKey === 'heading'
          ? text
          : colorKey === 'accent'
            ? primary
            : colorKey === 'muted'
              ? muted
              : resolveThemePaletteColorSetting(config, colorKey, 1, text);
    const textAlign: CSSProperties['textAlign'] =
      align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
    return {
      width: widthMode === 'fit' ? 'fit-content' : '100%',
      textAlign,
      fontSize: typo.fontSize,
      fontWeight: typo.fontWeight,
      lineHeight: typo.lineHeight,
      color,
      paddingTop: cfgNumber(config, `${base}.pricePaddingTop`, 0),
      paddingBottom: cfgNumber(config, `${base}.pricePaddingBottom`, 0),
      paddingLeft: cfgNumber(config, `${base}.pricePaddingLeft`, 0),
      paddingRight: cfgNumber(config, `${base}.pricePaddingRight`, 0),
      showSaleFirst: cfgBool(config, `${base}.priceShowSaleFirst`, true),
      showInstallments: cfgBool(config, `${base}.priceInstallments`, false),
      showTaxInfo: cfgBool(config, `${base}.priceTaxInfo`, false),
    };
  }, [config, blocksBase, text, primary, muted]);

  const cardColors = useMemo(() => resolveThemeProductCardInlineStyle(config), [config]);

  const productCardBlockStyle = useMemo(() => {
    const base = `${blocksBase}.product_card.settings`;
    const bgKey = cfgString(config, `${base}.backgroundColor`, 'default');
    const background =
      bgKey === '' || bgKey === 'default'
        ? cardColors.background
        : resolveThemePaletteColorSetting(config, bgKey, 0, cardColors.background);
    const borderStyle = cfgString(config, `${base}.borderStyle`, 'none');
    return {
      background,
      color: cardColors.color,
      border: borderStyle === 'solid' ? `1px solid ${muted}` : 'none',
      borderRadius: cfgNumber(config, `${base}.cornerRadius`, 0),
      gap: cfgNumber(config, `${base}.verticalGap`, 4),
      paddingTop: cfgNumber(config, `${base}.paddingTop`, 0),
      paddingBottom: cfgNumber(config, `${base}.paddingBottom`, 0),
      paddingLeft: cfgNumber(config, `${base}.paddingLeft`, 0),
      paddingRight: cfgNumber(config, `${base}.paddingRight`, 0),
    };
  }, [config, blocksBase, cardColors, muted]);

  const productTitleStyle = useMemo(() => {
    const base = `${blocksBase}.product_card.settings`;
    const preset = cfgString(config, `${base}.productTitleTypographyPreset`, 'paragraph');
    const typo = resolveThemeTypographyStyle(config, preset, { fontHeading, fontBody });
    const widthMode = cfgString(config, `${base}.productTitleWidth`, 'fit');
    const colorKey = cfgString(config, `${base}.productTitleColor`, '');
    const color =
      colorKey === '' || colorKey === 'default' || colorKey === 'text'
        ? text
        : resolveThemePaletteColorSetting(config, colorKey, 1, text);
    const bgOn = cfgBool(config, `${base}.productTitleBackgroundEnabled`, false);
    return {
      width: widthMode === 'fit' ? 'fit-content' : '100%',
      maxWidth: '100%',
      margin: 0,
      fontFamily: typo.fontFamily,
      fontSize: typo.fontSize,
      fontWeight: typo.fontWeight,
      fontStyle: typo.fontStyle,
      lineHeight: typo.lineHeight,
      letterSpacing: typo.letterSpacing,
      color,
      background: bgOn ? 'rgba(0,0,0,0.04)' : undefined,
      paddingTop: cfgNumber(config, `${base}.productTitlePaddingTop`, 4),
      paddingBottom: cfgNumber(config, `${base}.productTitlePaddingBottom`, 0),
      paddingLeft: cfgNumber(config, `${base}.productTitlePaddingLeft`, 0),
      paddingRight: cfgNumber(config, `${base}.productTitlePaddingRight`, 0),
      borderRadius: bgOn ? 6 : 0,
      boxSizing: 'border-box' as const,
    };
  }, [config, blocksBase, fontHeading, fontBody, text]);

  const quickAddFlags = useMemo(() => readThemeProductCardsQuickAddFlags(config), [config]);
  const productCardMediaStyle = useMemo(() => {
    const base = `${blocksBase}.product_card.settings`;
    const aspectRaw = cfgString(config, `${base}.mediaAspectRatio`, 'auto');
    const aspectRatio =
      aspectRaw && aspectRaw !== 'auto' ? aspectRaw.replace(':', ' / ') : '1 / 1';
    const borderStyle = cfgString(config, `${base}.mediaBorderStyle`, 'none');
    return {
      aspectRatio,
      border: borderStyle === 'solid' ? `1px solid ${muted}` : 'none',
      borderRadius: cfgNumber(config, `${base}.mediaCornerRadius`, 0),
      paddingTop: cfgNumber(config, `${base}.mediaPaddingTop`, 0),
      paddingBottom: cfgNumber(config, `${base}.mediaPaddingBottom`, 0),
      paddingLeft: cfgNumber(config, `${base}.mediaPaddingLeft`, 0),
      paddingRight: cfgNumber(config, `${base}.mediaPaddingRight`, 0),
    };
  }, [config, blocksBase, muted]);

  const products = useFeaturedCollectionProducts({ collectionHandle, limit });

  const cards: GridProduct[] = useMemo(() => {
    const list = products.slice(0, limit).map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      imageUrls: p.imageUrls,
      urlHandle: p.urlHandle,
    }));
    if (list.length > 0) return list;
    const count = Math.max(columns * 2, 8);
    return Array.from({ length: count }, (_, index) => ({
      _id: `placeholder-${index}`,
      title: 'Product title',
      price: 1999,
      compareAtPrice: null,
      imageUrls: [],
      placeholder: true,
    }));
  }, [products, limit, columns]);

  const handleQuickAdd = useCallback(
    async (event: MouseEvent<HTMLButtonElement>, product: GridProduct) => {
      event.preventDefault();
      event.stopPropagation();
      if (product.placeholder || !storeId || addingProductId) return;
      try {
        setAddingProductId(product._id);
        const variants = await fetchVariantsByProductId(product._id);
        const variant = variants[0];
        if (!variant) return;
        await createCartEntry(
          { storeId, productVariantId: variant._id, quantity: 1 },
          variant
        );
      } finally {
        setAddingProductId(null);
      }
    },
    [addingProductId, createCartEntry, fetchVariantsByProductId, storeId]
  );

  const scopeClass = sectionScopeClass('codiic-featured-collection', sectionId);
  const gridClass = `${scopeClass}-grid`;
  const cardCount = cards.length;

  const responsiveCss = useMemo(() => {
    const headerCss = collectionHeaderResponsiveCss(
      sectionId,
      headerLayout.mobileWidth,
      headerLayout.mobileStack,
      headerLayout.mobileCustomWidth
    );
    const sharedCss = combineResponsiveCss(
      `.${scopeClass} .codiic-fc-quick-add { opacity: 0; transform: translateY(6px); transition: opacity 0.18s ease, transform 0.18s ease; pointer-events: none; }`,
      `.${scopeClass} .codiic-fc-card:hover .codiic-fc-quick-add, .${scopeClass} .codiic-fc-card:focus-within .codiic-fc-quick-add { opacity: 1; transform: translateY(0); pointer-events: auto; }`,
      mobileMedia(
        `.${scopeClass} .codiic-fc-quick-add { opacity: ${quickAddFlags.mobileQuickAdd ? '1' : '0'} !important; transform: none !important; pointer-events: ${quickAddFlags.mobileQuickAdd ? 'auto' : 'none'} !important; }`
      )
    );

    if (isCarousel) {
      // Show a fractional number of cards so the next card always peeks and the
      // track overflows (and can scroll) whenever there is more than one card —
      // even when the product count equals the configured column count.
      const visibleColumns = Math.min(columns + 0.25, Math.max(1.2, cardCount - 0.15));
      const mobileVisible = Math.min(mobileColumns + 0.2, Math.max(1.1, cardCount - 0.1));
      const cardBasis = `calc((100% - ${columns * hGap}px) / ${visibleColumns})`;
      const mobileBasis = `calc((100% - ${mobileColumns * hGap}px) / ${mobileVisible})`;
      const layoutCss = combineResponsiveCss(
        `.${scopeClass} .codiic-fc-carousel { position: relative; }`,
        `.${gridClass} { display: flex; flex-wrap: nowrap; column-gap: ${hGap}px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding-bottom: 8px; scrollbar-width: none; }`,
        `.${gridClass}::-webkit-scrollbar { display: none; }`,
        `.${gridClass} > .codiic-fc-card { flex: 0 0 ${cardBasis}; scroll-snap-align: start; }`,
        `.${scopeClass} .codiic-fc-nav { opacity: 0; transform: translateY(-50%) scale(0.92); transition: opacity 0.18s ease, transform 0.18s ease; pointer-events: none; }`,
        `.${scopeClass} .codiic-fc-carousel:hover .codiic-fc-nav, .${scopeClass} .codiic-fc-carousel:focus-within .codiic-fc-nav { opacity: 1; transform: translateY(-50%) scale(1); pointer-events: auto; }`,
        `.${scopeClass} .codiic-fc-nav:disabled { opacity: 0 !important; pointer-events: none !important; }`,
        mobileMedia(
          `.${gridClass} > .codiic-fc-card { flex-basis: ${mobileBasis} !important; }` +
            `.${scopeClass} .codiic-fc-nav { display: none !important; }`
        )
      );
      return combineResponsiveCss(layoutCss, sharedCss, headerCss);
    }

    if (isEditorial) {
      const layoutCss = combineResponsiveCss(
        `.${gridClass} { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: ${hGap}px; row-gap: ${sectionGap}px; align-items: start; }`,
        `.${gridClass} > .codiic-fc-card:nth-child(4n + 2) { margin-top: 3rem; }`,
        `.${gridClass} > .codiic-fc-card:nth-child(4n + 3) { margin-top: -1.25rem; }`,
        `.${gridClass} > .codiic-fc-card:nth-child(4n + 4) { margin-top: 2.5rem; }`,
        `.${gridClass} > .codiic-fc-card:nth-child(4n + 2) .codiic-fc-media, .${gridClass} > .codiic-fc-card:nth-child(4n + 3) .codiic-fc-media { aspect-ratio: 4 / 5; }`,
        mobileMedia(
          `.${gridClass} { grid-template-columns: 1fr !important; row-gap: ${vGap}px !important; }` +
            `.${gridClass} > .codiic-fc-card { margin-top: 0 !important; }`
        )
      );
      return combineResponsiveCss(layoutCss, sharedCss, headerCss);
    }

    const layoutCss = combineResponsiveCss(
      `.${gridClass} { display: grid; grid-template-columns: repeat(${columns}, minmax(0, 1fr)); column-gap: ${hGap}px; row-gap: ${vGap}px; }`,
      mobileMedia(`.${gridClass} { grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr)) !important; }`)
    );
    return combineResponsiveCss(layoutCss, sharedCss, headerCss);
  }, [
    scopeClass,
    gridClass,
    isEditorial,
    isCarousel,
    cardCount,
    columns,
    mobileColumns,
    hGap,
    vGap,
    sectionGap,
    quickAddFlags.mobileQuickAdd,
    sectionId,
    headerLayout.mobileWidth,
    headerLayout.mobileStack,
    headerLayout.mobileCustomWidth,
  ]);

  const shell: CSSProperties = {
    background: sectionBackground,
    color: text,
    fontFamily: fontBody,
    paddingTop,
    paddingBottom,
    paddingLeft: layout.padX,
    paddingRight: layout.padX,
    boxSizing: 'border-box',
    width: '100%',
  };

  const inner: CSSProperties = {
    maxWidth: sectionWidth === 'full' ? '100%' : maxWidth,
    margin: '0 auto',
    width: '100%',
  };

  const scrollByPage = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: 'smooth' });
  };

  const navButtonStyle = (side: 'prev' | 'next'): CSSProperties => ({
    position: 'absolute',
    top: 'calc((100% - 62px) / 2)',
    [side === 'prev' ? 'left' : 'right']: 12,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    border: 'none',
    cursor: 'pointer',
    background:
      navIconBackground === 'none' ? 'transparent' : 'rgba(17, 24, 39, 0.92)',
    color: navIconBackground === 'none' ? text : '#ffffff',
    borderRadius: navIconBackground === 'square' ? 8 : '50%',
    boxShadow: navIconBackground === 'none' ? 'none' : '0 2px 10px rgba(0,0,0,0.25)',
    fontSize: navIcon === 'chevron' ? 22 : 18,
    lineHeight: 1,
  });

  const navGlyph = (side: 'prev' | 'next'): string =>
    navIcon === 'chevron'
      ? side === 'prev'
        ? '\u2039'
        : '\u203A'
      : side === 'prev'
        ? '\u2190'
        : '\u2192';

  const renderNavButton = (side: 'prev' | 'next'): ReactNode => (
    <button
      type="button"
      className="codiic-fc-nav"
      aria-label={side === 'prev' ? 'Previous products' : 'Next products'}
      onClick={() => scrollByPage(side === 'prev' ? -1 : 1)}
      style={navButtonStyle(side)}
    >
      {navGlyph(side)}
    </button>
  );

  const renderHeaderNested = (nestedId: string): ReactNode => {
    if (nestedId === 'collection_title') {
      const titleTag = richTextHasBlockMarkup(title) ? 'div' : 'h2';
      return (
        <EditorBlock
          key={nestedId}
          nodeId={`${editorNodeId}:block:collection_header:nested:collection_title`}
          label="Collection title"
          style={{
            flex: titleStyle.flex,
            minWidth: titleStyle.flex ? 0 : undefined,
          }}
        >
          <EditorField
            fieldPath={`${headerBase}.title`}
            label="Text"
            as={titleTag}
            style={{
              margin: 0,
              width: titleStyle.width,
              maxWidth: titleStyle.maxWidth,
              textAlign: titleStyle.textAlign,
              color: titleStyle.color,
              background: titleStyle.background,
              paddingTop: titleStyle.paddingTop,
              paddingBottom: titleStyle.paddingBottom,
              paddingLeft: titleStyle.paddingLeft,
              paddingRight: titleStyle.paddingRight,
              borderRadius: titleStyle.borderRadius,
              boxSizing: 'border-box',
            }}
          >
            <ThemeEditorRichTextContent
              html={title}
              style={{
                fontFamily: titleStyle.fontFamily,
                fontSize: titleStyle.fontSize,
                fontWeight: titleStyle.fontWeight,
                lineHeight: titleStyle.lineHeight,
                color: titleStyle.color,
                ...(titleStyle.fontStyle ? { fontStyle: titleStyle.fontStyle } : {}),
                ...(titleStyle.letterSpacing ? { letterSpacing: titleStyle.letterSpacing } : {}),
                ...(titleStyle.textTransform ? { textTransform: titleStyle.textTransform } : {}),
                ...(titleStyle.textWrap
                  ? { textWrap: titleStyle.textWrap as CSSProperties['textWrap'] }
                  : {}),
              }}
            />
          </EditorField>
        </EditorBlock>
      );
    }
    if (nestedId === 'view_all_button') {
      return (
        <EditorBlock
          key={nestedId}
          nodeId={`${editorNodeId}:block:collection_header:nested:view_all_button`}
          label="View all button"
          style={viewAllButtonWrapperCss(viewAllStyle)}
        >
          <EditorField fieldPath={`${headerBase}.viewAllLabel`} label="Label" as="span">
            <a
              href={viewAllHref}
              target={viewAllStyle.openInNewTab ? '_blank' : undefined}
              rel={viewAllStyle.openInNewTab ? 'noopener noreferrer' : undefined}
              style={viewAllButtonAnchorCss(viewAllStyle)}
            >
              {viewAllLabel}
            </a>
          </EditorField>
        </EditorBlock>
      );
    }
    return null;
  };

  const headerBlock = (
    <EditorBlock
      key="collection_header"
      nodeId={`${editorNodeId}:block:collection_header`}
      label="Header"
    >
      <div
        style={
          headerLayout.referenceMinHeight
            ? { minHeight: headerLayout.referenceMinHeight, width: '100%' }
            : undefined
        }
      >
        <div data-fc-collection-header style={headerLayout.style}>
          {headerNestedOrder.map(renderHeaderNested)}
        </div>
      </div>
    </EditorBlock>
  );

  const renderCardNested = (product: GridProduct, nestedId: string, productHref: string | null): ReactNode => {
    if (nestedId === 'media') {
      if (!showMedia) return null;
      const image = product.imageUrls?.[0];
      const media = (
        <div
          className="codiic-fc-media"
          style={{
            width: '100%',
            overflow: 'hidden',
            aspectRatio: productCardMediaStyle.aspectRatio,
            borderRadius: productCardMediaStyle.borderRadius,
            border: productCardMediaStyle.border,
            boxSizing: 'border-box',
            background: image ? `center / cover no-repeat url(${image})` : '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {image ? null : <FeaturedProductShirtIllustration />}
        </div>
      );
      const canQuickAdd =
        quickAddFlags.quickAdd && !product.placeholder && Boolean(storeId);
      return (
        <EditorBlock
          key={nestedId}
          nodeId={`${editorNodeId}:block:product_card:nested:media`}
          label="Media"
          style={{
            position: 'relative',
            paddingTop: productCardMediaStyle.paddingTop || undefined,
            paddingBottom: productCardMediaStyle.paddingBottom || undefined,
            paddingLeft: productCardMediaStyle.paddingLeft || undefined,
            paddingRight: productCardMediaStyle.paddingRight || undefined,
            boxSizing: 'border-box',
          }}
        >
          {productHref ? (
            <Link
              to={productHref}
              data-codiic-allow-interaction=""
              style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
            >
              {media}
            </Link>
          ) : (
            media
          )}
          {quickAddFlags.quickAdd ? (
            <button
              type="button"
              className="codiic-fc-quick-add"
              data-codiic-allow-interaction=""
              disabled={!canQuickAdd || addingProductId === product._id}
              onClick={(e) => void handleQuickAdd(e, product)}
              style={{
                position: 'absolute',
                left: 10,
                right: 10,
                bottom: 10,
                zIndex: 2,
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                background: cardColors.color,
                color: cardColors.background,
                fontFamily: fontBody,
                fontSize: 13,
                fontWeight: 600,
                cursor: canQuickAdd ? 'pointer' : 'default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                opacity: addingProductId === product._id ? 0.7 : undefined,
              }}
            >
              {addingProductId === product._id ? 'Adding…' : 'Add to cart'}
            </button>
          ) : null}
        </EditorBlock>
      );
    }
    if (nestedId === 'product_title') {
      if (!showTitle) return null;
      const titleNode = <h3 style={productTitleStyle}>{product.title}</h3>;
      return (
        <EditorBlock
          key={nestedId}
          nodeId={`${editorNodeId}:block:product_card:nested:product_title`}
          label="Product title"
        >
          {productHref ? (
            <Link
              to={productHref}
              data-codiic-allow-interaction=""
              style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
            >
              {titleNode}
            </Link>
          ) : (
            titleNode
          )}
        </EditorBlock>
      );
    }
    if (nestedId === 'price') {
      if (!showPrice) return null;
      const onSale = !!(product.compareAtPrice && product.compareAtPrice > product.price);
      const currentLabel = formatThemePrice(config, product.price, 'productCards');
      const compareRaw = onSale
        ? formatThemePrice(config, product.compareAtPrice as number, 'productCards')
        : '';
      const primaryLabel = onSale && !priceStyle.showSaleFirst ? compareRaw : currentLabel;
      const strikeLabel = onSale
        ? priceStyle.showSaleFirst
          ? compareRaw
          : currentLabel
        : '';
      const priceBody = (
        <div
          style={{
            width: priceStyle.width,
            textAlign: priceStyle.textAlign,
            paddingTop: 4 + priceStyle.paddingTop,
            paddingBottom: 12 + priceStyle.paddingBottom,
            paddingLeft: 4 + priceStyle.paddingLeft,
            paddingRight: 4 + priceStyle.paddingRight,
            boxSizing: 'border-box',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: fontBody,
              fontSize: priceStyle.fontSize,
              fontWeight: priceStyle.fontWeight,
              lineHeight: priceStyle.lineHeight,
              color: priceStyle.color,
            }}
          >
            <span>{primaryLabel}</span>
            {strikeLabel ? (
              <span
                style={{
                  marginLeft: 8,
                  fontWeight: 400,
                  color: muted,
                  textDecoration: 'line-through',
                }}
              >
                {strikeLabel}
              </span>
            ) : null}
          </p>
          {priceStyle.showInstallments ? (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: muted }}>Pay in installments</p>
          ) : null}
          {priceStyle.showTaxInfo ? (
            <p style={{ margin: '2px 0 0', fontSize: 11, color: muted }}>Tax included</p>
          ) : null}
        </div>
      );
      return (
        <EditorBlock
          key={nestedId}
          nodeId={`${editorNodeId}:block:product_card:nested:price`}
          label="Price"
        >
          {productHref ? (
            <Link
              to={productHref}
              data-codiic-allow-interaction=""
              style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
            >
              {priceBody}
            </Link>
          ) : (
            priceBody
          )}
        </EditorBlock>
      );
    }
    return null;
  };

  const renderProductCard = (product: GridProduct) => {
    const productHref = resolveFeaturedProductHref(product);
    return (
      <article
        key={product._id}
        className="codiic-fc-card"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          gap: productCardBlockStyle.gap,
          border: productCardBlockStyle.border,
          borderRadius: productCardBlockStyle.borderRadius,
          background: productCardBlockStyle.background,
          color: productCardBlockStyle.color,
          paddingTop: productCardBlockStyle.paddingTop,
          paddingBottom: productCardBlockStyle.paddingBottom,
          paddingLeft: productCardBlockStyle.paddingLeft,
          paddingRight: productCardBlockStyle.paddingRight,
          boxSizing: 'border-box',
        }}
      >
        {productNestedOrder.map((nestedId) => renderCardNested(product, nestedId, productHref))}
      </article>
    );
  };

  const productCardBlock = (
    <EditorBlock
      key="product_card"
      nodeId={`${editorNodeId}:block:product_card`}
      label="Product card"
    >
      {cards.length === 0 ? (
        <p style={{ color: muted, fontSize: 14 }}>{emptyMessage}</p>
      ) : isCarousel ? (
        <div className="codiic-fc-carousel">
          <div className={gridClass} ref={trackRef}>
            {cards.map((product) => renderProductCard(product))}
          </div>
          {navIcon !== 'none' && cards.length > 1 ? (
            <>
              {renderNavButton('prev')}
              {renderNavButton('next')}
            </>
          ) : null}
        </div>
      ) : (
        <div className={gridClass}>
          {cards.map((product) => renderProductCard(product))}
        </div>
      )}
    </EditorBlock>
  );

  const blockNodes: Record<string, ReactNode> = {
    collection_header: headerBlock,
    product_card: productCardBlock,
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label={
        isCarousel
          ? 'Featured collection: Carousel'
          : isEditorial
            ? 'Featured collection: Editorial'
            : 'Featured collection: Grid'
      }
      editorNodeId={editorNodeId}
      className={scopeClass}
      style={shell}
    >
      <style>{responsiveCss}</style>
      <div style={inner}>
        {blockOrder.map((blockId) => {
          const node = blockNodes[blockId];
          return node ? <div key={blockId}>{node}</div> : null;
        })}
      </div>
    </EditorSection>
  );
}
