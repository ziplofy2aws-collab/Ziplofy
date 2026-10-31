import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useStorefront,
  useStorefrontSearch,
  useThemeConfig,
} from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorSection } from '../../runtime/shared/editorAttrs';
import { formatThemePrice } from '../../runtime/shared/themePricesRuntime';
import { useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import {
  combineResponsiveCss,
  mobileMedia,
  sectionScopeClass,
} from '../../runtime/shared/responsive';
import type { SectionRuntimeProps } from '../../runtime/types';
import { productPath } from '../../../utils/storefront-paths';

type SortKey = 'featured' | 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc';

type SearchProduct = {
  id: string;
  title: string;
  urlHandle?: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl: string;
  soldOut: boolean;
};

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function aspectRatioCss(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (v === '1/1' || v === 'square') return '1 / 1';
  if (v === '4/5') return '4 / 5';
  if (v === '3/4' || v === 'portrait') return '3 / 4';
  if (v === '16/9') return '16 / 9';
  if (v === '2/3') return '2 / 3';
  return '1 / 1';
}

function sortProducts(items: SearchProduct[], sort: SortKey): SearchProduct[] {
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
  product: SearchProduct;
  priceLabel: string;
  compareLabel: string | null;
  aspectRatio: string;
  cornerRadius: number;
  showMedia: boolean;
  showTitle: boolean;
  showPrice: boolean;
}) {
  const { text, muted, border } = useThemeColors();
  const href = product.urlHandle?.trim()
    ? productPath(product.urlHandle)
    : productPath(product.id);

  return (
    <Link
      to={href}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', minWidth: 0 }}
    >
      <article
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
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
                    right: 10,
                    background: 'rgba(255,255,255,0.96)',
                    color: '#111827',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: '1px solid rgba(17,24,39,0.12)',
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
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1.35,
                  color: text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
                <span style={{ fontWeight: 700, color: text }}>{priceLabel}</span>
                {compareLabel ? (
                  <span style={{ textDecoration: 'line-through', opacity: 0.55 }}>
                    {compareLabel}
                  </span>
                ) : null}
              </div>
            </EditorBlock>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export function SearchResults({
  sectionId = 'search_results',
  templateId = 'search',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { storeFrontMeta } = useStorefront();
  const { products, searchProducts, loading, error } = useStorefrontSearch();
  const { maxWidth, padX, padXMobile } = useThemeLayout();
  const { text, background, fontBody, fontHeading, muted, border } = useThemeColors();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const [sort, setSort] = useState<SortKey>('featured');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const base = secBase(templateId, sectionId);
  const scopeClass = sectionScopeClass('codiic-search-results', sectionId);
  const editorNodeId = `template:${templateId}:${sectionId}`;
  const storeId = storeFrontMeta?.storeId ?? '';

  const resultsHeading = cfgString(config, `${base}.settings.resultsHeading`, 'Products');
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
  const paddingTop = cfgNumber(config, `${base}.settings.paddingTop`, 24);
  const paddingBottom = cfgNumber(config, `${base}.settings.paddingBottom`, 56);
  const sectionWidth = cfgString(config, `${base}.settings.sectionWidth`, 'page');

  const filteringEnabled = cfgBool(
    config,
    `${base}.blocks.filtering_and_sorting.enabled`,
    false
  );
  const showSorting = cfgBool(
    config,
    `${base}.blocks.filtering_and_sorting.settings.enableSorting`,
    true
  );
  const showMedia = cfgBool(config, `${base}.blocks.product_card.settings.showMedia`, true);
  const showTitle = cfgBool(config, `${base}.blocks.product_card.settings.showTitle`, true);
  const showPrice = cfgBool(config, `${base}.blocks.product_card.settings.showPrice`, true);
  const aspectRatio = aspectRatioCss(
    cfgString(config, `${base}.blocks.product_card.settings.mediaAspectRatio`, '1/1')
  );
  const cornerRadius = Math.max(
    0,
    cfgNumber(config, `${base}.blocks.product_card.settings.mediaCornerRadius`, 0)
  );

  // Keep a short debounce here too so rapid URL updates (submit + debounce flush) coalesce.
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 50);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!storeId) return;
    void searchProducts({ storeId, q: debouncedQuery, page: 1, limit: productsPerPage });
  }, [storeId, debouncedQuery, productsPerPage, searchProducts]);

  const mappedProducts = useMemo<SearchProduct[]>(() => {
    return products.map((item) => ({
      id: item._id,
      title: item.title?.trim() || 'Product',
      urlHandle: item.urlHandle?.trim() || undefined,
      price: typeof item.price === 'number' ? item.price : 0,
      compareAtPrice:
        typeof item.compareAtPrice === 'number' ? item.compareAtPrice : null,
      imageUrl: item.imageUrls?.[0] ?? '',
      soldOut: false,
    }));
  }, [products]);

  const displayProducts = useMemo(
    () => sortProducts(mappedProducts, sort),
    [mappedProducts, sort]
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
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }),
    [maxWidth, sectionWidth]
  );

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

  const responsiveCss = combineResponsiveCss(
    mobileMedia(`
      .${scopeClass} {
        padding-left: ${padXMobile}px !important;
        padding-right: ${padXMobile}px !important;
      }
      .${scopeClass} .codiic-sr-grid {
        grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr)) !important;
      }
    `)
  );

  return (
    <EditorSection
      sectionId={sectionId}
      label="Search results"
      editorNodeId={editorNodeId}
      className={scopeClass}
      style={shellStyle}
    >
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      <div style={innerStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: fontHeading,
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.25,
              color: text,
            }}
          >
            {resultsHeading}
          </h2>

          {filteringEnabled && showSorting ? (
            <EditorBlock
              nodeId={`${editorNodeId}:block:filtering_and_sorting`}
              label="Filtering and sorting"
            >
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ color: muted || text }}>Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  style={{
                    border: `1px solid ${border || '#d1d5db'}`,
                    borderRadius: 6,
                    padding: '6px 10px',
                    background: '#fff',
                    color: text,
                    fontSize: 13,
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="title-asc">Alphabetically, A–Z</option>
                  <option value="title-desc">Alphabetically, Z–A</option>
                  <option value="price-asc">Price, low to high</option>
                  <option value="price-desc">Price, high to low</option>
                </select>
              </label>
            </EditorBlock>
          ) : null}
        </div>

        {loading && displayProducts.length === 0 ? (
          <p style={{ margin: 0, color: muted || '#6b7280', fontSize: 14 }}>Loading products…</p>
        ) : error && displayProducts.length === 0 ? (
          <p style={{ margin: 0, color: muted || '#6b7280', fontSize: 14 }}>{error}</p>
        ) : displayProducts.length === 0 ? (
          <p style={{ margin: 0, color: muted || '#6b7280', fontSize: 14 }}>
            {query ? 'No products found' : 'No products yet'}
          </p>
        ) : (
          <div className="codiic-sr-grid" style={gridStyle}>
            {displayProducts.map((product) => {
              const soldOut = product.soldOut;
              const priceLabel = formatThemePrice(config, product.price, 'productCards');
              const compareLabel =
                product.compareAtPrice != null && product.compareAtPrice > product.price
                  ? formatThemePrice(config, product.compareAtPrice, 'productCards')
                  : null;
              return (
                <ProductCard
                  key={product.id}
                  templateId={templateId}
                  sectionId={sectionId}
                  product={{ ...product, soldOut }}
                  priceLabel={priceLabel}
                  compareLabel={compareLabel}
                  aspectRatio={aspectRatio}
                  cornerRadius={cornerRadius}
                  showMedia={showMedia}
                  showTitle={showTitle}
                  showPrice={showPrice}
                />
              );
            })}
          </div>
        )}
      </div>
    </EditorSection>
  );
}
