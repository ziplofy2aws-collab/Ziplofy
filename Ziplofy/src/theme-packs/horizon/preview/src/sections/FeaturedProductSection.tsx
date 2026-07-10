import { useEffect, useMemo, type CSSProperties } from 'react';
import { formatINR, useStorefront, useStorefrontProducts } from '@render-store/sdk';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../lib/config';
import { HighlightProductShirtIllustration } from '../components/ProductHighlightArt';
import { readProductHighlightLayout, scopedProductHighlightCss } from '../lib/productHighlightStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function StarRating({ rating, reviewCount, color, muted }: { rating: number; reviewCount: number; color: string; muted: string }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    if (i < full) stars.push('★');
    else if (i === full && half) stars.push('⯨');
    else stars.push('☆');
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
      <span style={{ color: '#111827', fontSize: 14, letterSpacing: 1 }} aria-hidden>
        {stars.join('')}
      </span>
      <span style={{ fontSize: 13, color: muted }}>
        {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
      </span>
    </div>
  );
}

export function FeaturedProductSection({
  sectionId = 'product_highlight',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const { storeFrontMeta } = useStorefront();
  const { products, fetchProductsByStoreId, fetchProductById, productDetail } = useStorefrontProducts();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readProductHighlightLayout(config, settingsBase), [config, settingsBase]);

  const productId = cfgString(config, `${settingsBase}.productId`, '');
  const cachedTitle = cfgString(config, `${settingsBase}.productTitle`);
  const cachedPrice = cfgString(config, `${settingsBase}.price`);
  const cachedImageUrl = cfgString(config, `${settingsBase}.productImageUrl`, '');
  const mediaPosition = cfgString(config, `${settingsBase}.mediaPosition`, 'left');
  const showRating = cfgBool(config, `${settingsBase}.showRating`, false);
  const rating = cfgNumber(config, `${settingsBase}.rating`, 4.5);
  const reviewCount = cfgNumber(config, `${settingsBase}.reviewCount`, 3);
  const showTaxNote = cfgBool(config, `${settingsBase}.showTaxNote`, true);
  const taxNote = cfgString(config, `${settingsBase}.taxNote`);
  const buttonLabel = cfgString(config, `${settingsBase}.buttonLabel`);
  const soldOut = cfgBool(config, `${settingsBase}.soldOut`, true);

  const storeId = storeFrontMeta?.storeId ?? '';

  useEffect(() => {
    if (!storeId) return;
    void fetchProductsByStoreId({ storeId, page: 1, limit: 24 });
  }, [storeId, fetchProductsByStoreId]);

  useEffect(() => {
    if (!productId) return;
    const inList = products.some((p) => p._id === productId);
    if (!inList) void fetchProductById(productId);
  }, [productId, products, fetchProductById]);

  const resolvedProduct = useMemo(() => {
    if (!productId) return null;
    if (productDetail?._id === productId) return productDetail;
    return products.find((p) => p._id === productId) ?? null;
  }, [productId, productDetail, products]);

  const productTitle = resolvedProduct?.title ?? cachedTitle;
  const price = resolvedProduct ? formatINR(resolvedProduct.price) : cachedPrice;
  const productImageUrl = resolvedProduct?.imageUrls?.[0] ?? cachedImageUrl;

  const scheme = style.scheme;
  const mediaOnLeft = mediaPosition !== 'right';
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const gridCols = style.equalColumns ? '1fr 1fr' : '1.05fr 0.95fr';

  const shell: CSSProperties = {
    background: scheme.background,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
  };

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
  };

  const split: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: gridCols,
    gap: style.layoutGap,
    alignItems: 'stretch',
    width: '100%',
  };

  const mediaPanel: CSSProperties = {
    background: scheme.panelLeft,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 360,
    padding: '40px 32px',
    order: mediaOnLeft ? 0 : 1,
    borderRadius: 0,
  };

  const detailsPanel: CSSProperties = {
    background: scheme.panelRight,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px 48px',
    order: mediaOnLeft ? 1 : 0,
    maxWidth: style.limitProductDetailsWidth ? 420 : undefined,
    width: '100%',
    boxSizing: 'border-box',
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: 28,
    fontWeight: 400,
    lineHeight: 1.25,
    color: scheme.color,
  };

  const priceStyle: CSSProperties = {
    margin: '8px 0 0',
    fontSize: 16,
    fontWeight: 400,
    color: scheme.color,
  };

  const taxStyle: CSSProperties = {
    margin: '6px 0 0',
    fontSize: 13,
    color: scheme.muted,
  };

  const buttonStyle: CSSProperties = {
    marginTop: 24,
    width: '100%',
    padding: '14px 24px',
    border: 'none',
    borderRadius: 999,
    background: soldOut ? '#6b7280' : '#111827',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 500,
    cursor: soldOut ? 'not-allowed' : 'pointer',
    fontFamily: fontBody,
  };

  return (
    <EditorSection nodeId={editorNodeId} label="Featured product" style={shell}>
      {style.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedProductHighlightCss(sectionId, style.customCss) }} />
      ) : null}
      <div style={stage} data-ziplofy-section={sectionId}>
        <div style={split}>
          <div style={mediaPanel}>
            {productImageUrl ? (
              <img
                src={productImageUrl}
                alt=""
                style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <HighlightProductShirtIllustration />
            )}
          </div>
          <div style={detailsPanel}>
            <EditorField
              nodeId={editorNodeId}
              fieldPath={`${settingsBase}.productTitle`}
              label="Product title"
              as="h2"
              style={titleStyle}
            >
              {productTitle}
            </EditorField>
            <EditorField
              nodeId={editorNodeId}
              fieldPath={`${settingsBase}.price`}
              label="Price"
              as="p"
              style={priceStyle}
            >
              {price}
            </EditorField>
            {showTaxNote ? (
              <EditorField nodeId={editorNodeId} fieldPath={`${settingsBase}.taxNote`} label="Tax note" as="p" style={taxStyle}>
                {taxNote}
              </EditorField>
            ) : null}
            {showRating ? <StarRating rating={rating} reviewCount={reviewCount} color={scheme.color} muted={scheme.muted} /> : null}
            <EditorField nodeId={editorNodeId} fieldPath={`${settingsBase}.buttonLabel`} label="Button" as="span">
              <button type="button" disabled={soldOut} style={buttonStyle}>
                {buttonLabel}
              </button>
            </EditorField>
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
