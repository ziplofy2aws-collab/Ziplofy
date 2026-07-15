import { useMemo, type CSSProperties } from 'react';
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

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function productHref(product: CollectionPageProduct): string {
  const handle = product.urlHandle?.trim();
  if (handle) return productPath(handle);
  return productPath(product.id);
}

function ProductCard({
  templateId,
  sectionId,
  product,
  priceLabel,
  compareLabel,
}: {
  templateId: string;
  sectionId: string;
  product: CollectionPageProduct;
  priceLabel: string;
  compareLabel: string | null;
}) {
  const { text, muted } = useThemeColors();
  const href = productHref(product);

  return (
    <Link to={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', minWidth: 0 }}>
      <article
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          height: '100%',
          minWidth: 0,
        }}
      >
        <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:media`}>
          <div
            style={{
              position: 'relative',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#f4f4f5',
              width: '100%',
            }}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt=""
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '3 / 4',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  aspectRatio: '3 / 4',
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
                  background: 'rgba(255,255,255,0.92)',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <EditorBlock
            nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:product_title`}
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
          <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:price`}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: 14,
                color: muted ?? text,
              }}
            >
              <span style={{ fontWeight: 500, color: text }}>{priceLabel}</span>
              {compareLabel ? (
                <span style={{ textDecoration: 'line-through', opacity: 0.55 }}>{compareLabel}</span>
              ) : null}
            </div>
          </EditorBlock>
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
  const { products, itemCount, loading } = useCollectionPageData();
  const base = secBase(templateId, sectionId);
  const scopeClass = sectionScopeClass('codiic-main-collection', sectionId);

  const columns = Math.max(1, Math.min(6, cfgNumber(config, `${base}.settings.columns`, 4)));
  const mobileColumns = Math.max(1, Math.min(3, cfgNumber(config, `${base}.settings.mobileColumns`, 2)));
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
  const sortLabel = cfgString(
    config,
    `${base}.blocks.filtering_and_sorting.settings.sortLabel`,
    'Featured'
  );

  const displayProducts = useMemo(() => {
    if (loading) return [];
    return products.slice(0, productsPerPage);
  }, [loading, products, productsPerPage]);

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
    `),
    `
@media (min-width: 750px) and (max-width: 989px) {
  .${scopeClass} .codiic-mc-grid {
    grid-template-columns: repeat(${Math.min(columns, 3)}, minmax(0, 1fr)) !important;
  }
}
`
  );

  return (
    <EditorSection
      nodeId={`template:${templateId}:${sectionId}`}
      className={scopeClass}
      style={shellStyle}
    >
      <style>{responsiveCss}</style>
      <div style={innerStyle}>
        {(showSorting || itemCount > 0 || loading) && (
          <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:filtering_and_sorting`}>
            <div
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
              <div style={{ fontSize: 14, color: muted || text, opacity: 0.85 }}>
                {loading
                  ? 'Loading products…'
                  : `${itemCount} ${itemCount === 1 ? 'product' : 'products'}`}
              </div>
              {showSorting ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    color: muted || text,
                  }}
                >
                  <span style={{ opacity: 0.7 }}>Sort by</span>
                  <span style={{ fontWeight: 500, color: text }}>{sortLabel}</span>
                </div>
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
                    aspectRatio: '3 / 4',
                    borderRadius: 8,
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
                <ProductCard
                  key={product.id}
                  templateId={templateId}
                  sectionId={sectionId}
                  product={product}
                  priceLabel={formatThemePrice(config, product.price, 'productCards')}
                  compareLabel={
                    onSale
                      ? formatThemePrice(config, product.compareAtPrice as number, 'productCards')
                      : null
                  }
                />
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              borderRadius: 12,
              border: `1px dashed ${border || 'rgba(0,0,0,0.12)'}`,
              color: muted || text,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 500, color: text, marginBottom: 6 }}>
              No products yet
            </div>
            <div style={{ fontSize: 14, opacity: 0.75 }}>
              Add products in your admin to show them here.
            </div>
          </div>
        )}
      </div>
    </EditorSection>
  );
}
