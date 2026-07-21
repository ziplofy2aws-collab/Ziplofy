import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorSection } from '../../runtime/shared/editorAttrs';
import { formatThemePrice } from '../../runtime/shared/themePricesRuntime';
import { useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import {
  combineResponsiveCss,
  mobileMedia,
  sectionScopeClass,
} from '../../runtime/shared/responsive';
import {
  useCollectionPageData,
  type CollectionPageProduct,
} from '../../runtime/shared/useCollectionPageData';
import type { SectionRuntimeProps } from '../../runtime/types';
import { productPath } from '../../../utils/storefront-paths';

type SortKey = 'featured' | 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc';

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function productHref(product: CollectionPageProduct): string {
  const handle = product.urlHandle?.trim();
  if (handle) return productPath(handle);
  return productPath(product.id);
}

function aspectRatioCss(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (v === '1/1' || v === 'square') return '1 / 1';
  if (v === '4/5') return '4 / 5';
  if (v === '3/4' || v === 'portrait') return '3 / 4';
  if (v === '16/9') return '16 / 9';
  if (v === '2/3') return '2 / 3';
  return '3 / 4';
}

function sortProducts(items: CollectionPageProduct[], sort: SortKey): CollectionPageProduct[] {
  const next = [...items];
  switch (sort) {
    case 'title-asc':
      return next.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return next.sort((a, b) => b.title.localeCompare(a.title));
    case 'price-asc':
      return next.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return next.sort((a, b) => b.price - a.price);
    case 'featured':
    default:
      return next;
  }
}

function ProductCard({
  templateId,
  sectionId,
  product,
  priceLabel,
  compareLabel,
  aspectRatio,
  cornerRadius,
  showMedia,
  showTitle,
  showPrice,
}: {
  templateId: string;
  sectionId: string;
  product: CollectionPageProduct;
  priceLabel: string;
  compareLabel: string | null;
  aspectRatio: string;
  cornerRadius: number;
  showMedia: boolean;
  showTitle: boolean;
  showPrice: boolean;
}) {
  const { text, muted, border } = useThemeColors();
  const href = productHref(product);

  return (
    <Link
      to={href}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', minWidth: 0 }}
    >
      <article
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          height: '100%',
          minWidth: 0,
        }}
      >
        {showMedia ? (
          <EditorBlock
            nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:media`}
            label="Media"
          >
            <div
              style={{
                position: 'relative',
                borderRadius: cornerRadius,
                overflow: 'hidden',
                background: '#f4f4f5',
                width: '100%',
                border: border ? `1px solid ${border}` : '1px solid rgba(17,24,39,0.06)',
              }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt=""
                  style={{
                    display: 'block',
                    width: '100%',
                    aspectRatio,
                    objectFit: 'cover',
                    transition: 'transform 220ms ease',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    aspectRatio,
                    background: 'linear-gradient(160deg, #f4f4f5 0%, #e4e4e7 100%)',
                  }}
                />
              )}
              {product.soldOut ? (
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'rgba(255,255,255,0.94)',
                    color: '#3f3f46',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    padding: '5px 9px',
                    borderRadius: 6,
                  }}
                >
                  Sold out
                </span>
              ) : null}
            </div>
          </EditorBlock>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          {showTitle ? (
            <EditorBlock
              nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:product_title`}
              label="Product title"
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.35,
                  color: text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {product.title}
              </div>
            </EditorBlock>
          ) : null}
          {showPrice ? (
            <EditorBlock
              nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:price`}
              label="Price"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 14,
                  color: muted || text,
                }}
              >
                <span style={{ fontWeight: 600, color: text }}>{priceLabel}</span>
                {compareLabel ? (
                  <span style={{ textDecoration: 'line-through', opacity: 0.55 }}>{compareLabel}</span>
                ) : null}
              </div>
            </EditorBlock>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export function MainCollection({
  sectionId = 'main_collection',
  templateId = 'collection',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { maxWidth, padX, padXMobile } = useThemeLayout();
  const { text, background, fontBody, muted, border } = useThemeColors();
  const { products, itemCount, loading, collection } = useCollectionPageData();
  const base = secBase(templateId, sectionId);
  const scopeClass = sectionScopeClass('codiic-main-collection', sectionId);
  const editorNodeId = `template:${templateId}:${sectionId}`;
  const [sort, setSort] = useState<SortKey>('featured');

  const columns = Math.max(1, Math.min(6, cfgNumber(config, `${base}.settings.columns`, 4)));
  const mobileColumns = Math.max(
    1,
    Math.min(3, cfgNumber(config, `${base}.settings.mobileColumns`, 2))
  );
  const productsPerPage = Math.max(
    1,
    Math.min(48, cfgNumber(config, `${base}.settings.productsPerPage`, 16))
  );
  const horizontalGap = cfgNumber(config, `${base}.settings.horizontalGap`, 16);
  const verticalGap = cfgNumber(config, `${base}.settings.verticalGap`, 28);
  const paddingTop = cfgNumber(config, `${base}.settings.paddingTop`, 12);
  const paddingBottom = cfgNumber(config, `${base}.settings.paddingBottom`, 56);
  const sectionWidth = cfgString(config, `${base}.settings.sectionWidth`, 'page');
  const showSorting = cfgBool(
    config,
    `${base}.blocks.filtering_and_sorting.settings.enableSorting`,
    true
  );
  const showMedia = cfgBool(config, `${base}.blocks.product_card.settings.showMedia`, true);
  const showTitle = cfgBool(config, `${base}.blocks.product_card.settings.showTitle`, true);
  const showPrice = cfgBool(config, `${base}.blocks.product_card.settings.showPrice`, true);
  const aspectRatio = aspectRatioCss(
    cfgString(config, `${base}.blocks.product_card.settings.mediaAspectRatio`, '3/4')
  );
  const cornerRadius = Math.max(
    0,
    cfgNumber(config, `${base}.blocks.product_card.settings.mediaCornerRadius`, 8)
  );

  const displayProducts = useMemo(() => {
    if (loading) return [];
    return sortProducts(products, sort).slice(0, productsPerPage);
  }, [loading, products, productsPerPage, sort]);

  const gridStyle = useMemo<CSSProperties>(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      columnGap: horizontalGap,
      rowGap: verticalGap,
      width: '100%',
    }),
    [columns, horizontalGap, verticalGap]
  );

  const shellStyle = useMemo<CSSProperties>(
    () => ({
      background,
      color: text,
      fontFamily: fontBody,
      paddingTop,
      paddingBottom,
      paddingLeft: padX,
      paddingRight: padX,
      boxSizing: 'border-box',
      width: '100%',
      overflowX: 'hidden',
    }),
    [background, text, fontBody, paddingTop, paddingBottom, padX]
  );

  const innerStyle = useMemo<CSSProperties>(
    () => ({
      maxWidth: sectionWidth === 'full' ? '100%' : maxWidth,
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
    }),
    [maxWidth, sectionWidth]
  );

  const responsiveCss = combineResponsiveCss(
    mobileMedia(`
      .${scopeClass} {
        padding-left: ${padXMobile}px !important;
        padding-right: ${padXMobile}px !important;
      }
      .${scopeClass} .codiic-mc-grid {
        grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr)) !important;
      }
      .${scopeClass} .codiic-mc-toolbar {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
    `),
    `
@media (min-width: 750px) and (max-width: 989px) {
  .${scopeClass} .codiic-mc-grid {
    grid-template-columns: repeat(${Math.min(columns, 3)}, minmax(0, 1fr)) !important;
  }
}
.${scopeClass} .codiic-mc-card:hover img {
  transform: scale(1.03);
}
`
  );

  const emptyMessage =
    templateId === 'products'
      ? 'Add products in your admin to show them here.'
      : collection
        ? 'This collection has no products yet.'
        : 'Select or open a collection to see its products.';

  return (
    <EditorSection
      sectionId={sectionId}
      label="Collection"
      editorNodeId={editorNodeId}
      className={scopeClass}
      style={shellStyle}
    >
      <style>{responsiveCss}</style>
      <div style={innerStyle}>
        {(showSorting || itemCount > 0 || loading) && (
          <EditorBlock
            nodeId={`${editorNodeId}:block:filtering_and_sorting`}
            label="Filtering and sorting"
          >
            <div
              className="codiic-mc-toolbar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 28,
                flexWrap: 'wrap',
                borderBottom: `1px solid ${border || 'rgba(0,0,0,0.08)'}`,
                paddingBottom: 16,
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 14, color: muted || text, opacity: 0.9 }}>
                {loading
                  ? 'Loading products…'
                  : `${itemCount} ${itemCount === 1 ? 'product' : 'products'}`}
              </div>
              {showSorting ? (
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    color: muted || text,
                  }}
                >
                  <span style={{ opacity: 0.75 }}>Sort by</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      border: `1px solid ${border || 'rgba(17,24,39,0.14)'}`,
                      borderRadius: 8,
                      background: '#fff',
                      color: text,
                      fontFamily: fontBody,
                      fontSize: 14,
                      fontWeight: 500,
                      padding: '8px 32px 8px 12px',
                      cursor: 'pointer',
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                    }}
                  >
                    <option value="featured">Featured</option>
                    <option value="title-asc">Alphabetically, A–Z</option>
                    <option value="title-desc">Alphabetically, Z–A</option>
                    <option value="price-asc">Price, low to high</option>
                    <option value="price-desc">Price, high to low</option>
                  </select>
                </label>
              ) : null}
            </div>
          </EditorBlock>
        )}

        {loading ? (
          <div className="codiic-mc-grid" style={gridStyle} aria-busy aria-label="Loading products">
            {Array.from({ length: Math.min(columns * 2, 8) }, (_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                <div
                  style={{
                    aspectRatio,
                    borderRadius: cornerRadius,
                    background: 'linear-gradient(160deg, #f4f4f5, #e4e4e7)',
                  }}
                />
                <div style={{ height: 14, width: '70%', borderRadius: 4, background: '#e4e4e7' }} />
                <div style={{ height: 12, width: '40%', borderRadius: 4, background: '#ececef' }} />
              </div>
            ))}
          </div>
        ) : displayProducts.length ? (
          <div className="codiic-mc-grid" style={gridStyle}>
            {displayProducts.map((product) => {
              const onSale =
                product.compareAtPrice != null &&
                Number.isFinite(product.compareAtPrice) &&
                product.compareAtPrice > product.price;
              return (
                <div key={product.id} className="codiic-mc-card">
                  <ProductCard
                    templateId={templateId}
                    sectionId={sectionId}
                    product={product}
                    priceLabel={formatThemePrice(config, product.price, 'productCards')}
                    compareLabel={
                      onSale
                        ? formatThemePrice(config, product.compareAtPrice as number, 'productCards')
                        : null
                    }
                    aspectRatio={aspectRatio}
                    cornerRadius={cornerRadius}
                    showMedia={showMedia}
                    showTitle={showTitle}
                    showPrice={showPrice}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '56px 20px',
              textAlign: 'center',
              borderRadius: 14,
              border: `1px dashed ${border || 'rgba(0,0,0,0.12)'}`,
              color: muted || text,
              width: '100%',
              boxSizing: 'border-box',
              background: 'rgba(0,0,0,0.015)',
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 600, color: text, marginBottom: 8 }}>
              No products yet
            </div>
            <div style={{ fontSize: 14, opacity: 0.75, maxWidth: 360, margin: '0 auto' }}>
              {emptyMessage}
            </div>
          </div>
        )}
      </div>
    </EditorSection>
  );
}
