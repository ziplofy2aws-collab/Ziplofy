import { useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useStorefront, useStorefrontProducts, useThemeConfig } from '@render-store/sdk';
import { formatThemePrice } from '../../runtime/shared/themePricesRuntime';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
import { resolveThemeTypographyStyle } from '../../runtime/shared/themeTypographyRuntime';
import type { SectionRuntimeProps } from '../../runtime/types';
import { FeaturedProduct } from './FeaturedProduct';
import { FeaturedProductShirtIllustration, StackedTealShirtsIllustration } from './FeaturedProductArt';
import {
  combineResponsiveCss,
  scopedMobileHorizontalPadCss,
  scopedProductSplitMobileCss,
  sectionScopeClass,
} from '../../runtime/shared/responsive';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import {
  readProductHighlightLayout,
  resolveProductHighlightPanelBackground,
  scopedProductHighlightCss,
} from './productHighlightStyles';

function isUnsetColor(raw: string): boolean {
  const value = raw.trim().toLowerCase();
  return !value || value === 'default';
}

function resolveSectionBackground(
  config: Record<string, unknown> | null,
  raw: string,
  fallback: string
): string {
  if (isUnsetColor(raw)) return fallback;
  return resolveThemePaletteColorSetting(config, raw, 0, fallback);
}

function ProductHighlightDefault({
  sectionId,
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const { maxWidth } = useThemeLayout();
  const { storeFrontMeta } = useStorefront();
  const { products, fetchProductsByStoreId, fetchProductById, productDetail } = useStorefrontProducts();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const mediaSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.product_media.settings`
      : `sections.${sectionId}.blocks.product_media.settings`;

  const productImageSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.product.blocks.image.settings`
      : `sections.${sectionId}.blocks.product.blocks.image.settings`;

  const priceSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.product.blocks.price.settings`
      : `sections.${sectionId}.blocks.product.blocks.price.settings`;

  const titleSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.product.blocks.title.settings`
      : `sections.${sectionId}.blocks.product.blocks.title.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readProductHighlightLayout(config, settingsBase), [config, settingsBase]);

  const productId = cfgString(config, `${settingsBase}.productId`, '');
  const cachedTitle = cfgString(config, `${settingsBase}.productTitle`, 'Product title');
  const cachedPrice = cfgString(config, `${settingsBase}.price`, 'Rs. 19.99');
  const cachedImageUrl = cfgString(config, `${settingsBase}.productImageUrl`, '');
  const mediaPosition = cfgString(config, `${settingsBase}.mediaPosition`, 'left');

  const mediaType = cfgString(config, `${mediaSettingsBase}.mediaType`, 'image');
  const mediaImageUrl = cfgString(config, `${mediaSettingsBase}.imageUrl`, '');
  const mediaVideoUrl = cfgString(config, `${mediaSettingsBase}.videoUrl`, '');
  const mediaLink = cfgString(config, `${mediaSettingsBase}.link`, '');
  const mediaImagePosition = cfgString(config, `${mediaSettingsBase}.imagePosition`, 'cover');

  const productImageAspectRatio = cfgString(config, `${productImageSettingsBase}.aspectRatio`, 'auto');
  const productImageConstrain = cfgString(
    config,
    `${productImageSettingsBase}.constrainToScreenHeight`,
    'maintain-aspect-ratio'
  );

  const priceTypographyPreset = cfgString(config, `${priceSettingsBase}.typographyPreset`, 'default');
  const showSalePriceFirst = cfgBool(config, `${priceSettingsBase}.showSalePriceFirst`, false);

  const titleWidth = cfgString(config, `${titleSettingsBase}.width`, 'fit');
  const titleMaxWidth = cfgString(config, `${titleSettingsBase}.maxWidth`, 'normal');
  const titleAlignment = cfgString(config, `${titleSettingsBase}.alignment`, 'left');
  const titleTypographyPreset = cfgString(config, `${titleSettingsBase}.typographyPreset`, 'heading-5');
  const titleTextColorRaw = cfgString(config, `${titleSettingsBase}.textColor`, 'default');
  const titleBackgroundEnabled = cfgBool(config, `${titleSettingsBase}.backgroundEnabled`, false);
  const titlePaddingTop = cfgNumber(config, `${titleSettingsBase}.paddingTop`, 0);
  const titlePaddingBottom = cfgNumber(config, `${titleSettingsBase}.paddingBottom`, 0);
  const titlePaddingLeft = cfgNumber(config, `${titleSettingsBase}.paddingLeft`, 0);
  const titlePaddingRight = cfgNumber(config, `${titleSettingsBase}.paddingRight`, 0);

  const storeId = storeFrontMeta?.storeId ?? '';

  useEffect(() => {
    if (!storeId) return;
    void fetchProductsByStoreId({ storeId, page: 1, limit: 24 });
  }, [storeId, fetchProductsByStoreId]);

  useEffect(() => {
    if (!productId) return;
    void fetchProductById(productId);
  }, [productId, fetchProductById]);

  const resolvedProduct = useMemo(() => {
    if (!productId) return null;
    if (productDetail?._id === productId) return productDetail;
    return products.find((p) => p._id === productId) ?? null;
  }, [productId, productDetail, products]);

  const productTitle =
    (cachedTitle && cachedTitle !== 'Product title' ? cachedTitle : null) ??
    resolvedProduct?.title ??
    (cachedTitle || 'Product title');

  const productPriceAmount =
    typeof resolvedProduct?.price === 'number' && Number.isFinite(resolvedProduct.price)
      ? resolvedProduct.price
      : null;
  const productCompareAt =
    typeof resolvedProduct?.compareAtPrice === 'number' &&
    Number.isFinite(resolvedProduct.compareAtPrice)
      ? resolvedProduct.compareAtPrice
      : null;
  const onSale =
    productPriceAmount != null &&
    productCompareAt != null &&
    productCompareAt > productPriceAmount;

  const currentPriceLabel =
    productPriceAmount != null
      ? formatThemePrice(config, productPriceAmount, 'productCards')
      : cachedPrice || 'Rs. 19.99';
  const comparePriceLabel =
    onSale && productCompareAt != null
      ? formatThemePrice(config, productCompareAt, 'productCards')
      : '';
  const primaryPriceLabel =
    onSale && !showSalePriceFirst ? comparePriceLabel : currentPriceLabel;
  const strikePriceLabel = onSale
    ? showSalePriceFirst
      ? comparePriceLabel
      : currentPriceLabel
    : '';

  const priceTypography = useMemo(
    () =>
      resolveThemeTypographyStyle(config, priceTypographyPreset, {
        fontBody,
        fontHeading,
      }),
    [config, priceTypographyPreset, fontBody, fontHeading]
  );

  const titleTypography = useMemo(
    () =>
      resolveThemeTypographyStyle(config, titleTypographyPreset, {
        fontBody,
        fontHeading,
      }),
    [config, titleTypographyPreset, fontBody, fontHeading]
  );

  // Product → Image only styles this selected-product image (right column).
  // Left column uses Product media `imageUrl` / video — never this URL.
  const productImageUrl =
    (resolvedProduct?.imageUrls?.[0] && String(resolvedProduct.imageUrls[0]).trim()) ||
    cachedImageUrl.trim() ||
    '';

  const scheme = style.scheme;
  const titleColor =
    !titleTextColorRaw || titleTextColorRaw === 'default'
      ? scheme.color
      : resolveThemePaletteColorSetting(config, titleTextColorRaw, 1, scheme.color);
  const titleMaxWidthCss =
    titleMaxWidth === 'narrow'
      ? 280
      : titleMaxWidth === 'wide'
        ? 520
        : titleMaxWidth === 'none'
          ? undefined
          : 360;
  const titleStyle: CSSProperties = {
    margin: 0,
    width: titleWidth === 'fill' ? '100%' : 'fit-content',
    maxWidth: titleMaxWidthCss,
    textAlign:
      titleAlignment === 'center' ? 'center' : titleAlignment === 'right' ? 'right' : 'left',
    fontFamily: titleTypography.fontFamily,
    fontSize: titleTypography.fontSize,
    fontWeight: titleTypography.fontWeight,
    fontStyle: titleTypography.fontStyle,
    lineHeight: titleTypography.lineHeight,
    letterSpacing: titleTypography.letterSpacing,
    textTransform: titleTypography.textTransform,
    color: titleColor,
    background: titleBackgroundEnabled ? 'rgba(0,0,0,0.04)' : undefined,
    borderRadius: titleBackgroundEnabled ? 6 : undefined,
    paddingTop: titlePaddingTop,
    paddingBottom: titlePaddingBottom,
    paddingLeft: titlePaddingLeft,
    paddingRight: titlePaddingRight,
    boxSizing: 'border-box',
    flex: titleWidth === 'fill' ? '1 1 auto' : '1 1 auto',
    minWidth: 0,
  };
  const mediaOnLeft = mediaPosition !== 'right';
  const shellClass = sectionScopeClass('codiic-product-highlight', sectionId);
  const gridClass = `${shellClass}-grid`;
  const sectionBackground = resolveSectionBackground(config, style.backgroundColor, scheme.background);
  const hasCustomSectionBackground = !isUnsetColor(style.backgroundColor);

  const shell: CSSProperties = {
    background: sectionBackground,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: layout.padX,
    paddingRight: layout.padX,
    boxSizing: 'border-box',
    width: '100%',
  };

  const grid: CSSProperties = {
    maxWidth: maxWidth,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: 320,
    width: '100%',
    overflow: 'hidden',
  };

  const mediaPanel: CSSProperties = {
    background: hasCustomSectionBackground
      ? sectionBackground
      : resolveProductHighlightPanelBackground(style.mediaPanelBackgroundColor, scheme.panelLeft),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    minHeight: 280,
    order: mediaOnLeft ? 0 : 1,
    position: 'relative',
    overflow: 'hidden',
  };

  const productPanel: CSSProperties = {
    background: hasCustomSectionBackground
      ? sectionBackground
      : resolveProductHighlightPanelBackground(style.detailsPanelBackgroundColor, scheme.panelRight),
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 32px',
    minHeight: 280,
    order: mediaOnLeft ? 1 : 0,
  };

  const mediaObjectFit: CSSProperties['objectFit'] =
    mediaImagePosition === 'contain' ? 'contain' : 'cover';

  const mediaFrameStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 240,
    overflow: 'hidden',
  };

  const mediaFillStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: mediaObjectFit,
    display: 'block',
  };

  const resolvedMediaSrc =
    mediaType === 'video' ? mediaVideoUrl.trim() : mediaImageUrl.trim();

  const mediaContent = (() => {
    if (mediaType === 'video' && mediaVideoUrl.trim()) {
      return (
        <div style={mediaFrameStyle}>
          <video
            src={mediaVideoUrl}
            style={mediaFillStyle}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
          />
        </div>
      );
    }
    if (resolvedMediaSrc) {
      const img = (
        <div style={mediaFrameStyle}>
          <img src={resolvedMediaSrc} alt="" style={mediaFillStyle} />
        </div>
      );
      if (mediaLink.trim()) {
        return (
          <a
            href={mediaLink}
            style={{ display: 'block', width: '100%', height: '100%', minHeight: 240 }}
          >
            {img}
          </a>
        );
      }
      return img;
    }
    return <StackedTealShirtsIllustration />;
  })();

  const productImageFrameStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 280,
    margin: '0 auto',
    overflow: 'hidden',
    ...(productImageAspectRatio !== 'auto'
      ? { aspectRatio: productImageAspectRatio }
      : { minHeight: 160 }),
    ...(productImageConstrain === 'cover'
      ? { maxHeight: 'min(50vh, 280px)', height: productImageAspectRatio === 'auto' ? 220 : undefined }
      : {}),
  };

  const productImageStyle: CSSProperties = {
    position: productImageAspectRatio !== 'auto' || productImageConstrain === 'cover' ? 'absolute' : 'relative',
    inset: productImageAspectRatio !== 'auto' || productImageConstrain === 'cover' ? 0 : undefined,
    width: '100%',
    height: productImageAspectRatio !== 'auto' || productImageConstrain === 'cover' ? '100%' : 'auto',
    maxHeight: productImageAspectRatio === 'auto' && productImageConstrain !== 'cover' ? 200 : undefined,
    objectFit:
      productImageConstrain === 'cover'
        ? 'cover'
        : productImageAspectRatio !== 'auto'
          ? 'cover'
          : 'contain',
    display: 'block',
  };

  const mediaColumn: ReactNode = (
    <div style={mediaPanel}>
      <EditorField
        fieldPath={`${mediaSettingsBase}.imageUrl`}
        label="Product media"
        style={{ display: 'block', width: '100%', height: '100%', minHeight: 240 }}
      >
        {mediaContent}
      </EditorField>
    </div>
  );

  const productColumn: ReactNode = (
    <div style={productPanel}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          width: '100%',
        }}
      >
        <EditorField
          fieldPath={`${titleSettingsBase}.typographyPreset`}
          label="Product title"
          as="h2"
          style={titleStyle}
        >
          {productTitle}
        </EditorField>
        <EditorField
          fieldPath={`${priceSettingsBase}.typographyPreset`}
          label="Price"
          as="span"
          style={{
            margin: 0,
            fontFamily: priceTypography.fontFamily,
            fontSize: priceTypography.fontSize,
            fontWeight: priceTypography.fontWeight,
            fontStyle: priceTypography.fontStyle,
            lineHeight: priceTypography.lineHeight,
            letterSpacing: priceTypography.letterSpacing,
            textTransform: priceTypography.textTransform,
            color: scheme.color,
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <span>{primaryPriceLabel}</span>
          {strikePriceLabel ? (
            <span
              style={{
                fontSize: Math.max(12, priceTypography.fontSize * 0.85),
                fontWeight: 400,
                color: scheme.muted,
                textDecoration: 'line-through',
              }}
            >
              {strikePriceLabel}
            </span>
          ) : null}
        </EditorField>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <EditorField
          fieldPath={`${productImageSettingsBase}.aspectRatio`}
          label="Product image"
          as="span"
          style={{ display: 'block', width: '100%' }}
        >
          {productImageUrl ? (
            <div style={productImageFrameStyle}>
              <img src={productImageUrl} alt="" style={productImageStyle} />
            </div>
          ) : (
            <FeaturedProductShirtIllustration />
          )}
        </EditorField>
      </div>
    </div>
  );

  const responsiveCss = combineResponsiveCss(
    scopedMobileHorizontalPadCss(shellClass),
    scopedProductSplitMobileCss(gridClass)
  );

  return (
    <EditorSection
      sectionId={sectionId}
      label="Product highlight"
      editorNodeId={editorNodeId}
      className={shellClass}
      style={shell}
    >
      {style.customCss ? <style>{scopedProductHighlightCss(sectionId, style.customCss)}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      <div className={gridClass} style={grid}>
        {mediaColumn}
        {productColumn}
      </div>
    </EditorSection>
  );
}

export function ProductHighlight(props: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { templateId = 'index', placement = 'template', sectionId } = props;

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const catalogVariant = cfgString(config, `${settingsBase}.catalogVariant`, '');

  if (catalogVariant === 'featured-product') {
    return <FeaturedProduct {...props} />;
  }

  return <ProductHighlightDefault {...props} />;
}
