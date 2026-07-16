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
import { EditorBlock, EditorSection } from '../../runtime/shared/editorAttrs';
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

function blockEnabled(
  config: Record<string, unknown> | null,
  path: string,
  fallback = true
): boolean {
  return cfgBool(config, `${path}.enabled`, fallback);
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

/** Product information — media + details (header/title/price, divider, variants, buy buttons, description) + disclosures. */
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
  const editorNodeId = `template:${templateId}:${sectionId}`;

  const showMedia = blockEnabled(config, `${base}.blocks.product_media`);
  const showDetails = blockEnabled(config, `${base}.blocks.details`);
  const showDisclosures = blockEnabled(config, `${base}.blocks.disclosures`);
  const showHeader = blockEnabled(config, `${base}.blocks.details.blocks.header`);
  const showTitle = blockEnabled(config, `${base}.blocks.details.blocks.header.blocks.title`);
  const showPrice = blockEnabled(config, `${base}.blocks.details.blocks.header.blocks.price`);
  const showDivider = blockEnabled(config, `${base}.blocks.details.blocks.divider`);
  const showVariantPicker = blockEnabled(config, `${base}.blocks.details.blocks.variant_picker`);
  const showBuyButtons = blockEnabled(config, `${base}.blocks.details.blocks.buy_buttons`);
  const showQuantity = blockEnabled(
    config,
    `${base}.blocks.details.blocks.buy_buttons.blocks.quantity`
  );
  const showAddToCart = blockEnabled(
    config,
    `${base}.blocks.details.blocks.buy_buttons.blocks.add_to_cart`
  );
  const showAccelerated = blockEnabled(
    config,
    `${base}.blocks.details.blocks.buy_buttons.blocks.accelerated_checkout`
  );
  const showDescription = blockEnabled(config, `${base}.blocks.details.blocks.description`);
  const descriptionVisible = cfgBool(
    config,
    `${base}.blocks.details.blocks.description.settings.showDescription`,
    true
  );

  const addLabel =
    cfgString(
      config,
      `${base}.blocks.details.blocks.buy_buttons.blocks.add_to_cart.settings.buttonLabel`,
      ''
    ).trim() ||
    cfgString(
      config,
      `${base}.blocks.details.blocks.buy_buttons.blocks.add_to_cart.settings.label`,
      ''
    ).trim() ||
    'Add to cart';
  const disclosuresTitle = cfgString(
    config,
    `${base}.blocks.disclosures.settings.title`,
    'Disclosures'
  );
  const disclosuresBody = cfgString(config, `${base}.blocks.disclosures.settings.body`, '');
  const paddingTop = cfgNumber(config, `${base}.settings.paddingTop`, 48);
  const paddingBottom = cfgNumber(config, `${base}.settings.paddingBottom`, 56);

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
  const title = productDetail?.title?.trim() || 'Product';
  const price = typeof selectedVariant?.price === 'number'
    ? selectedVariant.price
    : typeof productDetail?.price === 'number'
      ? productDetail.price
      : 0;
  const compareAt =
    typeof selectedVariant?.compareAtPrice === 'number'
      ? selectedVariant.compareAtPrice
      : typeof productDetail?.compareAtPrice === 'number'
        ? productDetail.compareAtPrice
        : null;
  const priceLabel = formatThemePrice(config, price, 'productCards');
  const compareLabel =
    compareAt != null && compareAt > price
      ? formatThemePrice(config, compareAt, 'productCards')
      : null;
  const descriptionHtml = productDetail?.description?.trim() || '';
  const buttonBg = primary || '#111827';
  const buttonFg = contrastOn(buttonBg);
  const canAdd = Boolean(selectedVariant) && !adding;

  const optionGroups = useMemo(() => {
    if (productDetail?.variants?.length) {
      return productDetail.variants
        .filter((v) => Boolean(v.optionName) && Array.isArray(v.values) && v.values.length > 0)
        .map((v) => ({ name: v.optionName, values: v.values }));
    }
    const names = new Set<string>();
    for (const variant of variants) {
      for (const key of Object.keys(variant.optionValues ?? {})) {
        if (key) names.add(key);
      }
    }
    return Array.from(names).map((name) => ({
      name,
      values: Array.from(
        new Set(
          variants
            .map((v) => v.optionValues?.[name])
            .filter((v): v is string => Boolean(v))
        )
      ),
    }));
  }, [productDetail?.variants, variants]);

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
    width: '100%',
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Product information"
      editorNodeId={editorNodeId}
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
          alignItems: 'start',
        }}
      >
        {showMedia ? (
          <EditorBlock nodeId={`${editorNodeId}:block:product_media`} label="Product media">
            <div
              style={{
                borderRadius: 0,
                overflow: 'hidden',
                background: '#f4f4f5',
                border: border ? `1px solid ${border}` : '1px solid rgba(17,24,39,0.06)',
                aspectRatio: '1 / 1',
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt=""
                  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(160deg, #f4f4f5 0%, #e4e4e7 100%)',
                  }}
                />
              )}
            </div>
          </EditorBlock>
        ) : null}

        {showDetails ? (
          <EditorBlock nodeId={`${editorNodeId}:block:details`} label="Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
              {showHeader ? (
                <EditorBlock
                  nodeId={`${editorNodeId}:block:details:nested:header`}
                  label="Header"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {showTitle ? (
                      <EditorBlock
                        nodeId={`${editorNodeId}:block:details:nested:header:nested:title`}
                        label="Product title"
                      >
                        <h1
                          style={{
                            margin: 0,
                            fontFamily: fontHeading,
                            fontSize: 32,
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: text,
                          }}
                        >
                          {title}
                        </h1>
                      </EditorBlock>
                    ) : null}
                    {showPrice ? (
                      <EditorBlock
                        nodeId={`${editorNodeId}:block:details:nested:header:nested:price`}
                        label="Price"
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 10,
                            flexWrap: 'wrap',
                          }}
                        >
                          <span style={{ fontSize: 18, fontWeight: 700, color: text }}>
                            {priceLabel}
                          </span>
                          {compareLabel ? (
                            <span
                              style={{
                                fontSize: 15,
                                color: muted || text,
                                textDecoration: 'line-through',
                                opacity: 0.6,
                              }}
                            >
                              {compareLabel}
                            </span>
                          ) : null}
                        </div>
                      </EditorBlock>
                    ) : null}
                  </div>
                </EditorBlock>
              ) : null}

              {showDivider ? (
                <EditorBlock
                  nodeId={`${editorNodeId}:block:details:nested:divider`}
                  label="Divider"
                >
                  <hr
                    style={{
                      margin: 0,
                      border: 0,
                      borderTop: `1px solid ${border || 'rgba(17,24,39,0.12)'}`,
                    }}
                  />
                </EditorBlock>
              ) : null}

              {showVariantPicker && optionGroups.length > 0 ? (
                <EditorBlock
                  nodeId={`${editorNodeId}:block:details:nested:variant_picker`}
                  label="Variant picker"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {optionGroups.map(({ name, values }) => (
                      <div key={name}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 8,
                            color: text,
                          }}
                        >
                          {name}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {values.map((value) => (
                            <span
                              key={value}
                              style={{
                                border: `1px solid ${border || '#d1d5db'}`,
                                borderRadius: 6,
                                padding: '8px 12px',
                                fontSize: 13,
                                background: '#fff',
                              }}
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </EditorBlock>
              ) : null}

              {showBuyButtons ? (
                <EditorBlock
                  nodeId={`${editorNodeId}:block:details:nested:buy_buttons`}
                  label="Buy buttons"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {showQuantity ? (
                      <EditorBlock
                        nodeId={`${editorNodeId}:block:details:nested:buy_buttons:nested:quantity`}
                        label="Quantity"
                      >
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: muted || text }}>Quantity</span>
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) =>
                              setQuantity(Math.max(1, Number(e.target.value) || 1))
                            }
                            style={{
                              width: 72,
                              border: `1px solid ${border || '#d1d5db'}`,
                              borderRadius: 6,
                              padding: '8px 10px',
                              fontSize: 14,
                            }}
                          />
                        </label>
                      </EditorBlock>
                    ) : null}

                    {showAddToCart ? (
                      <EditorBlock
                        nodeId={`${editorNodeId}:block:details:nested:buy_buttons:nested:add_to_cart`}
                        label="Add to cart"
                      >
                        <button
                          type="button"
                          disabled={!canAdd}
                          onClick={() => void handleAdd()}
                          style={primaryButtonStyle}
                        >
                          <AddToCartBagIcon />
                          {adding ? 'Adding…' : addLabel}
                        </button>
                      </EditorBlock>
                    ) : null}

                    {showAccelerated ? (
                      <EditorBlock
                        nodeId={`${editorNodeId}:block:details:nested:buy_buttons:nested:accelerated_checkout`}
                        label="Accelerated checkout"
                      >
                        <button
                          type="button"
                          disabled={!canAdd}
                          onClick={() => void handleAdd()}
                          style={{
                            ...primaryButtonStyle,
                            background: '#111827',
                            color: '#fff',
                          }}
                        >
                          Buy it now
                        </button>
                      </EditorBlock>
                    ) : null}
                  </div>
                </EditorBlock>
              ) : null}

              {showDescription && descriptionVisible ? (
                <EditorBlock
                  nodeId={`${editorNodeId}:block:details:nested:description`}
                  label="Product description"
                >
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: muted || text,
                    }}
                  >
                    {descriptionHtml ? (
                      <ThemeEditorRichTextContent html={descriptionHtml} />
                    ) : (
                      <p style={{ margin: 0 }}>No description yet.</p>
                    )}
                  </div>
                </EditorBlock>
              ) : null}
            </div>
          </EditorBlock>
        ) : null}
      </div>

      {showDisclosures ? (
        <EditorBlock
          nodeId={`${editorNodeId}:block:disclosures`}
          label="Disclosures"
        >
          <div
            style={{
              maxWidth,
              margin: '40px auto 0',
              paddingTop: 24,
              borderTop: `1px solid ${border || 'rgba(17,24,39,0.1)'}`,
            }}
          >
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: fontHeading,
                color: text,
              }}
            >
              {disclosuresTitle}
            </h2>
            {disclosuresBody ? (
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: muted || text }}>
                {disclosuresBody}
              </p>
            ) : null}
          </div>
        </EditorBlock>
      ) : null}
    </EditorSection>
  );
}
