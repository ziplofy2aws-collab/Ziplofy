import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getThemeConfigValue,
  useStorefront,
  useStorefrontCart,
  useStorefrontProductVariants,
  useStorefrontProducts,
  useThemeConfig,
  useThemeEditorPreview,
} from '@render-store/sdk';
import { FEATURED_PRODUCT_BUY_BUTTONS_NESTED_ORDER } from '../../../utils/featured-product-sidebar.util';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { formatThemePrice } from '../../runtime/shared/themePricesRuntime';
import { resolveThemeVariantPickerOptionStyle } from '../../runtime/shared/themeVariantPickersRuntime';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
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

function AddToCartBagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12l-1.2 11.4a1 1 0 0 1-1 .6H8.2a1 1 0 0 1-1-.6L6 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6a3 3 0 1 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.5 15.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const { fontBody, fontHeading, text: themeText, accent: themeAccent } = useThemeColors();
  const { storeFrontMeta } = useStorefront();
  const { products, fetchProductsByStoreId, fetchProductById, productDetail } = useStorefrontProducts();
  const { variants, fetchVariantsByProductId } = useStorefrontProductVariants();
  const { createCartEntry } = useStorefrontCart();
  const isEditorPreview = useThemeEditorPreview();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [adding, setAdding] = useState(false);

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

  const buyButtonsBlocksBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.blocks.details.blocks.buy_buttons`
      : `sections.${sectionId}.blocks.details.blocks.buy_buttons`;

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
  const configuredAddToCartLabel = cfgString(
    config,
    `${addToCartSettingsBase}.buttonLabel`,
    cfgString(config, `${settingsBase}.buttonLabel`, 'Add to cart')
  );

  const mediaCornerRadius = cfgNumber(config, `${mediaSettingsBase}.cornerRadius`, 0);
  const mediaFit = cfgString(config, `${mediaSettingsBase}.mediaFit`, 'cover');
  const mediaAspectRatio = cfgString(config, `${mediaSettingsBase}.aspectRatio`, 'auto');
  const mediaPaddingTop = cfgNumber(config, `${mediaSettingsBase}.paddingTop`, 0);
  const mediaPaddingBottom = cfgNumber(config, `${mediaSettingsBase}.paddingBottom`, 0);
  const mediaPaddingLeft = cfgNumber(config, `${mediaSettingsBase}.paddingLeft`, 0);
  const mediaPaddingRight = cfgNumber(config, `${mediaSettingsBase}.paddingRight`, 0);

  const detailsGap = cfgNumber(config, `${detailsSettingsBase}.layoutGap`, 28);
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
  const detailsBgColor = cfgString(config, `${detailsSettingsBase}.backgroundColor`, 'default');
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
    // Always fetch by id so picker selection shows even when the product is
    // outside PreviewProductsLoader's first page / shared list.
    void fetchProductById(productId);
  }, [productId, fetchProductById]);

  useEffect(() => {
    if (!productId) return;
    void fetchVariantsByProductId(productId);
  }, [productId, fetchVariantsByProductId]);

  useEffect(() => {
    setSelectedVariantIndex(0);
    setQuantity(1);
  }, [productId]);

  const resolvedProduct = useMemo(() => {
    if (!productId) return null;
    if (productDetail?._id === productId) return productDetail;
    return products.find((p) => p._id === productId) ?? null;
  }, [productId, productDetail, products]);

  const variantOptions = useMemo(() => {
    if (variants.length > 0) {
      return variants.map((variant, index) => ({
        key: variant._id,
        label:
          Object.values(variant.optionValues ?? {})
            .filter(Boolean)
            .join(' / ') || `Option ${index + 1}`,
      }));
    }
    if (productDetail?._id === productId && productDetail.variantDetails?.length) {
      return productDetail.variantDetails.map((variant, index) => ({
        key: variant._id,
        label:
          Object.values(variant.optionValues ?? {})
            .filter(Boolean)
            .join(' / ') || `Option ${index + 1}`,
      }));
    }
    // Editor placeholder only when no product is selected yet.
    if (!productId) {
      return ['S', 'M', 'L'].map((size) => ({ key: size, label: size }));
    }
    return [];
  }, [variants, productDetail, productId]);

  const selectedVariant = useMemo(() => {
    if (variants.length > 0) return variants[selectedVariantIndex] ?? variants[0] ?? null;
    if (productDetail?._id === productId && productDetail.variantDetails?.length) {
      return productDetail.variantDetails[selectedVariantIndex] ?? productDetail.variantDetails[0] ?? null;
    }
    return null;
  }, [variants, productDetail, productId, selectedVariantIndex]);

  // Prefer picker-written cache fields immediately; fall back to live product / variant data.
  const productTitle =
    (cachedTitle && cachedTitle !== 'Product title' ? cachedTitle : null) ??
    resolvedProduct?.title ??
    cachedTitle;
  const price = selectedVariant
    ? formatThemePrice(config, selectedVariant.price, 'productCards')
    : resolvedProduct
      ? formatThemePrice(config, resolvedProduct.price, 'productCards')
      : cachedPrice;
  const productImageUrl =
    selectedVariant?.images?.[0] ??
    resolvedProduct?.imageUrls?.[0] ??
    cachedImageUrl;

  // Skip inventory / status gating for now — always show Add to cart + Buy it now.
  const soldOut = false;

  const addToCartLabel = soldOut
    ? 'Sold out'
    : configuredAddToCartLabel === 'Sold out'
      ? 'Add to cart'
      : configuredAddToCartLabel;

  const buyButtonsBlockOrder = useMemo(() => {
    const order = getThemeConfigValue(config, `${buyButtonsBlocksBase}.block_order`);
    return Array.isArray(order) ? (order as string[]) : [...FEATURED_PRODUCT_BUY_BUTTONS_NESTED_ORDER];
  }, [config, buyButtonsBlocksBase]);

  const showQuantityBlock = buyButtonsBlockOrder.includes('quantity');
  const showAddToCartBlock = buyButtonsBlockOrder.includes('add_to_cart');
  const showBuyItNowBlock =
    buyButtonsBlockOrder.includes('accelerated_checkout') &&
    cfgBool(config, `${acceleratedCheckoutSettingsBase}.enabled`, true);

  const canPurchase = Boolean(!soldOut && !isEditorPreview && storeId && selectedVariant);

  const handleAddToCart = useCallback(async () => {
    if (!canPurchase || adding || !selectedVariant) return;
    try {
      setAdding(true);
      await createCartEntry(
        { storeId, productVariantId: selectedVariant._id, quantity },
        selectedVariant
      );
    } finally {
      setAdding(false);
    }
  }, [adding, canPurchase, createCartEntry, quantity, selectedVariant, storeId]);

  const handleBuyItNow = useCallback(async () => {
    if (!canPurchase || adding || !selectedVariant) return;
    try {
      setAdding(true);
      await createCartEntry(
        { storeId, productVariantId: selectedVariant._id, quantity },
        selectedVariant
      );
      navigate('/cart');
    } finally {
      setAdding(false);
    }
  }, [adding, canPurchase, createCartEntry, navigate, quantity, selectedVariant, storeId]);

  const scheme = style.scheme;
  const detailsResolvedBackground =
    detailsShowBgImage || !detailsBgColor || detailsBgColor === 'default'
      ? scheme.panelRight
      : detailsBgColor;
  const mediaOnLeft = mediaPosition !== 'right';
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const gridCols = style.equalColumns ? '1fr 1fr' : '1.05fr 0.95fr';
  const shellClass = sectionScopeClass('codiic-featured-product', sectionId);
  const splitClass = `${shellClass}-split`;
  const featuredResponsiveCss = combineResponsiveCss(
    scopedMobileHorizontalPadCss(shellClass),
    scopedProductSplitMobileCss(splitClass)
  );

  const shell: CSSProperties = {
    background:
      !style.backgroundColor || style.backgroundColor === 'default'
        ? scheme.background
        : style.backgroundColor,
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
    background: detailsResolvedBackground,
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
    borderRadius:
      detailsBorderStyle === 'solid'
        ? detailsCornerRadius
        : detailsCornerRadius > 0
          ? detailsCornerRadius
          : undefined,
    border:
      detailsBorderStyle === 'solid'
        ? `${detailsBorderThickness}px solid rgba(0,0,0,${Math.min(100, Math.max(0, detailsBorderOpacity)) / 100})`
        : undefined,
    overflow:
      (detailsBorderStyle === 'solid' || detailsShowBgImage) && detailsCornerRadius > 0
        ? 'hidden'
        : undefined,
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
    () => readFeaturedProductReviewStarsStyle(config, reviewStarsSettingsBase, scheme.color, themeAccent),
    [config, reviewStarsSettingsBase, scheme.color, themeAccent]
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
    flexWrap: buyButtonsStyle.alwaysStackButtons ? 'nowrap' : 'nowrap',
    gap: 12,
    alignItems: buyButtonsStyle.alwaysStackButtons ? 'stretch' : 'center',
    width: '100%',
  };

  const actionButtonBase: CSSProperties = {
    marginTop: 0,
    height: 48,
    padding: '0 20px',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    fontFamily: fontBody,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: buyButtonsStyle.alwaysStackButtons ? undefined : '1 1 0',
    width: buyButtonsStyle.alwaysStackButtons ? '100%' : undefined,
    minWidth: buyButtonsStyle.alwaysStackButtons ? undefined : 0,
    boxSizing: 'border-box',
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

  const titleRowStyle: CSSProperties = { ...titleStyle, margin: 0, flex: '1 1 auto', minWidth: 0 };
  const priceRowStyle: CSSProperties = {
    ...priceStyle,
    margin: 0,
    flex: '0 0 auto',
    whiteSpace: 'nowrap',
    textAlign: 'right',
  };

  const headerInner = (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          width: '100%',
        }}
      >
        <EditorField
          fieldPath={`${titleSettingsBase}.typographyPreset`}
          label="Product title"
          as="h2"
          style={titleRowStyle}
        >
          {productTitle}
        </EditorField>
        <EditorField
          fieldPath={`${priceSettingsBase}.typographyPreset`}
          label="Price"
          as="p"
          style={priceRowStyle}
        >
          {price}
        </EditorField>
      </div>
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
    ...actionButtonBase,
    border: soldOut
      ? 'none'
      : addToCartStyle.style === 'secondary'
        ? '1px solid #111827'
        : 'none',
    background: soldOut ? '#9ca3af' : addToCartStyle.style === 'secondary' ? '#ffffff' : '#111827',
    color: soldOut ? '#ffffff' : addToCartStyle.style === 'secondary' ? '#111827' : '#ffffff',
    cursor: soldOut || adding ? 'not-allowed' : 'pointer',
    opacity: adding ? 0.75 : 1,
  };

  const buyItNowButtonStyle: CSSProperties = {
    ...actionButtonBase,
    border: 'none',
    background: '#111827',
    color: '#ffffff',
    cursor: adding ? 'wait' : 'pointer',
    opacity: adding ? 0.75 : 1,
  };

  const pickupStyle: CSSProperties = {
    margin: 0,
    fontSize: 13,
    color: scheme.muted,
    width: '100%',
  };

  const quantityWrapStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    border: `1px solid ${scheme.muted}88`,
    borderRadius: 12,
    overflow: 'hidden',
    flex: buyButtonsStyle.alwaysStackButtons ? undefined : '0 0 auto',
    width: buyButtonsStyle.alwaysStackButtons ? '100%' : undefined,
    justifyContent: buyButtonsStyle.alwaysStackButtons ? 'center' : undefined,
    height: 48,
    boxSizing: 'border-box',
  };

  const quantityBtnStyle: CSSProperties = {
    width: 40,
    height: '100%',
    border: 'none',
    background: 'transparent',
    color: scheme.color,
    fontSize: 18,
    cursor: soldOut || isEditorPreview ? 'default' : 'pointer',
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
    padding: '10px 16px',
    fontSize: 14,
    fontFamily: fontBody,
    cursor: isEditorPreview ? 'default' : 'pointer',
    ...resolveThemeVariantPickerOptionStyle(config, selected),
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
                  countColor={reviewStarsStyle.textColor}
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
                <p style={{ margin: '0 0 8px', fontSize: 13, color: scheme.muted }}>Size</p>
                {variantPickerStyle.style === 'dropdown' ? (
                  <select
                    aria-label="Variant"
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
                    value={variantOptions[selectedVariantIndex]?.key ?? ''}
                    onChange={(e) => {
                      const next = variantOptions.findIndex((option) => option.key === e.target.value);
                      if (next >= 0) setSelectedVariantIndex(next);
                    }}
                  >
                    {variantOptions.length ? (
                      variantOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))
                    ) : (
                      <option value="">No variants</option>
                    )}
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
                    {variantOptions.map((option, index) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`codiic-variant-picker-option${
                          index === selectedVariantIndex
                            ? ' codiic-variant-picker-option--selected'
                            : ''
                        }`}
                        style={variantOptionStyle(index === selectedVariantIndex)}
                        onClick={() => setSelectedVariantIndex(index)}
                      >
                        {option.label}
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
                  {showQuantityBlock ? (
                    <EditorField
                      fieldPath={quantitySettingsBase}
                      label="Quantity"
                      as="span"
                      style={{ width: buyButtonsStyle.alwaysStackButtons ? '100%' : undefined }}
                    >
                      <span style={quantityWrapStyle}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          style={quantityBtnStyle}
                          disabled={soldOut || isEditorPreview}
                          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                        >
                          −
                        </button>
                        <span style={quantityValueStyle}>{quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          style={quantityBtnStyle}
                          disabled={soldOut || isEditorPreview}
                          onClick={() => setQuantity((value) => value + 1)}
                        >
                          +
                        </button>
                      </span>
                    </EditorField>
                  ) : null}
                  {showAddToCartBlock ? (
                    <EditorField
                      fieldPath={`${addToCartSettingsBase}.style`}
                      label="Add to cart"
                      as="span"
                      style={{ width: buyButtonsStyle.alwaysStackButtons ? '100%' : undefined }}
                    >
                      <button
                        type="button"
                        disabled={soldOut || adding}
                        style={addToCartButtonStyle}
                        onClick={() => void handleAddToCart()}
                      >
                        {!soldOut ? <AddToCartBagIcon /> : null}
                        {addToCartLabel}
                      </button>
                    </EditorField>
                  ) : null}
                  {showBuyItNowBlock && !soldOut ? (
                    <EditorField
                      fieldPath={`${acceleratedCheckoutSettingsBase}.enabled`}
                      label="Accelerated checkout"
                      as="span"
                      style={{ width: buyButtonsStyle.alwaysStackButtons ? '100%' : undefined }}
                    >
                      <button
                        type="button"
                        disabled={adding}
                        style={buyItNowButtonStyle}
                        onClick={() => void handleBuyItNow()}
                      >
                        Buy it now
                      </button>
                    </EditorField>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
