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
import { cfgBool, cfgString } from '../lib/config';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { PageShell } from '../shell/PageShell';
import { layout, useThemeColors } from '../tokens';

const SEC = 'templates.product.sections.product_main';

export function ProductPage() {
  const { urlHandle } = useParams<{ urlHandle: string }>();
  const config = useThemeConfig();
  const { text, background, primary, muted, fontHeading, fontBody } = useThemeColors();
  const { storeFrontMeta } = useStorefront();
  const { productDetail, fetchProductForRoute } = useStorefrontProducts();
  const { variants, fetchVariantsByProductId } = useStorefrontProductVariants();
  const { createCartEntry } = useStorefrontCart();
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const showImage = cfgBool(config, `${SEC}.blocks.product_media.settings.showImage`, true);
  const showVendor = cfgBool(config, `${SEC}.blocks.product_header.blocks.vendor_line.settings.showVendor`, true);
  const vendorPrefix = cfgString(config, `${SEC}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`);
  const loadingLabel = cfgString(config, `${SEC}.blocks.product_header.blocks.product_title.settings.loadingLabel`);
  const showDescription = cfgBool(config, `${SEC}.blocks.product_content.blocks.description.settings.showDescription`, true);
  const priceFallback = cfgString(config, `${SEC}.blocks.product_content.blocks.price_line.settings.priceFallback`, '—');
  const addLabel = cfgString(config, `${SEC}.blocks.buy_box.blocks.add_to_cart_button.settings.label`);
  const addingLabel = cfgString(config, `${SEC}.blocks.buy_box.blocks.add_to_cart_button.settings.addingLabel`);

  useEffect(() => {
    if (!urlHandle || !storeFrontMeta?.storeId) return;
    void fetchProductForRoute(storeFrontMeta.storeId, urlHandle);
  }, [fetchProductForRoute, storeFrontMeta?.storeId, urlHandle]);

  useEffect(() => {
    if (!productDetail?._id) return;
    void fetchVariantsByProductId(productDetail._id);
  }, [fetchVariantsByProductId, productDetail?._id]);

  const selectedVariant = useMemo(() => {
    if (selectedVariantId) {
      return variants.find((v) => v._id === selectedVariantId) ?? null;
    }
    return variants[0] ?? productDetail?.variantDetails?.[0] ?? null;
  }, [productDetail?.variantDetails, selectedVariantId, variants]);

  useEffect(() => {
    if (variants.length && !selectedVariantId) {
      setSelectedVariantId(variants[0]._id);
    }
  }, [variants, selectedVariantId]);

  const handleAdd = async () => {
    if (!storeFrontMeta?.storeId || !selectedVariant) return;
    try {
      setAdding(true);
      await createCartEntry(
        { storeId: storeFrontMeta.storeId, productVariantId: selectedVariant._id, quantity },
        selectedVariant
      );
    } finally {
      setAdding(false);
    }
  };

  if (!urlHandle) return null;

  const image = productDetail?.imageUrls?.[0];

  return (
    <PageShell>
      <EditorSection
        sectionId="product_main"
        label="Product details"
        style={{ padding: `clamp(40px, 6vw, 72px) ${layout.padX}px` }}
      >
        <div
          className="hz-product__grid"
          style={{
            maxWidth: layout.maxWidth,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(32px, 5vw, 64px)',
            fontFamily: fontBody,
            color: text,
            alignItems: 'start',
          }}
        >
          <EditorBlock nodeId="template:product:product_main:block:product_media" label="Media">
            {showImage ? (
              <div
                className="hz-product__media"
                style={{
                  aspectRatio: '4 / 5',
                  borderRadius: 2,
                  background: image
                    ? `center/cover url(${image}) no-repeat`
                    : 'linear-gradient(160deg, var(--hz-surface), var(--hz-surface-2))',
                }}
              />
            ) : null}
          </EditorBlock>

          <div className="hz-product__details hz-reveal">
            <EditorBlock nodeId="template:product:product_main:block:product_header" label="Header">
              {showVendor && productDetail?.vendor?.name ? (
                <EditorBlock nodeId="template:product:product_main:block:product_header:block:vendor_line" label="Vendor">
                  <p className="hz-eyebrow" style={{ margin: '0 0 12px', color: muted }}>
                    <EditorField
                      fieldPath={`${SEC}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`}
                      label="Vendor prefix"
                      as="span"
                    >
                      {vendorPrefix}
                    </EditorField>{' '}
                    {productDetail.vendor.name}
                  </p>
                </EditorBlock>
              ) : null}
              <EditorBlock nodeId="template:product:product_main:block:product_header:block:product_title" label="Product title">
                <h1
                  style={{
                    fontFamily: fontHeading,
                    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                    margin: '0 0 20px',
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {productDetail?.title ?? (
                    <EditorField
                      fieldPath={`${SEC}.blocks.product_header.blocks.product_title.settings.loadingLabel`}
                      label="Loading label"
                    >
                      {loadingLabel}
                    </EditorField>
                  )}
                </h1>
              </EditorBlock>
            </EditorBlock>

            <EditorBlock nodeId="template:product:product_main:block:product_content" label="Content">
              {showDescription ? (
                <EditorBlock nodeId="template:product:product_main:block:product_content:block:description" label="Description">
                  <p style={{ lineHeight: 1.8, color: muted, marginBottom: 28, fontSize: 15 }}>{productDetail?.description}</p>
                </EditorBlock>
              ) : null}
              <EditorBlock nodeId="template:product:product_main:block:product_content:block:price_line" label="Price">
                <p style={{ fontSize: '1.35rem', fontWeight: 500, marginBottom: 28, letterSpacing: '-0.02em' }}>
                  {selectedVariant ? formatINR(selectedVariant.price) : productDetail ? formatINR(productDetail.price) : priceFallback}
                </p>
              </EditorBlock>
            </EditorBlock>

            <EditorBlock nodeId="template:product:product_main:block:buy_box" label="Buy box">
              {variants.length > 1 ? (
                <label style={{ display: 'block', marginBottom: 18 }}>
                  <span style={{ display: 'block', fontSize: 12, marginBottom: 8, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Variant</span>
                  <select
                    value={selectedVariant?._id ?? ''}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="hz-input"
                    style={{ width: '100%', maxWidth: 300 }}
                  >
                    {variants.map((variant) => (
                      <option key={variant._id} value={variant._id}>
                        {variant.sku || variant._id}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label style={{ display: 'block', marginBottom: 24 }}>
                <span style={{ display: 'block', fontSize: 12, marginBottom: 8, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quantity</span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="hz-input"
                  style={{ width: 96 }}
                />
              </label>
              <EditorBlock
                nodeId="template:product:product_main:block:buy_box:block:add_to_cart_button"
                label="Add to cart button"
              >
                <button
                  type="button"
                  disabled={adding || !selectedVariant}
                  onClick={() => void handleAdd()}
                  className="hz-btn hz-btn--primary"
                  style={{ fontFamily: fontBody }}
                >
                  <EditorField
                    fieldPath={`${SEC}.blocks.buy_box.blocks.add_to_cart_button.settings.label`}
                    label="Button label"
                    as="span"
                  >
                    {adding ? addingLabel : addLabel}
                  </EditorField>
                </button>
              </EditorBlock>
            </EditorBlock>
          </div>
        </div>
      </EditorSection>
    </PageShell>
  );
}
