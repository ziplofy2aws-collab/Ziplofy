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
  const { id } = useParams<{ id: string }>();
  const config = useThemeConfig();
  const { text, background, primary, fontHeading, fontBody } = useThemeColors();
  const { storeFrontMeta } = useStorefront();
  const { productDetail, fetchProductById } = useStorefrontProducts();
  const { variants, fetchVariantsByProductId } = useStorefrontProductVariants();
  const { createCartEntry } = useStorefrontCart();
  const [adding, setAdding] = useState(false);

  const showImage = cfgBool(config, `${SEC}.blocks.product_media.settings.showImage`, true);
  const showVendor = cfgBool(config, `${SEC}.blocks.product_header.blocks.vendor_line.settings.showVendor`, true);
  const vendorPrefix = cfgString(config, `${SEC}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`);
  const loadingLabel = cfgString(config, `${SEC}.blocks.product_header.blocks.product_title.settings.loadingLabel`);
  const showDescription = cfgBool(config, `${SEC}.blocks.product_content.blocks.description.settings.showDescription`, true);
  const priceFallback = cfgString(config, `${SEC}.blocks.product_content.blocks.price_line.settings.priceFallback`, '—');
  const addLabel = cfgString(config, `${SEC}.blocks.buy_box.blocks.add_to_cart_button.settings.label`);
  const addingLabel = cfgString(config, `${SEC}.blocks.buy_box.blocks.add_to_cart_button.settings.addingLabel`);

  useEffect(() => {
    if (!id) return;
    void fetchProductById(id);
    void fetchVariantsByProductId(id);
  }, [fetchProductById, fetchVariantsByProductId, id]);

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

  if (!id) return null;

  const image = productDetail?.imageUrls?.[0];

  return (
    <PageShell>
      <EditorSection sectionId="product_main" label="Product details" style={{ padding: `48px ${layout.padX}px` }}>
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
          <EditorBlock nodeId="template:product:product_main:block:product_media" label="Media">
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
            <EditorBlock nodeId="template:product:product_main:block:product_header" label="Header">
              {showVendor && productDetail?.vendor?.name ? (
                <EditorBlock nodeId="template:product:product_main:block:product_header:block:vendor_line" label="Vendor">
                  <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>
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
                <h1 style={{ fontFamily: fontHeading, fontSize: 32, margin: '8px 0 16px', fontWeight: 600 }}>
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
                  <p style={{ lineHeight: 1.7, opacity: 0.85, marginBottom: 24 }}>{productDetail?.description}</p>
                </EditorBlock>
              ) : null}
              <EditorBlock nodeId="template:product:product_main:block:product_content:block:price_line" label="Price">
                <p style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
                  {productDetail ? formatINR(productDetail.price) : priceFallback}
                </p>
              </EditorBlock>
            </EditorBlock>

            <EditorBlock nodeId="template:product:product_main:block:buy_box" label="Buy box">
              <EditorBlock
                nodeId="template:product:product_main:block:buy_box:block:add_to_cart_button"
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
                  }}
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
