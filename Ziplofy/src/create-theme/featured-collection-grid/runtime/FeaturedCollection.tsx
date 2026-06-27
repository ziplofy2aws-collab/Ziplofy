import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { useStorefront, useStorefrontProducts, useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { combineResponsiveCss, mobileMedia, sectionScopeClass } from '../../runtime/shared/responsive';
import { orderedIds } from '../../runtime/shared/structureOrder';
import { formatThemePrice } from '../../runtime/shared/themePricesRuntime';
import {
  readThemeProductCardsQuickAddFlags,
  resolveThemeProductCardInlineStyle,
} from '../../runtime/shared/themeProductCardsRuntime';
import { resolveThemeProductMediaBorderCss } from '../../runtime/shared/themeProductMediaRuntime';
import { readThemeProductMediaSettings } from '../../settings/theme-product-media.settings';
import { FeaturedProductShirtIllustration } from '../../product-highlight/runtime/FeaturedProductArt';
import type { SectionRuntimeProps } from '../../runtime/types';

type GridProduct = {
  _id: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrls?: string[];
  placeholder?: boolean;
};

export function FeaturedCollection({
  sectionId,
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading, background, text, muted, primary } = useThemeColors();
  const { maxWidth } = useThemeLayout();
  const { storeFrontMeta } = useStorefront();
  const { products, fetchProductsByStoreId } = useStorefrontProducts();

  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const settingsBase = `${sectionBase}.settings`;
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
  const trackRef = useRef<HTMLDivElement>(null);

  const title = cfgString(config, `${headerBase}.title`, 'Featured products');
  const viewAllLabel = cfgString(config, `${headerBase}.viewAllLabel`, 'View all');
  const viewAllHref = cfgString(config, `${headerBase}.viewAllHref`, '#');
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

  const cardColors = useMemo(() => resolveThemeProductCardInlineStyle(config), [config]);
  const quickAddFlags = useMemo(() => readThemeProductCardsQuickAddFlags(config), [config]);
  const mediaBorder = useMemo(() => {
    const media = readThemeProductMediaSettings(config);
    return {
      border: resolveThemeProductMediaBorderCss(config, media),
      radius: media.cornerRadius,
    };
  }, [config]);

  const storeId = storeFrontMeta?.storeId ?? '';
  useEffect(() => {
    if (!storeId) return;
    void fetchProductsByStoreId({ storeId, page: 1, limit });
  }, [storeId, limit, fetchProductsByStoreId]);

  const cards: GridProduct[] = useMemo(() => {
    const list = (products as GridProduct[]).slice(0, limit);
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

  const scopeClass = sectionScopeClass('ziplofy-featured-collection', sectionId);
  const gridClass = `${scopeClass}-grid`;
  const cardCount = cards.length;

  const responsiveCss = useMemo(() => {
    const sharedCss = combineResponsiveCss(
      `.${scopeClass} .ziplofy-fc-media { aspect-ratio: 1 / 1; }`,
      `.${scopeClass} .ziplofy-fc-quick-add { opacity: 0; transform: translateY(6px); transition: opacity 0.18s ease, transform 0.18s ease; pointer-events: none; }`,
      `.${scopeClass} .ziplofy-fc-card:hover .ziplofy-fc-quick-add, .${scopeClass} .ziplofy-fc-card:focus-within .ziplofy-fc-quick-add { opacity: 1; transform: translateY(0); pointer-events: auto; }`,
      mobileMedia(
        `.${scopeClass} .ziplofy-fc-quick-add { opacity: ${quickAddFlags.mobileQuickAdd ? '1' : '0'} !important; transform: none !important; pointer-events: ${quickAddFlags.mobileQuickAdd ? 'auto' : 'none'} !important; }`
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
        `.${scopeClass} .ziplofy-fc-carousel { position: relative; }`,
        `.${gridClass} { display: flex; flex-wrap: nowrap; column-gap: ${hGap}px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding-bottom: 8px; scrollbar-width: none; }`,
        `.${gridClass}::-webkit-scrollbar { display: none; }`,
        `.${gridClass} > .ziplofy-fc-card { flex: 0 0 ${cardBasis}; scroll-snap-align: start; }`,
        `.${scopeClass} .ziplofy-fc-nav { opacity: 0; transform: translateY(-50%) scale(0.92); transition: opacity 0.18s ease, transform 0.18s ease; pointer-events: none; }`,
        `.${scopeClass} .ziplofy-fc-carousel:hover .ziplofy-fc-nav, .${scopeClass} .ziplofy-fc-carousel:focus-within .ziplofy-fc-nav { opacity: 1; transform: translateY(-50%) scale(1); pointer-events: auto; }`,
        `.${scopeClass} .ziplofy-fc-nav:disabled { opacity: 0 !important; pointer-events: none !important; }`,
        mobileMedia(
          `.${gridClass} > .ziplofy-fc-card { flex-basis: ${mobileBasis} !important; }` +
            `.${scopeClass} .ziplofy-fc-nav { display: none !important; }`
        )
      );
      return combineResponsiveCss(layoutCss, sharedCss);
    }

    if (isEditorial) {
      const layoutCss = combineResponsiveCss(
        `.${gridClass} { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: ${hGap}px; row-gap: ${sectionGap}px; align-items: start; }`,
        `.${gridClass} > .ziplofy-fc-card:nth-child(4n + 2) { margin-top: 3rem; }`,
        `.${gridClass} > .ziplofy-fc-card:nth-child(4n + 3) { margin-top: -1.25rem; }`,
        `.${gridClass} > .ziplofy-fc-card:nth-child(4n + 4) { margin-top: 2.5rem; }`,
        `.${gridClass} > .ziplofy-fc-card:nth-child(4n + 2) .ziplofy-fc-media, .${gridClass} > .ziplofy-fc-card:nth-child(4n + 3) .ziplofy-fc-media { aspect-ratio: 4 / 5; }`,
        mobileMedia(
          `.${gridClass} { grid-template-columns: 1fr !important; row-gap: ${vGap}px !important; }` +
            `.${gridClass} > .ziplofy-fc-card { margin-top: 0 !important; }`
        )
      );
      return combineResponsiveCss(layoutCss, sharedCss);
    }

    const layoutCss = combineResponsiveCss(
      `.${gridClass} { display: grid; grid-template-columns: repeat(${columns}, minmax(0, 1fr)); column-gap: ${hGap}px; row-gap: ${vGap}px; }`,
      mobileMedia(`.${gridClass} { grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr)) !important; }`)
    );
    return combineResponsiveCss(layoutCss, sharedCss);
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
  ]);

  const shell: CSSProperties = {
    background,
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
      className="ziplofy-fc-nav"
      aria-label={side === 'prev' ? 'Previous products' : 'Next products'}
      onClick={() => scrollByPage(side === 'prev' ? -1 : 1)}
      style={navButtonStyle(side)}
    >
      {navGlyph(side)}
    </button>
  );

  const renderHeaderNested = (nestedId: string): ReactNode => {
    if (nestedId === 'collection_title') {
      return (
        <EditorBlock
          key={nestedId}
          nodeId={`${editorNodeId}:block:collection_header:nested:collection_title`}
          label="Collection title"
        >
          <EditorField
            fieldPath={`${headerBase}.title`}
            label="Text"
            as="h2"
            style={{
              margin: 0,
              fontFamily: fontHeading,
              fontSize: 30,
              fontWeight: 600,
              lineHeight: 1.2,
              color: text,
            }}
          >
            {title}
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
        >
          <EditorField fieldPath={`${headerBase}.viewAllLabel`} label="Label" as="span">
            <a
              href={viewAllHref}
              style={{
                color: primary,
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: 14,
                whiteSpace: 'nowrap',
              }}
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
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {headerNestedOrder.map(renderHeaderNested)}
    </EditorBlock>
  );

  const renderCardNested = (product: GridProduct, nestedId: string): ReactNode => {
    if (nestedId === 'media') {
      if (!showMedia) return null;
      const image = product.imageUrls?.[0];
      return (
        <EditorBlock
          key={nestedId}
          nodeId={`${editorNodeId}:block:product_card:nested:media`}
          label="Media"
          style={{ position: 'relative' }}
        >
          <div
            className="ziplofy-fc-media"
            style={{
              width: '100%',
              overflow: 'hidden',
              borderRadius: mediaBorder.radius,
              border: mediaBorder.border,
              boxSizing: 'border-box',
              background: image ? `center / cover no-repeat url(${image})` : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {image ? null : <FeaturedProductShirtIllustration />}
          </div>
          {quickAddFlags.quickAdd ? (
            <button
              type="button"
              className="ziplofy-fc-quick-add"
              style={{
                position: 'absolute',
                left: 10,
                right: 10,
                bottom: 10,
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                background: cardColors.color,
                color: cardColors.background,
                fontFamily: fontBody,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              Add to cart
            </button>
          ) : null}
        </EditorBlock>
      );
    }
    if (nestedId === 'product_title') {
      if (!showTitle) return null;
      return (
        <EditorBlock
          key={nestedId}
          nodeId={`${editorNodeId}:block:product_card:nested:product_title`}
          label="Product title"
        >
          <h3
            style={{
              margin: 0,
              padding: '12px 4px 0',
              fontFamily: fontHeading,
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.3,
              color: cardColors.color,
            }}
          >
            {product.title}
          </h3>
        </EditorBlock>
      );
    }
    if (nestedId === 'price') {
      if (!showPrice) return null;
      const priceLabel = formatThemePrice(config, product.price, 'productCards');
      const compareLabel =
        product.compareAtPrice && product.compareAtPrice > product.price
          ? formatThemePrice(config, product.compareAtPrice, 'productCards')
          : '';
      return (
        <EditorBlock
          key={nestedId}
          nodeId={`${editorNodeId}:block:product_card:nested:price`}
          label="Price"
        >
          <p
            style={{
              margin: 0,
              padding: '4px 4px 12px',
              fontFamily: fontBody,
              fontSize: 13,
              color: cardColors.color,
            }}
          >
            <span>{priceLabel}</span>
            {compareLabel ? (
              <span style={{ marginLeft: 8, color: muted, textDecoration: 'line-through' }}>
                {compareLabel}
              </span>
            ) : null}
          </p>
        </EditorBlock>
      );
    }
    return null;
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
        <div className="ziplofy-fc-carousel">
          <div className={gridClass} ref={trackRef}>
            {cards.map((product) => (
              <article
                key={product._id}
                className="ziplofy-fc-card"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 8,
                  background: cardColors.background,
                  color: cardColors.color,
                  boxSizing: 'border-box',
                }}
              >
                {productNestedOrder.map((nestedId) => renderCardNested(product, nestedId))}
              </article>
            ))}
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
          {cards.map((product) => (
            <article
              key={product._id}
              className="ziplofy-fc-card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 8,
                background: cardColors.background,
                color: cardColors.color,
                boxSizing: 'border-box',
              }}
            >
              {productNestedOrder.map((nestedId) => renderCardNested(product, nestedId))}
            </article>
          ))}
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
