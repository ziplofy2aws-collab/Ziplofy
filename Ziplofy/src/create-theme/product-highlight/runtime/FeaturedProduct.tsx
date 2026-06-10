import { useEffect, useMemo, type CSSProperties } from 'react';
import { formatINR, useStorefront, useStorefrontProducts, useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';
import { FeaturedProductShirtIllustration } from './FeaturedProductArt';
import { readFeaturedProductAddToCartStyle } from './featuredProductAddToCartStyles';
import { readFeaturedProductBuyButtonsStyle } from './featuredProductBuyButtonsStyles';
import {
  readFeaturedProductReviewStarsStyle,
  reviewStarsTypography,
} from './featuredProductReviewStarsStyles';
import { readFeaturedProductVariantPickerStyle } from './featuredProductVariantPickerStyles';
import { readFeaturedProductHeaderBlockStyle } from './featuredProductHeaderBlockStyles';
import { readFeaturedProductHeaderPriceStyle } from './featuredProductHeaderPriceStyles';
import { readFeaturedProductHeaderTitleStyle } from './featuredProductHeaderTitleStyles';
import {
  combineResponsiveCss,
  scopedMobileHorizontalPadCss,
  scopedProductSplitMobileCss,
  sectionScopeClass,
} from '../../runtime/shared/responsive';
import { readProductHighlightLayout, scopedProductHighlightCss } from './productHighlightStyles';

function clampPercent(value: number, fallback = 100): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(1, value));
}

function detailsWidthCss(mode: string, percent: number): string {
  if (mode === 'fill') return '100%';
  if (mode === 'custom') return `${clampPercent(percent)}%`;
  return 'auto';
}

function StarRating({
  rating,
  reviewCount,
  starColor,
  countColor,
  shaded,
  showReviewCount,
  typography,
  width,
  alignment,
}: {
  rating: number;
  reviewCount: number;
  starColor: string;
  countColor: string;
  shaded: boolean;
  showReviewCount: boolean;
  typography: { fontFamily: string; fontSize: number; lineHeight: number };
  width: 'fit' | 'fill';
  alignment: 'left' | 'center' | 'right';
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    if (i < full) stars.push('★');
    else if (i === full && half) stars.push('⯨');
    else stars.push('☆');
  }

  const justify =
    alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: justify,
        gap: 8,
        width: width === 'fill' ? '100%' : 'auto',
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize,
        lineHeight: typography.lineHeight,
      }}
    >
      <span
        style={{
          color: starColor,
          letterSpacing: 1,
          opacity: shaded ? 1 : 0.92,
          filter: shaded ? 'drop-shadow(0 1px 0 rgba(0,0,0,0.08))' : undefined,
        }}
        aria-hidden
      >
        {stars.join('')}
      </span>
      {showReviewCount ? (
        <span style={{ color: countColor }}>
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      ) : null}
    </div>
  );
}

export function FeaturedProduct({
  sectionId,
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading, text: themeText, accent: themeAccent } = useThemeColors();
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

  const detailsSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.settings`
      : `sections.${sectionId}.blocks.details.settings`;

  const titleSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.header.blocks.title.settings`
      : `sections.${sectionId}.blocks.details.blocks.header.blocks.title.settings`;

  const priceSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.header.blocks.price.settings`
      : `sections.${sectionId}.blocks.details.blocks.header.blocks.price.settings`;

  const headerSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.header.settings`
      : `sections.${sectionId}.blocks.details.blocks.header.settings`;

  const reviewStarsSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.review_stars.settings`
      : `sections.${sectionId}.blocks.details.blocks.review_stars.settings`;

  const variantPickerSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.variant_picker.settings`
      : `sections.${sectionId}.blocks.details.blocks.variant_picker.settings`;

  const buyButtonsSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.buy_buttons.settings`
      : `sections.${sectionId}.blocks.details.blocks.buy_buttons.settings`;

  const addToCartSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.buy_buttons.blocks.add_to_cart.settings`
      : `sections.${sectionId}.blocks.details.blocks.buy_buttons.blocks.add_to_cart.settings`;

  const quantitySettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.buy_buttons.blocks.quantity.settings`
      : `sections.${sectionId}.blocks.details.blocks.buy_buttons.blocks.quantity.settings`;

  const acceleratedCheckoutSettingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.buy_buttons.blocks.accelerated_checkout.settings`
      : `sections.${sectionId}.blocks.details.blocks.buy_buttons.blocks.accelerated_checkout.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readProductHighlightLayout(config, settingsBase), [config, settingsBase]);

  const productId = cfgString(config, `${settingsBase}.productId`, '');
  const cachedTitle = cfgString(config, `${settingsBase}.productTitle`, 'Product title');
  const cachedPrice = cfgString(config, `${settingsBase}.price`, 'Rs. 19.99');
  const cachedImageUrl = cfgString(config, `${settingsBase}.productImageUrl`, '');
  const mediaPosition = cfgString(config, `${settingsBase}.mediaPosition`, 'left');
  const rating = cfgNumber(config, `${settingsBase}.rating`, 4.5);
  const reviewCount = cfgNumber(config, `${settingsBase}.reviewCount`, 3);
  const showTaxNote = cfgBool(config, `${settingsBase}.showTaxNote`, true);
  const taxNote = cfgString(config, `${settingsBase}.taxNote`, 'Taxes included.');
  const buttonLabel = cfgString(
    config,
    `${addToCartSettingsBase}.buttonLabel`,
    cfgString(config, `${settingsBase}.buttonLabel`, 'Sold out')
  );
  const soldOut = cfgBool(config, `${settingsBase}.soldOut`, true);

  const mediaCornerRadius = cfgNumber(config, `${mediaSettingsBase}.cornerRadius`, 0);
  const mediaFit = cfgString(config, `${mediaSettingsBase}.mediaFit`, 'contain');
  const mediaAspectRatio = cfgString(config, `${mediaSettingsBase}.aspectRatio`, 'auto');
  const mediaPaddingTop = cfgNumber(config, `${mediaSettingsBase}.paddingTop`, 0);
  const mediaPaddingBottom = cfgNumber(config, `${mediaSettingsBase}.paddingBottom`, 0);
  const mediaPaddingLeft = cfgNumber(config, `${mediaSettingsBase}.paddingLeft`, 0);
  const mediaPaddingRight = cfgNumber(config, `${mediaSettingsBase}.paddingRight`, 0);

  const detailsGap = cfgNumber(config, `${detailsSettingsBase}.layoutGap`, 31);
  const detailsHeight = cfgString(config, `${detailsSettingsBase}.height`, 'fit');
  const detailsPosition = cfgString(config, `${detailsSettingsBase}.position`, 'top');
  const detailsHeightFill = detailsHeight === 'fill';
  const detailsSticky = cfgBool(config, `${detailsSettingsBase}.stickyOnDesktop`, false);
  const detailsCornerRadius = cfgNumber(config, `${detailsSettingsBase}.cornerRadius`, 0);
  const detailsBorderStyle = cfgString(config, `${detailsSettingsBase}.borderStyle`, 'none');
  const detailsBorderThickness = cfgNumber(config, `${detailsSettingsBase}.borderThickness`, 1);
  const detailsBorderOpacity = cfgNumber(config, `${detailsSettingsBase}.borderOpacity`, 100);
  const detailsPaddingTop = cfgNumber(config, `${detailsSettingsBase}.paddingTop`, 24);
  const detailsPaddingBottom = cfgNumber(config, `${detailsSettingsBase}.paddingBottom`, 24);
  const detailsPaddingLeft = cfgNumber(config, `${detailsSettingsBase}.paddingLeft`, 0);
  const detailsPaddingRight = cfgNumber(config, `${detailsSettingsBase}.paddingRight`, 0);
  const detailsWidthMode = cfgString(config, `${detailsSettingsBase}.width`, 'fill');
  const detailsMobileWidthMode = cfgString(config, `${detailsSettingsBase}.mobileWidth`, 'fill');
  const detailsCustomWidth = cfgNumber(config, `${detailsSettingsBase}.customWidth`, 100);
  const detailsMobileCustomWidth = cfgNumber(config, `${detailsSettingsBase}.mobileCustomWidth`, 100);
  const detailsDesktopWidth = detailsWidthCss(detailsWidthMode, detailsCustomWidth);
  const detailsMobileWidth = detailsWidthCss(detailsMobileWidthMode, detailsMobileCustomWidth);
  const detailsWidthScopeId = `${sectionId}-details-width`;
  const detailsMobileWidthCss =
    detailsDesktopWidth !== detailsMobileWidth
      ? `@media (max-width: 749px) { [data-fp-details="${detailsWidthScopeId}"] { width: ${detailsMobileWidth} !important; } }`
      : '';
  const detailsBgMedia = cfgString(config, `${detailsSettingsBase}.backgroundMedia`, 'none');
  const detailsBgImageUrl = cfgString(config, `${detailsSettingsBase}.backgroundImageUrl`, '');
  const detailsBgImagePosition = cfgString(config, `${detailsSettingsBase}.backgroundImagePosition`, 'cover');
  const detailsShowBgImage = detailsBgMedia === 'image' && Boolean(detailsBgImageUrl.trim());

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
  const shellClass = sectionScopeClass('ziplofy-featured-product', sectionId);
  const splitClass = `${shellClass}-split`;
  const featuredResponsiveCss = combineResponsiveCss(
    scopedMobileHorizontalPadCss(shellClass),
    scopedProductSplitMobileCss(splitClass)
  );

  const shell: CSSProperties = {
    background: scheme.background,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    width: '100%',
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
    padding: `${40 + mediaPaddingTop}px ${32 + mediaPaddingRight}px ${40 + mediaPaddingBottom}px ${32 + mediaPaddingLeft}px`,
    order: mediaOnLeft ? 0 : 1,
    borderRadius: mediaCornerRadius,
    overflow: mediaCornerRadius > 0 ? 'hidden' : undefined,
  };

  const mediaImageStyle: CSSProperties = {
    maxWidth: '100%',
    maxHeight: 320,
    width: '100%',
    objectFit: mediaFit === 'cover' ? 'cover' : 'contain',
    display: 'block',
    borderRadius: mediaCornerRadius,
    ...(mediaAspectRatio !== 'auto' ? { aspectRatio: mediaAspectRatio } : {}),
  };

  const detailsAlignSelf = detailsHeightFill
    ? 'stretch'
    : detailsPosition === 'bottom'
      ? 'end'
      : detailsPosition === 'center'
        ? 'center'
        : 'start';

  const detailsPanelShell: CSSProperties = {
    background: scheme.panelRight,
    position: detailsSticky ? 'sticky' : 'relative',
    top: detailsSticky ? 24 : undefined,
    order: mediaOnLeft ? 1 : 0,
    maxWidth: style.limitProductDetailsWidth ? 420 : undefined,
    width: detailsDesktopWidth,
    height: detailsHeightFill ? '100%' : 'auto',
    alignSelf: detailsAlignSelf,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    borderRadius: detailsBorderStyle === 'solid' ? detailsCornerRadius : undefined,
    border:
      detailsBorderStyle === 'solid'
        ? `${detailsBorderThickness}px solid rgba(0,0,0,${Math.min(100, Math.max(0, detailsBorderOpacity)) / 100})`
        : undefined,
    overflow: detailsBorderStyle === 'solid' && detailsCornerRadius > 0 ? 'hidden' : undefined,
    minHeight: !detailsHeightFill && detailsShowBgImage ? 360 : undefined,
  };

  const detailsBgLayer: CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${detailsBgImageUrl})`,
    backgroundSize: detailsBgImagePosition === 'fit' ? 'contain' : 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 0,
    pointerEvents: 'none',
  };

  const detailsContentJustify = detailsHeightFill
    ? detailsPosition === 'bottom'
      ? 'flex-end'
      : detailsPosition === 'center'
        ? 'center'
        : 'flex-start'
    : 'flex-start';

  const detailsContent: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    flex: detailsHeightFill ? 1 : undefined,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: detailsContentJustify,
    gap: detailsGap,
    padding: `${detailsPaddingTop}px ${detailsPaddingRight}px ${detailsPaddingBottom}px ${detailsPaddingLeft}px`,
    minHeight: !detailsHeightFill && detailsShowBgImage ? 360 : undefined,
    boxSizing: 'border-box',
    width: '100%',
  };

  const reviewStarsStyle = useMemo(
    () => readFeaturedProductReviewStarsStyle(config, reviewStarsSettingsBase),
    [config, reviewStarsSettingsBase]
  );

  const reviewStarsTypographyStyle = useMemo(
    () => reviewStarsTypography(reviewStarsStyle.typographyPreset, fontBody, fontHeading),
    [reviewStarsStyle.typographyPreset, fontBody, fontHeading]
  );

  const variantPickerStyle = useMemo(
    () => readFeaturedProductVariantPickerStyle(config, variantPickerSettingsBase),
    [config, variantPickerSettingsBase]
  );

  const buyButtonsStyle = useMemo(
    () => readFeaturedProductBuyButtonsStyle(config, buyButtonsSettingsBase),
    [config, buyButtonsSettingsBase]
  );

  const addToCartStyle = useMemo(
    () => readFeaturedProductAddToCartStyle(config, addToCartSettingsBase),
    [config, addToCartSettingsBase]
  );

  const detailsButtonWrap: CSSProperties = {
    width: '100%',
    marginTop: detailsHeightFill && detailsPosition === 'top' ? 'auto' : undefined,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingTop: buyButtonsStyle.paddingTop,
    paddingBottom: buyButtonsStyle.paddingBottom,
    paddingLeft: buyButtonsStyle.paddingLeft,
    paddingRight: buyButtonsStyle.paddingRight,
    boxSizing: 'border-box',
  };

  const buyButtonsRow: CSSProperties = {
    display: 'flex',
    flexDirection: buyButtonsStyle.alwaysStackButtons ? 'column' : 'row',
    flexWrap: buyButtonsStyle.alwaysStackButtons ? 'nowrap' : 'wrap',
    gap: buyButtonsStyle.alwaysStackButtons ? 12 : 8,
    alignItems: buyButtonsStyle.alwaysStackButtons ? 'stretch' : 'center',
    width: '100%',
  };

  const titleBlockStyle = useMemo(
    () => readFeaturedProductHeaderTitleStyle(config, titleSettingsBase, fontHeading, scheme.color),
    [config, titleSettingsBase, fontHeading, scheme.color]
  );

  const titleStyle: CSSProperties = {
    margin: titleBlockStyle.margin,
    width: titleBlockStyle.width,
    maxWidth: titleBlockStyle.maxWidth,
    fontFamily: titleBlockStyle.fontFamily,
    fontSize: titleBlockStyle.fontSize,
    fontWeight: titleBlockStyle.fontWeight,
    lineHeight: titleBlockStyle.lineHeight,
    color: titleBlockStyle.color,
    background: titleBlockStyle.background,
    paddingTop: titleBlockStyle.paddingTop,
    paddingBottom: titleBlockStyle.paddingBottom,
    paddingLeft: titleBlockStyle.paddingLeft,
    paddingRight: titleBlockStyle.paddingRight,
    borderRadius: titleBlockStyle.borderRadius,
    boxSizing: 'border-box',
  };

  const priceBlockStyle = useMemo(
    () =>
      readFeaturedProductHeaderPriceStyle(config, priceSettingsBase, fontBody, {
        text: themeText,
        heading: scheme.color,
        accent: themeAccent,
        muted: scheme.muted,
      }),
    [config, priceSettingsBase, fontBody, themeText, themeAccent, scheme.color, scheme.muted]
  );

  const priceStyle: CSSProperties = {
    margin: `${priceBlockStyle.marginTop}px 0 ${priceBlockStyle.marginBottom}px`,
    width: priceBlockStyle.width,
    textAlign: priceBlockStyle.textAlign,
    fontFamily: priceBlockStyle.fontFamily,
    fontSize: priceBlockStyle.fontSize,
    fontWeight: priceBlockStyle.fontWeight,
    lineHeight: priceBlockStyle.lineHeight,
    color: priceBlockStyle.color,
    paddingTop: priceBlockStyle.paddingTop,
    paddingBottom: priceBlockStyle.paddingBottom,
    paddingLeft: priceBlockStyle.paddingLeft,
    paddingRight: priceBlockStyle.paddingRight,
    boxSizing: 'border-box',
  };

  const taxStyle: CSSProperties = {
    margin: '6px 0 0',
    fontSize: 13,
    color: scheme.muted,
    textAlign: priceBlockStyle.textAlign,
  };

  const installmentsStyle: CSSProperties = {
    margin: '4px 0 0',
    fontSize: 12,
    color: scheme.muted,
    textAlign: priceBlockStyle.textAlign,
  };

  const showTaxNoteResolved = priceBlockStyle.showTaxInformation || showTaxNote;

  const headerBlockStyle = useMemo(
    () => readFeaturedProductHeaderBlockStyle(config, headerSettingsBase),
    [config, headerSettingsBase]
  );

  const headerInner = (
    <>
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
        as="p"
        style={priceStyle}
      >
        {price}
      </EditorField>
      {priceBlockStyle.showInstallments ? (
        <p style={installmentsStyle}>Pay in installments</p>
      ) : null}
      {showTaxNoteResolved ? (
        <EditorField fieldPath={`${priceSettingsBase}.taxInformation`} label="Tax note" as="p" style={taxStyle}>
          {taxNote}
        </EditorField>
      ) : null}
    </>
  );

  const addToCartButtonStyle: CSSProperties = {
    marginTop: 0,
    width: buyButtonsStyle.alwaysStackButtons ? '100%' : 'auto',
    flex: buyButtonsStyle.alwaysStackButtons ? undefined : '1 1 auto',
    minWidth: buyButtonsStyle.alwaysStackButtons ? undefined : 160,
    padding: '14px 24px',
    border:
      addToCartStyle.style === 'secondary' && !soldOut
        ? `1px solid ${scheme.muted}88`
        : 'none',
    borderRadius: 999,
    background:
      soldOut
        ? '#6b7280'
        : addToCartStyle.style === 'secondary'
          ? '#ffffff'
          : '#111827',
    color: soldOut ? '#ffffff' : addToCartStyle.style === 'secondary' ? '#111827' : '#ffffff',
    fontSize: 15,
    fontWeight: 500,
    cursor: soldOut ? 'not-allowed' : 'pointer',
    fontFamily: fontBody,
  };

  const pickupStyle: CSSProperties = {
    margin: 0,
    fontSize: 13,
    color: scheme.muted,
    width: '100%',
  };

  const giftCardFormStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    marginTop: 4,
  };

  const giftCardInputStyle: CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${scheme.muted}55`,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: fontBody,
    boxSizing: 'border-box',
    background: scheme.background,
    color: scheme.color,
  };

  const quantityWrapStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    border: `1px solid ${scheme.muted}88`,
    borderRadius: 999,
    overflow: 'hidden',
    flex: buyButtonsStyle.alwaysStackButtons ? undefined : '0 0 auto',
    width: buyButtonsStyle.alwaysStackButtons ? '100%' : undefined,
    justifyContent: buyButtonsStyle.alwaysStackButtons ? 'center' : undefined,
  };

  const quantityBtnStyle: CSSProperties = {
    width: 40,
    height: 44,
    border: 'none',
    background: 'transparent',
    color: scheme.color,
    fontSize: 18,
    cursor: 'default',
    fontFamily: fontBody,
  };

  const quantityValueStyle: CSSProperties = {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: fontBody,
    color: scheme.color,
  };

  const variantPickerWrap: CSSProperties = {
    width: '100%',
    paddingTop: variantPickerStyle.paddingTop,
    paddingBottom: variantPickerStyle.paddingBottom,
    paddingLeft: variantPickerStyle.paddingLeft,
    paddingRight: variantPickerStyle.paddingRight,
    boxSizing: 'border-box',
    textAlign: variantPickerStyle.alignment,
  };

  const variantOptionStyle = (selected: boolean): CSSProperties => ({
    minWidth: 44,
    padding: '10px 16px',
    borderRadius: 999,
    border: `1px solid ${selected ? scheme.color : `${scheme.muted}88`}`,
    background: selected ? scheme.color : scheme.background,
    color: selected ? scheme.background : scheme.color,
    fontSize: 14,
    fontFamily: fontBody,
    cursor: 'default',
  });

  const variantSwatchStyle = (color: string, selected: boolean): CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: `2px solid ${selected ? scheme.color : 'transparent'}`,
    background: color,
    boxShadow: `inset 0 0 0 1px ${scheme.muted}55`,
    cursor: 'default',
  });

  return (
    <EditorSection
      sectionId={sectionId}
      label="Featured product"
      editorNodeId={editorNodeId}
      className={shellClass}
      style={shell}
    >
      {style.customCss ? <style>{scopedProductHighlightCss(sectionId, style.customCss)}</style> : null}
      {featuredResponsiveCss ? <style>{featuredResponsiveCss}</style> : null}
      {detailsMobileWidthCss ? <style>{detailsMobileWidthCss}</style> : null}
      {headerBlockStyle.mobileWidthCss ? <style>{headerBlockStyle.mobileWidthCss}</style> : null}
      <div style={stage}>
        <div className={splitClass} style={split}>
          <div style={mediaPanel}>
            {productImageUrl ? (
              <EditorField fieldPath={`${settingsBase}.productImageUrl`} label="Product image">
                <img src={productImageUrl} alt="" style={mediaImageStyle} />
              </EditorField>
            ) : (
              <div style={mediaAspectRatio !== 'auto' ? { aspectRatio: mediaAspectRatio, width: '100%' } : undefined}>
                <FeaturedProductShirtIllustration />
              </div>
            )}
          </div>
          <div style={detailsPanelShell} data-fp-details={detailsWidthScopeId}>
            {detailsShowBgImage ? <div aria-hidden style={detailsBgLayer} /> : null}
            <div style={detailsContent}>
              <div
                data-fp-header
                style={headerBlockStyle.shell as CSSProperties}
              >
                {headerBlockStyle.bgLayer ? (
                  <div aria-hidden style={headerBlockStyle.bgLayer as CSSProperties} />
                ) : null}
                {headerBlockStyle.overlayLayer ? (
                  <div aria-hidden style={headerBlockStyle.overlayLayer as CSSProperties} />
                ) : null}
                <div style={headerBlockStyle.content as CSSProperties}>
                  {headerBlockStyle.linkUrl.trim() ? (
                    <a
                      href={headerBlockStyle.linkUrl}
                      target={headerBlockStyle.openInNewTab ? '_blank' : undefined}
                      rel={headerBlockStyle.openInNewTab ? 'noopener noreferrer' : undefined}
                      style={{
                        display: 'flex',
                        flexDirection: 'inherit',
                        alignItems: 'inherit',
                        justifyContent: 'inherit',
                        gap: 'inherit',
                        width: '100%',
                        color: 'inherit',
                        textDecoration: 'none',
                      }}
                    >
                      {headerInner}
                    </a>
                  ) : (
                    headerInner
                  )}
                </div>
              </div>
              <EditorField
                fieldPath={`${reviewStarsSettingsBase}.style`}
                label="Review stars"
                as="div"
                data-fp-review-stars
              >
                <StarRating
                  rating={rating}
                  reviewCount={reviewCount}
                  starColor={reviewStarsStyle.style === 'shaded' ? '#111827' : scheme.color}
                  countColor={reviewStarsStyle.color === 'link' ? themeAccent : scheme.color}
                  shaded={reviewStarsStyle.style === 'shaded'}
                  showReviewCount={reviewStarsStyle.reviewCount}
                  typography={reviewStarsTypographyStyle}
                  width={reviewStarsStyle.width}
                  alignment={reviewStarsStyle.alignment}
                />
              </EditorField>
              <EditorField
                fieldPath={`${variantPickerSettingsBase}.style`}
                label="Variant picker"
                as="div"
                style={variantPickerWrap}
                data-fp-variant-picker
              >
                {variantPickerStyle.swatches ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      gap: 10,
                      justifyContent:
                        variantPickerStyle.alignment === 'center'
                          ? 'center'
                          : variantPickerStyle.alignment === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                      width: '100%',
                      marginBottom: 12,
                    }}
                  >
                    {['#111827', '#6b7280', '#d1d5db'].map((color, index) => (
                      <span
                        key={color}
                        aria-hidden
                        style={variantSwatchStyle(color, index === 0)}
                      />
                    ))}
                  </div>
                ) : null}
                <p style={{ margin: '0 0 8px', fontSize: 13, color: scheme.muted }}>Size</p>
                {variantPickerStyle.style === 'dropdown' ? (
                  <select
                    disabled
                    style={{
                      width: '100%',
                      maxWidth: 280,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1px solid ${scheme.muted}88`,
                      fontFamily: fontBody,
                      fontSize: 14,
                      background: scheme.background,
                      color: scheme.color,
                    }}
                    defaultValue="m"
                  >
                    <option value="s">Small</option>
                    <option value="m">Medium</option>
                    <option value="l">Large</option>
                  </select>
                ) : (
                  <div
                    style={{
                      display: 'inline-flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      justifyContent:
                        variantPickerStyle.alignment === 'center'
                          ? 'center'
                          : variantPickerStyle.alignment === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                      width: '100%',
                    }}
                  >
                    {['S', 'M', 'L'].map((size, index) => (
                      <button key={size} type="button" style={variantOptionStyle(index === 1)}>
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </EditorField>
              <div style={detailsButtonWrap} data-fp-buy-buttons>
                {buyButtonsStyle.showPickupAvailability ? (
                  <EditorField
                    fieldPath={`${buyButtonsSettingsBase}.showPickupAvailability`}
                    label="Pickup availability"
                    as="p"
                    style={pickupStyle}
                  >
                    Pickup available at store
                  </EditorField>
                ) : null}
                <div style={buyButtonsRow}>
                  <EditorField
                    fieldPath={quantitySettingsBase}
                    label="Quantity"
                    as="span"
                    style={{ width: buyButtonsStyle.alwaysStackButtons ? '100%' : undefined }}
                  >
                    <span style={quantityWrapStyle}>
                      <button type="button" aria-label="Decrease quantity" style={quantityBtnStyle}>
                        −
                      </button>
                      <span style={quantityValueStyle}>1</span>
                      <button type="button" aria-label="Increase quantity" style={quantityBtnStyle}>
                        +
                      </button>
                    </span>
                  </EditorField>
                  <EditorField
                    fieldPath={`${addToCartSettingsBase}.style`}
                    label="Add to cart"
                    as="span"
                    style={{ width: buyButtonsStyle.alwaysStackButtons ? '100%' : undefined }}
                  >
                    <button type="button" disabled={soldOut} style={addToCartButtonStyle}>
                      {buttonLabel}
                    </button>
                  </EditorField>
                  {!soldOut ? (
                    <EditorField
                      fieldPath={`${acceleratedCheckoutSettingsBase}.enabled`}
                      label="Accelerated checkout"
                      as="span"
                      style={{ width: buyButtonsStyle.alwaysStackButtons ? '100%' : undefined }}
                    >
                      <button
                        type="button"
                        style={{
                          ...addToCartButtonStyle,
                          background: '#ffffff',
                          color: '#111827',
                          border: `1px solid ${scheme.muted}88`,
                        }}
                      >
                        Buy it now
                      </button>
                    </EditorField>
                  ) : null}
                </div>
                {buyButtonsStyle.giftCardForm ? (
                  <EditorField
                    fieldPath={`${buyButtonsSettingsBase}.giftCardForm`}
                    label="Gift card form"
                    as="div"
                    style={giftCardFormStyle}
                  >
                    <input
                      type="email"
                      readOnly
                      placeholder="Recipient email"
                      style={giftCardInputStyle}
                      aria-label="Recipient email"
                    />
                    <textarea
                      readOnly
                      rows={2}
                      placeholder="Message (optional)"
                      style={{ ...giftCardInputStyle, resize: 'vertical' }}
                      aria-label="Gift message"
                    />
                  </EditorField>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
