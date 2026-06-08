import { useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import {
  formatINR,
  useStorefront,
  useStorefrontProducts,
} from '@render-store/sdk';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import {
  HighlightProductShirtIllustration,
  StackedTealShirtsIllustration,
} from '../components/ProductHighlightArt';
import { readProductHighlightLayout, scopedProductHighlightCss } from '../lib/productHighlightStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { FeaturedProductSection } from './FeaturedProductSection';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function ProductHighlightSection({
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

  const catalogVariant = cfgString(config, `${settingsBase}.catalogVariant`, '');
  if (catalogVariant === 'featured-product') {
    return (
      <FeaturedProductSection
        sectionId={sectionId}
        templateId={templateId}
        placement={placement}
      />
    );
  }

  const style = useMemo(() => readProductHighlightLayout(config, settingsBase), [config, settingsBase]);

  const productId = cfgString(config, `${settingsBase}.productId`, '');
  const cachedTitle = cfgString(config, `${settingsBase}.productTitle`);
  const cachedPrice = cfgString(config, `${settingsBase}.price`);
  const cachedImageUrl = cfgString(config, `${settingsBase}.productImageUrl`, '');
  const mediaPosition = cfgString(config, `${settingsBase}.mediaPosition`, 'left');

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
  const innerMaxWidth = layout.maxWidth;
  const horizontalPad = layout.padX;
  const mediaOnLeft = mediaPosition !== 'right';

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

  const grid: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: 320,
    width: '100%',
    overflow: 'hidden',
  };

  const mediaPanel: CSSProperties = {
    background: scheme.panelLeft,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    minHeight: 280,
    order: mediaOnLeft ? 0 : 1,
  };

  const productPanel: CSSProperties = {
    background: scheme.panelRight,
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 32px',
    minHeight: 280,
    position: 'relative',
    order: mediaOnLeft ? 1 : 0,
  };

  const headerRow: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
  };

  const productArea: CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  };

  const mediaColumn: ReactNode = (
    <div style={mediaPanel}>
      <StackedTealShirtsIllustration />
    </div>
  );

  const productColumn: ReactNode = (
    <div style={productPanel}>
      <div style={headerRow}>
        <EditorField
          fieldPath={`${settingsBase}.productTitle`}
          label="Product title"
          as="h2"
          style={{
            margin: 0,
            fontFamily: fontHeading,
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.3,
            color: scheme.color,
            flex: 1,
            minWidth: 0,
          }}
        >
          {productTitle}
        </EditorField>
        <EditorField
          fieldPath={`${settingsBase}.price`}
          label="Price"
          as="span"
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 400,
            color: scheme.color,
            whiteSpace: 'nowrap',
          }}
        >
          {price}
        </EditorField>
      </div>
      <div style={productArea}>
        <EditorField fieldPath={`${settingsBase}.productImageUrl`} label="Product image" as="span">
          {productImageUrl ? (
            <img
              src={productImageUrl}
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: 200,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <HighlightProductShirtIllustration />
          )}
        </EditorField>
      </div>
    </div>
  );

  return (
    <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Product highlight" style={shell}>
      {style.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedProductHighlightCss(sectionId, style.customCss) }} />
      ) : null}
      <div style={grid}>
        {mediaColumn}
        {productColumn}
      </div>
    </EditorSection>
  );
}
