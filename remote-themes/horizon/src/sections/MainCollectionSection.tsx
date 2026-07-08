import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig, formatINR } from '@render-store/sdk';
import { cfgBool, cfgNumber } from '../lib/config';
import { EditorBlock, EditorSection } from '../lib/editorAttrs';
import { useCollectionPageData } from '../lib/useCollectionPageData';
import { productPath } from '../lib/storefrontPaths';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
};

function FilterSelect({ label }: { label: string }) {
  return (
    <span className="hz-chip" role="presentation">
      {label}
      <span style={{ opacity: 0.45, fontSize: 10 }}>▾</span>
    </span>
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
  const { text, muted } = useThemeColors();

  return (
    <Link to={href} className="hz-product-card">
      <article>
        <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:media`} label="Media">
          <div className="hz-product-card__media" style={{ position: 'relative' }}>
            {imageUrl ? (
              <img src={imageUrl} alt="" />
            ) : (
              <div style={{ aspectRatio: '4 / 5', background: 'var(--hz-surface)' }} />
            )}
            {soldOut ? (
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'var(--hz-bg)',
                  color: 'var(--hz-muted)',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '6px 10px',
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
            label="Product title"
          >
            <div className="hz-product-card__title">{title}</div>
          </EditorBlock>
          <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:product_card:nested:price`} label="Price">
            <div className="hz-product-card__price">{formatINR(price)}</div>
          </EditorBlock>
        </div>
      </article>
    </Link>
  );
}

export function MainCollectionSection({
  sectionId = 'main_collection',
  templateId = 'collection',
}: Props) {
  const config = useThemeConfig();
  const { text, background, fontBody } = useThemeColors();
  const { products, itemCount, loading } = useCollectionPageData();
  const base = `templates.${templateId}.sections.${sectionId}`;

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
          { id: 'p1', urlHandle: 'p1', title: 'Product title', price: 0, imageUrl: '', soldOut: false },
          { id: 'p2', urlHandle: 'p2', title: 'Product title', price: 0, imageUrl: '', soldOut: true },
        ];

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={`template:${templateId}:${sectionId}`}
      label="Main collection"
      style={{
        background,
        color: text,
        fontFamily: fontBody,
        padding: `8px ${layout.padX}px 48px`,
      }}
    >
      <div style={{ maxWidth: layout.maxWidth, margin: '0 auto' }}>
        {(showFiltering || showSorting) && (
          <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:filtering_and_sorting`} label="Filters">
            <div className="hz-collection-toolbar">
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
              href={productPath(product.urlHandle)}
            />
          ))}
        </div>
      </div>
    </EditorSection>
  );
}
