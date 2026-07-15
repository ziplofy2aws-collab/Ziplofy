import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import {
  useStorefront,
  useStorefrontCart,
  useStorefrontProductVariants,
  useStorefrontProducts,
  useThemeConfig,
} from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { formatThemePrice } from '../../runtime/shared/themePricesRuntime';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
import {
  combineResponsiveCss,
  mobileMedia,
  sectionScopeClass,
} from '../../runtime/shared/responsive';
import type { SectionRuntimeProps } from '../../runtime/types';

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function blockNodeId(templateId: string, sectionId: string, ...parts: string[]): string {
  return `template:${templateId}:${sectionId}:block:${parts.join(':block:')}`;
}

function AddToCartBagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    </svg>
  );
}

function contrastOn(bg: string): string {
  const hex = bg.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#ffffff';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#111827' : '#ffffff';
}

export function ProductMain({
  sectionId = 'product_main',
  templateId = 'product',
}: SectionRuntimeProps) {
  const { maxWidth, padX, padXMobile } = useThemeLayout();
  const params = useParams<{ id?: string; urlHandle?: string }>();
  const routeParam = params.urlHandle ?? params.id;
  const config = useThemeConfig();
  const { text, background, primary, muted, border, fontHeading, fontBody } = useThemeColors();
  const { storeFrontMeta } = useStorefront();
  const { products, productDetail, fetchProductForRoute, fetchProductById } = useStorefrontProducts();
  const { variants, fetchVariantsByProductId } = useStorefrontProductVariants();
  const { createCartEntry } = useStorefrontCart();
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const base = secBase(templateId, sectionId);
  const scopeClass = sectionScopeClass('codiic-product-main', sectionId);

  const showImage = cfgBool(config, `${base}.blocks.product_media.settings.showImage`, true);
  const showVendor = cfgBool(
    config,
    `${base}.blocks.product_header.blocks.vendor_line.settings.showVendor`,
    true
  );
  const vendorPrefix = cfgString(
    config,
    `${base}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`,
    'Sold by'
  );
  const loadingLabel = cfgString(
    config,
    `${base}.blocks.product_header.blocks.product_title.settings.loadingLabel`,
    'Loading…'
  );
  const showDescription = cfgBool(
    config,
    `${base}.blocks.product_content.blocks.description.settings.showDescription`,
    true
  );
  const priceFallback = cfgString(
    config,
    `${base}.blocks.product_content.blocks.price_line.settings.priceFallback`,
    '—'
  );
  const addLabel =
    cfgString(config, `${base}.blocks.buy_box.blocks.add_to_cart_button.settings.label`, '').trim() ||
    'Add to cart';
  const addingLabel =
    cfgString(
      config,
      `${base}.blocks.buy_box.blocks.add_to_cart_button.settings.addingLabel`,
      ''
    ).trim() || 'Adding…';
  const qtyLabel = cfgString(
    config,
    `${base}.blocks.buy_box.blocks.quantity_field.settings.label`,
    'Quantity'
  );
  const buyNowLabel =
    cfgString(config, `${base}.blocks.buy_box.blocks.buy_now_button.settings.label`, '').trim() ||
    'Buy now';
  const buyNowHref = cfgString(config, `${base}.blocks.buy_box.blocks.buy_now_button.settings.href`, '');
  const shippingBadge = cfgString(
    config,
    `${base}.blocks.trust_badges.blocks.shipping_badge.settings.text`,
    ''
  );
  const returnsBadge = cfgString(
    config,
    `${base}.blocks.trust_badges.blocks.returns_badge.settings.text`,
    ''
  );
  const paddingTop = cfgNumber(config, `${base}.settings.paddingTop`, 48);
  const paddingBottom = cfgNumber(config, `${base}.settings.paddingBottom`, 48);

  const storeId = storeFrontMeta?.storeId;

  useEffect(() => {
    if (!storeId) return;
    if (!routeParam || routeParam === 'preview') {
      const fallbackId = products[0]?._id;
      if (fallbackId) void fetchProductById(fallbackId);
      return;
    }
    void fetchProductForRoute(storeId, routeParam);
  }, [storeId, routeParam, products, fetchProductById, fetchProductForRoute]);

  const resolvedProductId = productDetail?._id ?? products[0]?._id ?? null;

  useEffect(() => {
    if (!resolvedProductId) return;
    void fetchVariantsByProductId(resolvedProductId);
  }, [resolvedProductId, fetchVariantsByProductId]);

  const selectedVariant = useMemo(
    () => variants[0] ?? productDetail?.variantDetails?.[0],
    [productDetail?.variantDetails, variants]
  );

  const handleAdd = async () => {
    if (!storeId || !selectedVariant) return;
    try {
      setAdding(true);
      await createCartEntry(
        {
          storeId,
          productVariantId: selectedVariant._id,
          quantity: Math.max(1, quantity),
        },
        selectedVariant
      );
    } finally {
      setAdding(false);
    }
  };

  const image = productDetail?.imageUrls?.[0];
  const sectionNodeId = `template:${templateId}:${sectionId}`;
  const buttonBg = primary || '#111827';
  const buttonFg = contrastOn(buttonBg);
  const canAdd = Boolean(selectedVariant) && !adding;

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

  const responsiveCss = combineResponsiveCss(
    mobileMedia(`
      .${scopeClass} {
        padding-left: ${padXMobile}px !important;
        padding-right: ${padXMobile}px !important;
      }
      .${scopeClass} .codiic-pm-grid {
        grid-template-columns: 1fr !important;
        gap: 28px !important;
      }
    `)
  );

  const primaryButtonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    padding: '14px 28px',
    borderRadius: 10,
    border: 'none',
    background: buttonBg,
    color: buttonFg,
    fontWeight: 600,
    fontSize: 15,
    lineHeight: 1.2,
    cursor: canAdd ? 'pointer' : 'not-allowed',
    opacity: canAdd ? 1 : 0.55,
    fontFamily: fontBody,
    boxSizing: 'border-box',
  };

  const secondaryButtonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    padding: '14px 28px',
    borderRadius: 10,
    border: `1px solid ${border || 'rgba(17,24,39,0.16)'}`,
    background: '#ffffff',
    color: text || '#111827',
    fontWeight: 600,
    fontSize: 15,
    lineHeight: 1.2,
    textDecoration: 'none',
    fontFamily: fontBody,
    boxSizing: 'border-box',
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Product details"
      editorNodeId={sectionNodeId}
      className={scopeClass}
      style={shellStyle}
    >
      <style>{responsiveCss}</style>
      <div
        className="codiic-pm-grid"
        style={{
          maxWidth,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 40,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'product_media')} label="Media">
          {showImage ? (
            <div
              style={{
                aspectRatio: '3 / 4',
                borderRadius: 12,
                border: `1px solid ${border || 'rgba(17,24,39,0.12)'}`,
                overflow: 'hidden',
                background: image
                  ? `center / cover no-repeat url(${image})`
                  : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                width: '100%',
              }}
            />
          ) : null}
        </EditorBlock>

        <div style={{ minWidth: 0 }}>
          <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'product_header')} label="Header">
            {showVendor && productDetail?.vendor?.name ? (
              <EditorBlock
                nodeId={blockNodeId(templateId, sectionId, 'product_header', 'vendor_line')}
                label="Vendor"
              >
                <p
                  style={{
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    opacity: 0.6,
                    margin: 0,
                  }}
                >
                  <EditorField
                    fieldPath={`${base}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`}
                    label="Vendor prefix"
                    as="span"
                  >
                    {vendorPrefix}
                  </EditorField>{' '}
                  {productDetail.vendor.name}
                </p>
              </EditorBlock>
            ) : null}
            <EditorBlock
              nodeId={blockNodeId(templateId, sectionId, 'product_header', 'product_title')}
              label="Product title"
            >
              <h1
                style={{
                  fontFamily: fontHeading,
                  fontSize: 'clamp(1.75rem, 2.4vw, 2rem)',
                  margin: '8px 0 16px',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {productDetail?.title ?? (
                  <EditorField
                    fieldPath={`${base}.blocks.product_header.blocks.product_title.settings.loadingLabel`}
                    label="Loading label"
                  >
                    {loadingLabel}
                  </EditorField>
                )}
              </h1>
            </EditorBlock>
          </EditorBlock>

          <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'product_content')} label="Content">
            {showDescription && productDetail?.description ? (
              <EditorBlock
                nodeId={blockNodeId(templateId, sectionId, 'product_content', 'description')}
                label="Description"
              >
                <ThemeEditorRichTextContent
                  html={productDetail.description}
                  style={{ lineHeight: 1.7, opacity: 0.85, marginBottom: 24 }}
                />
              </EditorBlock>
            ) : null}
            <EditorBlock
              nodeId={blockNodeId(templateId, sectionId, 'product_content', 'price_line')}
              label="Price"
            >
              <p style={{ fontSize: 24, fontWeight: 600, margin: '0 0 24px' }}>
                {productDetail
                  ? formatThemePrice(config, productDetail.price, 'productPages')
                  : priceFallback}
              </p>
            </EditorBlock>
          </EditorBlock>

          <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'buy_box')} label="Buy box">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <EditorBlock
                nodeId={blockNodeId(templateId, sectionId, 'buy_box', 'quantity_field')}
                label="Quantity"
              >
                <label style={{ display: 'block', fontSize: 14 }}>
                  <EditorField
                    fieldPath={`${base}.blocks.buy_box.blocks.quantity_field.settings.label`}
                    label="Quantity label"
                    as="span"
                  >
                    {qtyLabel}
                  </EditorField>
                  <span
                    style={{
                      marginTop: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: `1px solid ${border || 'rgba(17,24,39,0.16)'}`,
                      borderRadius: 10,
                      overflow: 'hidden',
                      height: 44,
                    }}
                  >
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{
                        width: 40,
                        height: '100%',
                        border: 'none',
                        background: 'transparent',
                        color: text,
                        fontSize: 18,
                        cursor: 'pointer',
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        minWidth: 36,
                        textAlign: 'center',
                        fontWeight: 600,
                        color: text,
                      }}
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity((q) => q + 1)}
                      style={{
                        width: 40,
                        height: '100%',
                        border: 'none',
                        background: 'transparent',
                        color: text,
                        fontSize: 18,
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                  </span>
                </label>
              </EditorBlock>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'stretch',
                }}
              >
                <EditorBlock
                  nodeId={blockNodeId(templateId, sectionId, 'buy_box', 'add_to_cart_button')}
                  label="Add to cart button"
                  style={{ flex: '1 1 180px' }}
                >
                  <button
                    type="button"
                    disabled={!canAdd}
                    onClick={() => void handleAdd()}
                    style={{ ...primaryButtonStyle, width: '100%' }}
                  >
                    {!adding ? <AddToCartBagIcon /> : null}
                    <EditorField
                      fieldPath={`${base}.blocks.buy_box.blocks.add_to_cart_button.settings.label`}
                      label="Button label"
                      as="span"
                      style={{ color: 'inherit', fontWeight: 600 }}
                    >
                      {adding ? addingLabel : addLabel}
                    </EditorField>
                  </button>
                </EditorBlock>

                <EditorBlock
                  nodeId={blockNodeId(templateId, sectionId, 'buy_box', 'buy_now_button')}
                  label="Buy now button"
                  style={{ flex: '1 1 140px' }}
                >
                  <a
                    href={buyNowHref || '/checkout'}
                    style={{ ...secondaryButtonStyle, width: '100%' }}
                  >
                    <EditorField
                      fieldPath={`${base}.blocks.buy_box.blocks.buy_now_button.settings.label`}
                      label="Buy now label"
                      as="span"
                      style={{ color: 'inherit', fontWeight: 600 }}
                    >
                      {buyNowLabel}
                    </EditorField>
                  </a>
                </EditorBlock>
              </div>
            </div>
          </EditorBlock>

          {(shippingBadge || returnsBadge) && (
            <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'trust_badges')} label="Trust badges">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginTop: 24,
                  fontSize: 13,
                  color: muted || text,
                  opacity: 0.85,
                }}
              >
                {shippingBadge ? (
                  <EditorBlock
                    nodeId={blockNodeId(templateId, sectionId, 'trust_badges', 'shipping_badge')}
                    label="Shipping badge"
                  >
                    <EditorField
                      fieldPath={`${base}.blocks.trust_badges.blocks.shipping_badge.settings.text`}
                      label="Shipping badge text"
                      as="span"
                    >
                      {shippingBadge}
                    </EditorField>
                  </EditorBlock>
                ) : null}
                {returnsBadge ? (
                  <EditorBlock
                    nodeId={blockNodeId(templateId, sectionId, 'trust_badges', 'returns_badge')}
                    label="Returns badge"
                  >
                    <EditorField
                      fieldPath={`${base}.blocks.trust_badges.blocks.returns_badge.settings.text`}
                      label="Returns badge text"
                      as="span"
                    >
                      {returnsBadge}
                    </EditorField>
                  </EditorBlock>
                ) : null}
              </div>
            </EditorBlock>
          )}
        </div>
      </div>
    </EditorSection>
  );
}
