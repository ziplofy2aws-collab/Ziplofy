import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber } from '../../runtime/shared/config';
import { EditorBlock, EditorSection } from '../../runtime/shared/editorAttrs';
import { formatThemePrice } from '../../runtime/shared/themePricesRuntime';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { useCollectionPageData } from '../../runtime/shared/useCollectionPageData';
import type { SectionRuntimeProps } from '../../runtime/types';

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function FilterSelect({ label }: { label: string }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 8,
        background: '#fff',
        fontSize: 14,
        color: 'inherit',
        cursor: 'default',
      }}
    >
      {label}
      <span style={{ opacity: 0.5, fontSize: 12 }}>▾</span>
    </button>
  );
}

function ProductCard({
  templateId,
  sectionId,
  title,
  price,
  imageUrl,
  soldOut,
  href,
}: {
  templateId: string;
  sectionId: string;
  title: string;
  price: number;
  imageUrl: string;
  soldOut: boolean;
  href: string;
}) {
  const { primary, text, muted } = useThemeColors();

  return (
    <Link to={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:media`}>
          <div style={{ position: 'relative', borderRadius: 0, overflow: 'hidden' }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                style={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  aspectRatio: '4 / 5',
                  background: 'linear-gradient(145deg, #f3f4f6, #e5e7eb)',
                }}
              />
            )}
            {soldOut ? (
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: '#e8e2d9',
                  color: '#3f3f3f',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: 4,
                }}
              >
                Sold out
              </span>
            ) : null}
          </div>
        </EditorBlock>
        <div>
          <EditorBlock
            nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:product_title`}
          >
            <div style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.35, color: text }}>{title}</div>
          </EditorBlock>
          <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:price`}>
            <div style={{ marginTop: 4, fontSize: 15, color: muted ?? text }}>{formatThemePrice(price)}</div>
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
  const { maxWidth } = useThemeLayout();
  const { text, background, fontBody } = useThemeColors();
  const { products, itemCount, loading } = useCollectionPageData();
  const base = secBase(templateId, sectionId);

  const columns = cfgNumber(config, `${base}.settings.columns`, 4);
  const mobileColumns = cfgNumber(config, `${base}.settings.mobileColumns`, 2);
  const horizontalGap = cfgNumber(config, `${base}.settings.horizontalGap`, 12);
  const verticalGap = cfgNumber(config, `${base}.settings.verticalGap`, 24);
  const showFiltering = cfgBool(
    config,
    `${base}.blocks.filtering_and_sorting.settings.enableFiltering`,
    true
  );
  const showSorting = cfgBool(
    config,
    `${base}.blocks.filtering_and_sorting.settings.enableSorting`,
    true
  );

  const gridStyle = useMemo<CSSProperties>(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`,
      gap: `${verticalGap}px ${horizontalGap}px`,
    }),
    [columns, horizontalGap, verticalGap]
  );

  const displayProducts = products.length
    ? products
    : loading
      ? []
      : [
          { id: 'p1', title: 'Product title', price: 0, imageUrl: '', soldOut: false },
          { id: 'p2', title: 'Product title', price: 0, imageUrl: '', soldOut: true },
        ];

  return (
    <EditorSection
      nodeId={`template:${templateId}:${sectionId}`}
      style={{
        ...layout.section,
        background,
        color: text,
        fontFamily: fontBody,
        paddingTop: 8,
        paddingBottom: 48,
      }}
    >
      <div style={{ ...layout.container, maxWidth }}>
        {(showFiltering || showSorting) && (
          <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:filtering_and_sorting`}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 24,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {showFiltering ? (
                  <>
                    <FilterSelect label="Availability" />
                    <FilterSelect label="Price" />
                  </>
                ) : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 14, opacity: 0.75 }}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                {showSorting ? <FilterSelect label="Sort" /> : null}
                <div style={{ display: 'inline-flex', gap: 4, opacity: 0.65 }}>
                  <span title="Grid view">▦</span>
                  <span title="List view">☰</span>
                </div>
              </div>
            </div>
          </EditorBlock>
        )}

        <div style={gridStyle} data-mobile-columns={mobileColumns}>
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              templateId={templateId}
              sectionId={sectionId}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
              soldOut={product.soldOut}
              href={`/products/${product.id}`}
            />
          ))}
        </div>
      </div>
    </EditorSection>
  );
}
