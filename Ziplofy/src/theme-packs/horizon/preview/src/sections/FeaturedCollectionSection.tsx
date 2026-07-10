import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  formatINR,
  useStorefront,
  useStorefrontProducts,
} from '@render-store/sdk';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../lib/config';
import {
  collectionHeaderResponsiveCss,
  readCollectionHeaderLayout,
} from '../lib/collectionHeaderStyles';
import { readCollectionTitleStyle } from '../lib/collectionTitleStyles';
import { readProductCardMediaStyle } from '../lib/productCardMediaStyles';
import { readProductCardStyle } from '../lib/productCardStyles';
import { formatProductCardPrice, readProductCardPriceStyle } from '../lib/productCardPriceStyles';
import { readProductCardTitleStyle } from '../lib/productCardTitleStyles';
import {
  featuredCollectionColorScheme,
  featuredCollectionGaps,
  featuredCollectionPadding,
  featuredCollectionSectionWidth,
  scopedFeaturedCollectionCss,
} from '../lib/featuredCollectionStyles';
import { orderedIds, templateBlockOrder } from '../lib/structureOrder';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function NavButton({
  label,
  onClick,
  background,
  shape,
}: {
  label: string;
  onClick: () => void;
  background: 'none' | 'circle' | 'square';
  shape: 'arrows' | 'chevron';
}) {
  const btnStyle: CSSProperties = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: background === 'none' ? 32 : 36,
    height: background === 'none' ? 32 : 36,
    border: 'none',
    cursor: 'pointer',
    background:
      background === 'circle' || background === 'square' ? 'rgba(255,255,255,0.95)' : 'transparent',
    borderRadius: background === 'circle' ? '50%' : background === 'square' ? 6 : 0,
    boxShadow: background !== 'none' ? '0 1px 4px rgba(0,0,0,0.12)' : undefined,
    color: '#111827',
    fontSize: shape === 'chevron' ? 18 : 20,
    lineHeight: 1,
  };

  return (
    <button type="button" aria-label={label} onClick={onClick} style={btnStyle}>
      {shape === 'chevron' ? (label === 'Previous' ? '‹' : '›') : label === 'Previous' ? '←' : '→'}
    </button>
  );
}

export function FeaturedCollectionSection({
  sectionId = 'featured_collection',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const trackRef = useRef<HTMLDivElement>(null);

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;
  const blocksBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks`
      : `sections.${sectionId}.blocks`;
  const headerBase = `${blocksBase}.collection_header.settings`;
  const productCardBase = `${blocksBase}.product_card.settings`;
  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;
  const themeColors = useThemeColors();
  const { text, background, primary, fontHeading, fontBody } = themeColors;
  const { storeFrontMeta } = useStorefront();
  const { products, fetchProductsByStoreId } = useStorefrontProducts();

  const state = useMemo(() => {
    const scheme = featuredCollectionColorScheme(config, settingsBase, {
      background,
      color: text,
      muted: '#6b7280',
    });
    const gaps = featuredCollectionGaps(config, settingsBase);
    const { paddingTop, paddingBottom } = featuredCollectionPadding(config, settingsBase);
    const navIconRaw = cfgString(config, `${settingsBase}.navIcon`, 'arrows');
    const navBgRaw = cfgString(config, `${settingsBase}.navIconBackground`, 'circle');
    return {
      scheme,
      gaps,
      paddingTop,
      paddingBottom,
      widthMode: featuredCollectionSectionWidth(config, settingsBase),
      layoutType: cfgString(config, `${settingsBase}.layoutType`, 'grid'),
      carouselOnMobile: cfgBool(config, `${settingsBase}.carouselOnMobile`, false),
      columns: Math.max(1, Math.min(6, cfgNumber(config, `${settingsBase}.columns`, 4))),
      mobileColumns: Math.max(
        1,
        Math.min(2, Number(cfgString(config, `${settingsBase}.mobileColumns`, '2')) || 2)
      ),
      limit: Math.max(1, cfgNumber(config, `${settingsBase}.productsToShow`, 8)),
      customCss: cfgString(config, `${settingsBase}.customCss`, ''),
      emptyMessage: cfgString(config, `${settingsBase}.emptyMessage`),
      subtitle: cfgString(config, `${settingsBase}.subtitle`, ''),
      title: cfgString(config, `${blocksBase}.collection_header.settings.title`),
      viewAllLabel: cfgString(config, `${blocksBase}.collection_header.settings.viewAllLabel`, ''),
      viewAllHref: cfgString(config, `${blocksBase}.collection_header.settings.viewAllHref`),
      showMedia: cfgBool(config, `${blocksBase}.product_card.settings.showMedia`, true),
      showTitle: cfgBool(config, `${blocksBase}.product_card.settings.showTitle`, true),
      showPrice: cfgBool(config, `${blocksBase}.product_card.settings.showPrice`, true),
      navIcon:
        navIconRaw === 'none' || navIconRaw === 'chevron' || navIconRaw === 'arrows'
          ? navIconRaw
          : 'arrows',
      navIconBackground:
        navBgRaw === 'none' || navBgRaw === 'circle' || navBgRaw === 'square' ? navBgRaw : 'circle',
    };
  }, [config, background, text, settingsBase, blocksBase]);

  const {
    scheme,
    gaps,
    paddingTop,
    paddingBottom,
    widthMode,
    layoutType,
    carouselOnMobile,
    columns,
    mobileColumns,
    limit,
    customCss,
    emptyMessage,
    subtitle,
    title,
    viewAllLabel,
    viewAllHref,
    showMedia,
    showTitle,
    showPrice,
    navIcon,
    navIconBackground,
  } = state;

  const { color, background: sectionBg } = scheme;
  const isCarousel = layoutType === 'carousel';
  const isEditorial = layoutType === 'editorial';
  const isGrid = layoutType === 'grid' && !isCarousel && !isEditorial;
  const compactFourCol = columns >= 4;
  const compactScale = compactFourCol ? 0.78 : columns === 3 ? 0.9 : 1;
  const contentPadding = compactFourCol ? 8 : 12;
  const scopedCss = scopedFeaturedCollectionCss(sectionId, customCss);
  const layoutCss = useMemo(
    () => `
[data-ziplofy-section="${sectionId}"] .fc-product-grid {
  display: flex;
  ${isCarousel ? 'flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;' : 'flex-wrap: wrap;'}
  column-gap: ${gaps.horizontal}px;
  row-gap: ${gaps.vertical}px;
}
[data-ziplofy-section="${sectionId}"] .fc-product-grid::-webkit-scrollbar { display: none; }
[data-ziplofy-section="${sectionId}"] .fc-product-grid > article {
  ${
    isCarousel
      ? `flex: 0 0 calc((100% - ${(columns - 1) * gaps.horizontal}px) / ${columns}); min-width: 0; max-width: calc((100% - ${(columns - 1) * gaps.horizontal}px) / ${columns}); scroll-snap-align: start;`
      : compactFourCol
        ? `flex: 0 0 min(calc((100% - ${(columns - 1) * gaps.horizontal}px) / ${columns}), 210px); max-width: min(calc((100% - ${(columns - 1) * gaps.horizontal}px) / ${columns}), 210px); min-width: 168px;`
        : `flex: 0 0 calc((100% - ${(columns - 1) * gaps.horizontal}px) / ${columns}); max-width: calc((100% - ${(columns - 1) * gaps.horizontal}px) / ${columns}); min-width: 220px;`
  }
}
[data-ziplofy-section="${sectionId}"] .fc-editorial-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: ${gaps.horizontal}px;
  row-gap: ${gaps.section}px;
  align-items: start;
}
[data-ziplofy-section="${sectionId}"] .fc-editorial-grid > article:nth-child(2) {
  margin-top: 3rem;
}
[data-ziplofy-section="${sectionId}"] .fc-editorial-grid > article:nth-child(3) {
  margin-top: -1.25rem;
}
[data-ziplofy-section="${sectionId}"] .fc-editorial-grid > article:nth-child(4) {
  margin-top: 2.5rem;
}
[data-ziplofy-section="${sectionId}"] .fc-editorial-grid > article:nth-child(2) .fc-media-inner,
[data-ziplofy-section="${sectionId}"] .fc-editorial-grid > article:nth-child(3) .fc-media-inner {
  aspect-ratio: 4 / 5;
  min-height: 200px;
}
@media (max-width: 749px) {
  [data-ziplofy-section="${sectionId}"] .fc-product-grid {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  [data-ziplofy-section="${sectionId}"][data-mobile-columns="1"] .fc-product-grid > article { flex: 0 0 calc(92% - 8px); max-width: calc(92% - 8px); scroll-snap-align: start; }
  [data-ziplofy-section="${sectionId}"][data-mobile-columns="2"] .fc-product-grid > article { flex: 0 0 calc(50% - ${gaps.horizontal / 2}px); max-width: calc(50% - ${gaps.horizontal / 2}px); scroll-snap-align: start; }
  [data-ziplofy-section="${sectionId}"][data-fc-mobile-carousel="true"] .fc-editorial-grid {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  [data-ziplofy-section="${sectionId}"][data-fc-mobile-carousel="true"] .fc-editorial-grid > article {
    flex: 0 0 min(85%, 320px);
    margin-top: 0 !important;
    scroll-snap-align: start;
  }
  [data-ziplofy-section="${sectionId}"][data-fc-mobile-carousel="true"] .fc-editorial-grid > article .fc-media-inner {
    aspect-ratio: 4 / 3;
    min-height: 140px;
  }
}
`,
    [
      isCarousel,
      isEditorial,
      compactFourCol,
      sectionId,
      columns,
      mobileColumns,
      carouselOnMobile,
      gaps.horizontal,
      gaps.vertical,
      gaps.section,
    ]
  );

  const scrollByPage = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!storeFrontMeta?.storeId) return;
    void fetchProductsByStoreId({ storeId: storeFrontMeta.storeId, page: 1, limit });
  }, [fetchProductsByStoreId, limit, storeFrontMeta?.storeId]);

  const list = products.slice(0, limit);
  const showNav = isCarousel && navIcon !== 'none' && list.length > columns;
  const innerMaxWidth = widthMode === 'full' ? '100%' : layout.maxWidth;
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

  const headerLayout = useMemo(
    () => readCollectionHeaderLayout(config, headerBase, scheme, layout.line),
    [config, scheme, headerBase]
  );
  const headerResponsiveCss = useMemo(() => {
    const mobileWidth = cfgString(config, `${headerBase}.mobileWidth`, 'fill');
    const verticalOnMobile = cfgBool(config, `${headerBase}.verticalOnMobile`, false);
    return collectionHeaderResponsiveCss(sectionId, mobileWidth, verticalOnMobile);
  }, [config, headerBase, sectionId]);

  const titleStyle = useMemo(
    () =>
      readCollectionTitleStyle(
        config,
        headerBase,
        { heading: fontHeading, body: fontBody },
        { text: color, heading: color, accent: primary, background: sectionBg }
      ),
    [config, fontHeading, fontBody, color, primary, sectionBg]
  );
  const productCardStyle = useMemo(
    () => readProductCardStyle(config, productCardBase, scheme, layout.line),
    [config, scheme]
  );

  const productCardMediaStyle = useMemo(
    () => readProductCardMediaStyle(config, productCardBase, layout.line),
    [config]
  );

  const productCardTitleStyle = useMemo(
    () => readProductCardTitleStyle(config, productCardBase, fontHeading, color),
    [config, fontHeading, color]
  );

  const productCardPriceStyle = useMemo(
    () =>
      readProductCardPriceStyle(config, productCardBase, fontBody, {
        text: color,
        heading: color,
        accent: primary,
        muted: scheme.muted,
      }),
    [config, fontBody, color, primary, scheme.muted]
  );
  const blockOrder = templateBlockOrder(config, templateId, sectionId, [
    'collection_header',
    'product_card',
  ]);

  const headerBlock = (
    <EditorBlock
      nodeId={`${editorNodeId}:block:collection_header`}
      label="Header"
    >
      <div
        data-fc-collection-header
        style={{
          display: 'flex',
          flexDirection: headerLayout.flexDirection,
          flexWrap: headerLayout.flexWrap,
          justifyContent: headerLayout.justifyContent,
          alignItems: headerLayout.alignItems,
          gap: headerLayout.gap,
          width: headerLayout.width,
          minHeight: headerLayout.minHeight,
          marginBottom: gaps.section,
          paddingTop: headerLayout.paddingTop,
          paddingBottom: headerLayout.paddingBottom,
          paddingLeft: headerLayout.paddingLeft,
          paddingRight: headerLayout.paddingRight,
          borderRadius: headerLayout.borderRadius,
          border: headerLayout.border,
          background: headerLayout.background,
          backgroundImage: headerLayout.backgroundImage,
          backgroundSize: headerLayout.backgroundImage ? 'cover' : undefined,
          backgroundPosition: headerLayout.backgroundImage ? 'center' : undefined,
          color: headerLayout.color,
          boxSizing: 'border-box',
        }}
      >
      {headerNestedOrder.map((nestedId) => {
        if (nestedId === 'collection_title') {
          return (
            <EditorBlock
              key={nestedId}
              nodeId={`${editorNodeId}:block:collection_header:nested:collection_title`}
              label="Collection title"
            >
              <EditorField
                fieldPath={`${blocksBase}.collection_header.settings.title`}
                nodeId={editorNodeId}
                label="Text"
                as="h2"
                style={{
                  margin: 0,
                  width: titleStyle.width,
                  maxWidth: titleStyle.maxWidth,
                  fontFamily: titleStyle.fontFamily,
                  fontSize: titleStyle.fontSize,
                  fontWeight: titleStyle.fontWeight,
                  lineHeight: titleStyle.lineHeight,
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
                {title}
              </EditorField>
            </EditorBlock>
          );
        }
        if (nestedId === 'view_all_button' && viewAllLabel.trim()) {
          return (
            <EditorBlock
              key={nestedId}
              nodeId={`${editorNodeId}:block:collection_header:nested:view_all_button`}
              label="View all button"
            >
              <EditorField
                fieldPath={`${blocksBase}.collection_header.settings.viewAllLabel`}
                nodeId={editorNodeId}
                label="Label"
              >
                <Link
                  to={viewAllHref}
                  style={{ color: themeColors.primary, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}
                >
                  {viewAllLabel}
                </Link>
              </EditorField>
            </EditorBlock>
          );
        }
        return null;
      })}
      {subtitle ? <p style={{ margin: 0, fontSize: 14, color: scheme.muted, maxWidth: 480 }}>{subtitle}</p> : null}
      </div>
    </EditorBlock>
  );

  const productArticles = list.map((product) => {
            const image = product.imageUrls?.[0];
            const mediaNode = showMedia ? (
              <EditorBlock nodeId={`${editorNodeId}:block:product_card:nested:media`} label="Media">
                <div
                  style={{
                    border: productCardMediaStyle.border,
                    borderRadius: productCardMediaStyle.borderRadius,
                    paddingTop: productCardMediaStyle.paddingTop,
                    paddingBottom: productCardMediaStyle.paddingBottom,
                    paddingLeft: productCardMediaStyle.paddingLeft,
                    paddingRight: productCardMediaStyle.paddingRight,
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    className="fc-media-inner"
                    style={{
                      width: '100%',
                      aspectRatio: compactFourCol
                        ? '1 / 1'
                        : (productCardMediaStyle.aspectRatio ?? '1 / 1'),
                      minHeight: compactFourCol
                        ? 116
                        : (productCardMediaStyle.aspectRatio ? undefined : 140),
                      maxHeight: compactFourCol ? 160 : 280,
                      overflow: 'hidden',
                      borderRadius:
                        productCardMediaStyle.borderRadius > 0
                          ? Math.max(
                              0,
                              productCardMediaStyle.borderRadius -
                                Math.max(
                                  productCardMediaStyle.paddingTop,
                                  productCardMediaStyle.paddingBottom,
                                  productCardMediaStyle.paddingLeft,
                                  productCardMediaStyle.paddingRight
                                )
                            )
                          : 0,
                      background: image
                        ? `center / cover no-repeat url(${image})`
                        : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                    }}
                  />
                </div>
              </EditorBlock>
            ) : null;

            const titleNode = showTitle ? (
              <EditorBlock nodeId={`${editorNodeId}:block:product_card:nested:product_title`} label="Product title">
                <h3
                  style={{
                    margin: 0,
                    width: productCardTitleStyle.width,
                    maxWidth: productCardTitleStyle.maxWidth,
                    textAlign: productCardTitleStyle.textAlign,
                    fontFamily: productCardTitleStyle.fontFamily,
                    fontSize: Math.max(12, Math.round(productCardTitleStyle.fontSize * compactScale)),
                    fontWeight: productCardTitleStyle.fontWeight,
                    lineHeight: productCardTitleStyle.lineHeight,
                    color: productCardTitleStyle.color,
                    background: productCardTitleStyle.background,
                    paddingTop: productCardTitleStyle.paddingTop,
                    paddingBottom: productCardTitleStyle.paddingBottom,
                    paddingLeft: productCardTitleStyle.paddingLeft,
                    paddingRight: productCardTitleStyle.paddingRight,
                    borderRadius: productCardTitleStyle.borderRadius,
                    boxSizing: 'border-box',
                  }}
                >
                  {product.title}
                </h3>
              </EditorBlock>
            ) : null;

            const priceNode = showPrice ? (
              <EditorBlock nodeId={`${editorNodeId}:block:product_card:nested:price`} label="Price">
                <div
                  style={{
                    margin: 0,
                    width: productCardPriceStyle.width,
                    textAlign: productCardPriceStyle.textAlign,
                    paddingTop: productCardPriceStyle.paddingTop,
                    paddingBottom: productCardPriceStyle.paddingBottom,
                    paddingLeft: productCardPriceStyle.paddingLeft,
                    paddingRight: productCardPriceStyle.paddingRight,
                    boxSizing: 'border-box',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: productCardPriceStyle.fontFamily,
                      fontSize: Math.max(11, Math.round(productCardPriceStyle.fontSize * compactScale)),
                      fontWeight: productCardPriceStyle.fontWeight,
                      lineHeight: productCardPriceStyle.lineHeight,
                      color: productCardPriceStyle.color,
                    }}
                  >
                    {(() => {
                      const priced = formatProductCardPrice(
                        product.price,
                        product.compareAtPrice,
                        productCardPriceStyle,
                        formatINR
                      );
                      return (
                        <>
                          <span>{priced.primary}</span>
                          {priced.compareAt ? (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: productCardPriceStyle.fontSize * 0.85,
                                fontWeight: 400,
                                color: scheme.muted,
                                textDecoration: 'line-through',
                              }}
                            >
                              {priced.compareAt}
                            </span>
                          ) : null}
                        </>
                      );
                    })()}
                  </p>
                  {productCardPriceStyle.showInstallments ? (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: scheme.muted }}>
                      Pay in installments
                    </p>
                  ) : null}
                  {productCardPriceStyle.showTaxInfo ? (
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: scheme.muted }}>
                      Tax included
                    </p>
                  ) : null}
                </div>
              </EditorBlock>
            ) : null;

            return (
              <article
                key={product._id}
                style={{
                  border: productCardStyle.border === 'none' ? `1px solid ${layout.line}` : productCardStyle.border,
                  borderRadius: productCardStyle.borderRadius,
                  overflow: 'hidden',
                  background: productCardStyle.background,
                  color: productCardStyle.color,
                  paddingTop: productCardStyle.paddingTop,
                  paddingBottom: productCardStyle.paddingBottom,
                  paddingLeft: productCardStyle.paddingLeft,
                  paddingRight: productCardStyle.paddingRight,
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                }}
              >
                {productNestedOrder.map((nestedId) => {
                  if (nestedId === 'media') return <div key={nestedId}>{mediaNode}</div>;
                  if (nestedId === 'product_title')
                    return (
                      <div
                        key={nestedId}
                        style={{
                          padding: `${contentPadding}px ${contentPadding}px 0`,
                        }}
                      >
                        {titleNode}
                      </div>
                    );
                  if (nestedId === 'price')
                    return (
                      <div
                        key={nestedId}
                        style={{
                          padding: `0 ${contentPadding}px ${contentPadding}px`,
                        }}
                      >
                        {priceNode}
                      </div>
                    );
                  return null;
                })}
              </article>
            );
  });

  const productGrid = isEditorial ? (
    <div
      ref={carouselOnMobile ? trackRef : undefined}
      className="fc-editorial-grid"
      data-fc-mobile-carousel={carouselOnMobile ? 'true' : 'false'}
    >
      {productArticles}
    </div>
  ) : isCarousel ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {showNav ? (
        <NavButton
          label="Previous"
          onClick={() => scrollByPage(-1)}
          background={navIconBackground}
          shape={navIcon === 'chevron' ? 'chevron' : 'arrows'}
        />
      ) : null}
      <div ref={trackRef} className="fc-product-grid" style={{ flex: 1, minWidth: 0 }}>
        {productArticles}
      </div>
      {showNav ? (
        <NavButton
          label="Next"
          onClick={() => scrollByPage(1)}
          background={navIconBackground}
          shape={navIcon === 'chevron' ? 'chevron' : 'arrows'}
        />
      ) : null}
    </div>
  ) : (
    <div
      ref={carouselOnMobile ? trackRef : undefined}
      className="fc-product-grid"
      data-mobile-columns={mobileColumns}
    >
      {productArticles}
    </div>
  );

  const productCardBlock = (
    <EditorBlock nodeId={`${editorNodeId}:block:product_card`} label="Product card">
      {list.length === 0 ? (
        <p style={{ color: scheme.muted, fontSize: 14 }}>{emptyMessage}</p>
      ) : (
        productGrid
      )}
    </EditorBlock>
  );

  const blockNodes: Record<string, ReactNode> = {
    collection_header: headerBlock,
    product_card: productCardBlock,
  };

  return (
    <>
      {scopedCss ? <style>{scopedCss}</style> : null}
      <style>{layoutCss}</style>
      {headerResponsiveCss ? <style>{headerResponsiveCss}</style> : null}
      <EditorSection
        nodeId={editorNodeId}
        label={
          isGrid
            ? 'Featured collection: Grid'
            : isEditorial
              ? 'Featured collection: Editorial'
              : isCarousel
                ? 'Featured collection: Carousel'
                : 'Featured collection'
        }
        data-ziplofy-section={sectionId}
        data-mobile-columns={mobileColumns}
        data-fc-mobile-carousel={isEditorial && carouselOnMobile ? 'true' : 'false'}
        style={{
          padding: `${paddingTop}px ${layout.padX}px ${paddingBottom}px`,
          fontFamily: fontBody,
          color,
          background: sectionBg,
        }}
      >
        <div style={{ maxWidth: innerMaxWidth, margin: '0 auto' }}>
          {blockOrder.map((blockId) => {
            const node = blockNodes[blockId];
            return node ? <div key={blockId}>{node}</div> : null;
          })}
        </div>
      </EditorSection>
    </>
  );
}
