import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  formatINR,
  useStorefront,
  useStorefrontCart,
  useStorefrontProductVariants,
  useStorefrontProducts,
  useThemeConfig,
} from '@render-store/sdk';
import { cfgBool, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function blockNodeId(templateId: string, sectionId: string, ...parts: string[]): string {
  return `template:${templateId}:${sectionId}:block:${parts.join(':block:')}`;
}

export function ProductMain({
  sectionId = 'product_main',
  templateId = 'product',
}: SectionRuntimeProps) {
  const { id: routeId } = useParams<{ id: string }>();
  const config = useThemeConfig();
  const { text, background, primary, fontHeading, fontBody } = useThemeColors();
  const { storeFrontMeta } = useStorefront();
  const { products, productDetail, fetchProductById } = useStorefrontProducts();
  const { variants, fetchVariantsByProductId } = useStorefrontProductVariants();
  const { createCartEntry } = useStorefrontCart();
  const [adding, setAdding] = useState(false);

  const base = secBase(templateId, sectionId);

  const showImage = cfgBool(config, `${base}.blocks.product_media.settings.showImage`, true);
  const showVendor = cfgBool(
    config,
    `${base}.blocks.product_header.blocks.vendor_line.settings.showVendor`,
    true
  );
  const vendorPrefix = cfgString(
    config,
    `${base}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`
  );
  const loadingLabel = cfgString(
    config,
    `${base}.blocks.product_header.blocks.product_title.settings.loadingLabel`
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
  const addLabel = cfgString(config, `${base}.blocks.buy_box.blocks.add_to_cart_button.settings.label`);
  const addingLabel = cfgString(
    config,
    `${base}.blocks.buy_box.blocks.add_to_cart_button.settings.addingLabel`
  );
  const qtyLabel = cfgString(config, `${base}.blocks.buy_box.blocks.quantity_field.settings.label`, 'Quantity');
  const buyNowLabel = cfgString(config, `${base}.blocks.buy_box.blocks.buy_now_button.settings.label`, 'Buy now');
  const buyNowHref = cfgString(config, `${base}.blocks.buy_box.blocks.buy_now_button.settings.href`, '');
  const shippingBadge = cfgString(
    config,
    `${base}.blocks.trust_badges.blocks.shipping_badge.settings.text`
  );
  const returnsBadge = cfgString(config, `${base}.blocks.trust_badges.blocks.returns_badge.settings.text`);

  const productId = useMemo(() => {
    if (routeId && routeId !== 'preview') return routeId;
    return products[0]?._id ?? routeId ?? null;
  }, [routeId, products]);

  useEffect(() => {
    if (!productId) return;
    void fetchProductById(productId);
    void fetchVariantsByProductId(productId);
  }, [fetchProductById, fetchVariantsByProductId, productId]);

  const selectedVariant = useMemo(
    () => variants[0] ?? productDetail?.variantDetails?.[0],
    [productDetail?.variantDetails, variants]
  );

  const handleAdd = async () => {
    if (!storeFrontMeta?.storeId || !selectedVariant) return;
    try {
      setAdding(true);
      await createCartEntry(
        { storeId: storeFrontMeta.storeId, productVariantId: selectedVariant._id, quantity: 1 },
        selectedVariant
      );
    } finally {
      setAdding(false);
    }
  };

  const image = productDetail?.imageUrls?.[0];
  const sectionNodeId = `template:${templateId}:${sectionId}`;

  return (
    <EditorSection
      sectionId={sectionId}
      label="Product details"
      editorNodeId={sectionNodeId}
      style={{ padding: `48px ${layout.padX}px` }}
    >
      <div
        style={{
          maxWidth: layout.maxWidth,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 40,
          fontFamily: fontBody,
          color: text,
        }}
      >
        <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'product_media')} label="Media">
          {showImage ? (
            <div
              style={{
                aspectRatio: '3/4',
                borderRadius: 12,
                border: `1px solid ${layout.line}`,
                background: image
                  ? `center/cover url(${image}) no-repeat`
                  : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              }}
            />
          ) : null}
        </EditorBlock>

        <div>
          <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'product_header')} label="Header">
            {showVendor && productDetail?.vendor?.name ? (
              <EditorBlock
                nodeId={blockNodeId(templateId, sectionId, 'product_header', 'vendor_line')}
                label="Vendor"
              >
                <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>
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
              <h1 style={{ fontFamily: fontHeading, fontSize: 32, margin: '8px 0 16px', fontWeight: 600 }}>
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
            {showDescription ? (
              <EditorBlock
                nodeId={blockNodeId(templateId, sectionId, 'product_content', 'description')}
                label="Description"
              >
                <p style={{ lineHeight: 1.7, opacity: 0.85, marginBottom: 24 }}>{productDetail?.description}</p>
              </EditorBlock>
            ) : null}
            <EditorBlock
              nodeId={blockNodeId(templateId, sectionId, 'product_content', 'price_line')}
              label="Price"
            >
              <p style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
                {productDetail ? formatINR(productDetail.price) : priceFallback}
              </p>
            </EditorBlock>
          </EditorBlock>

          <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'buy_box')} label="Buy box">
            <EditorBlock
              nodeId={blockNodeId(templateId, sectionId, 'buy_box', 'quantity_field')}
              label="Quantity"
            >
              <label style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
                <EditorField
                  fieldPath={`${base}.blocks.buy_box.blocks.quantity_field.settings.label`}
                  label="Quantity label"
                  as="span"
                >
                  {qtyLabel}
                </EditorField>
                <input
                  type="number"
                  min={1}
                  defaultValue={1}
                  readOnly
                  style={{
                    display: 'block',
                    marginTop: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${layout.line}`,
                    width: 80,
                  }}
                />
              </label>
            </EditorBlock>
            <EditorBlock
              nodeId={blockNodeId(templateId, sectionId, 'buy_box', 'add_to_cart_button')}
              label="Add to cart button"
            >
              <button
                type="button"
                disabled={adding || !selectedVariant}
                onClick={() => void handleAdd()}
                style={{
                  padding: '14px 28px',
                  borderRadius: 8,
                  border: 'none',
                  background: primary,
                  color: background,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: fontBody,
                  marginRight: 12,
                }}
              >
                <EditorField
                  fieldPath={`${base}.blocks.buy_box.blocks.add_to_cart_button.settings.label`}
                  label="Button label"
                  as="span"
                >
                  {adding ? addingLabel : addLabel}
                </EditorField>
              </button>
            </EditorBlock>
            <EditorBlock
              nodeId={blockNodeId(templateId, sectionId, 'buy_box', 'buy_now_button')}
              label="Buy now button"
            >
              <a
                href={buyNowHref || '#'}
                style={{
                  display: 'inline-block',
                  padding: '14px 28px',
                  borderRadius: 8,
                  border: `1px solid ${layout.line}`,
                  color: text,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontFamily: fontBody,
                }}
              >
                <EditorField
                  fieldPath={`${base}.blocks.buy_box.blocks.buy_now_button.settings.label`}
                  label="Buy now label"
                  as="span"
                >
                  {buyNowLabel}
                </EditorField>
              </a>
            </EditorBlock>
          </EditorBlock>

          {(shippingBadge || returnsBadge) && (
            <EditorBlock nodeId={blockNodeId(templateId, sectionId, 'trust_badges')} label="Trust badges">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24, fontSize: 13, opacity: 0.8 }}>
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
