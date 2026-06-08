import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  formatINR,
  useStorefrontAuth,
  useStorefrontCart,
  useThemeConfig,
  useThemeEditorPreview,
  type GuestCartItem,
  type StorefrontCartItem,
} from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { PREVIEW_CART_LINES } from '../lib/editorPreviewFixtures';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { PageShell } from '../shell/PageShell';
import { inputStyle, layout, useThemeColors } from '../tokens';

const SEC = 'templates.cart.sections.cart_main';

function variantOf(item: StorefrontCartItem | GuestCartItem) {
  const v = item.productVariantId;
  return typeof v === 'object' && v !== null && '_id' in v ? v : null;
}

export function CartPage() {
  const config = useThemeConfig();
  const isEditorPreview = useThemeEditorPreview();
  const { text, background, primary, fontHeading, fontBody } = useThemeColors();
  const { user, checkAuth } = useStorefrontAuth();
  const { getAllItems, getCartByCustomerId, updateCartEntry, deleteCartEntry, loading } = useStorefrontCart();
  const [qtyDraft, setQtyDraft] = useState<Record<string, string>>({});

  const title = cfgString(config, `${SEC}.settings.title`);
  const emptyTitle = cfgString(config, `${SEC}.blocks.empty_state.blocks.empty_message.settings.emptyTitle`);
  const continueLabel = cfgString(config, `${SEC}.blocks.empty_state.blocks.continue_link.settings.label`);
  const continueHref = cfgString(config, `${SEC}.blocks.empty_state.blocks.continue_link.settings.href`);
  const removeLabel = cfgString(config, `${SEC}.blocks.line_items.blocks.item_actions.settings.removeLabel`);
  const loadingLabel = cfgString(config, `${SEC}.blocks.line_items.blocks.item_actions.settings.loadingLabel`);
  const subtotalPrefix = cfgString(config, `${SEC}.blocks.cart_summary.blocks.subtotal.settings.label`);

  useEffect(() => {
    if (!isEditorPreview) void checkAuth();
  }, [checkAuth, isEditorPreview]);

  useEffect(() => {
    if (isEditorPreview || !user?._id) return;
    void getCartByCustomerId(user._id);
  }, [getCartByCustomerId, isEditorPreview, user?._id]);

  const apiLines = getAllItems();
  const lines = useMemo(() => {
    if (apiLines.length > 0) return apiLines;
    if (isEditorPreview) return PREVIEW_CART_LINES;
    return [];
  }, [apiLines, isEditorPreview]);

  const total = useMemo(() => {
    let sub = 0;
    for (const item of lines) {
      const v = variantOf(item);
      if (v) sub += v.price * item.quantity;
    }
    return sub;
  }, [lines]);

  const showLoading = !isEditorPreview && loading && lines.length === 0;
  const showEmpty = !showLoading && lines.length === 0;

  return (
    <PageShell>
      <EditorSection sectionId="cart_main" label="Cart" style={{ padding: `40px ${layout.padX}px 64px`, fontFamily: fontBody, color: text }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <EditorField fieldPath={`${SEC}.settings.title`} label="Page title" as="h1" style={{ fontFamily: fontHeading, fontSize: 32, marginTop: 0 }}>
            {title}
          </EditorField>
          {showLoading ? (
            <EditorBlock nodeId="template:cart:cart_main:block:line_items" label="Line items">
              <p style={{ opacity: 0.7 }}>{loadingLabel}</p>
            </EditorBlock>
          ) : null}
          {showEmpty ? (
            <EditorBlock nodeId="template:cart:cart_main:block:empty_state" label="Empty cart">
              <p style={{ opacity: 0.7 }}>
                <EditorField fieldPath={`${SEC}.blocks.empty_state.blocks.empty_message.settings.emptyTitle`} label="Empty cart text" as="span">
                  {emptyTitle}
                </EditorField>{' '}
                <Link to={continueHref} style={{ color: primary }}>
                  <EditorField fieldPath={`${SEC}.blocks.empty_state.blocks.continue_link.settings.label`} label="Link label" as="span">
                    {continueLabel}
                  </EditorField>
                </Link>
              </p>
            </EditorBlock>
          ) : null}
          {lines.length > 0 ? (
            <>
              <EditorBlock nodeId="template:cart:cart_main:block:line_items" label="Line items">
                <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
                  {lines.map((item) => {
                    const v = variantOf(item);
                    return (
                      <article key={item._id} style={{ border: `1px solid ${layout.line}`, borderRadius: 10, padding: 16, background }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                          <div>
                            {v ? (
                              <Link to={`/products/${v.productId}`} style={{ color: text, fontWeight: 600 }} onClick={(e) => isEditorPreview && e.preventDefault()}>
                                {v.sku}
                              </Link>
                            ) : (
                              <span>Item</span>
                            )}
                            <p style={{ margin: '8px 0 0' }}>{v ? formatINR(v.price) : '—'} each</p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                            <input
                              type="number"
                              min={1}
                              value={qtyDraft[item._id] ?? String(item.quantity)}
                              readOnly={isEditorPreview}
                              onChange={(e) => setQtyDraft((p) => ({ ...p, [item._id]: e.target.value }))}
                              onBlur={() => {
                                if (isEditorPreview) return;
                                const n = Math.max(1, Math.floor(Number(qtyDraft[item._id]) || item.quantity));
                                if (n !== item.quantity) void updateCartEntry({ id: item._id, quantity: n });
                              }}
                              style={{ ...inputStyle, width: 72, fontFamily: fontBody }}
                            />
                            <EditorBlock nodeId="template:cart:cart_main:block:line_items:block:item_actions" label="Item actions">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isEditorPreview) void deleteCartEntry(item._id);
                                }}
                                style={{ background: 'none', border: 'none', color: primary, cursor: isEditorPreview ? 'default' : 'pointer' }}
                              >
                                <EditorField fieldPath={`${SEC}.blocks.line_items.blocks.item_actions.settings.removeLabel`} label="Remove button" as="span">
                                  {removeLabel}
                                </EditorField>
                              </button>
                            </EditorBlock>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </EditorBlock>
              <EditorBlock nodeId="template:cart:cart_main:block:cart_summary" label="Summary">
                <p style={{ marginTop: 24, fontSize: 20, fontWeight: 600 }}>
                  <EditorField fieldPath={`${SEC}.blocks.cart_summary.blocks.subtotal.settings.label`} label="Subtotal prefix" as="span">
                    {subtotalPrefix}
                  </EditorField>{' '}
                  {formatINR(total)}
                </p>
              </EditorBlock>
            </>
          ) : null}
        </div>
      </EditorSection>
    </PageShell>
  );
}
