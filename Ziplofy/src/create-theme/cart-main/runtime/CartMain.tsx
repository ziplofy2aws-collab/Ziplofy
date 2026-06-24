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
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { PREVIEW_CART_LINES } from '../../runtime/shared/editorPreviewFixtures';
import { inputStyle, layout, useThemeColors } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';

function variantOf(item: StorefrontCartItem | GuestCartItem) {
  const v = item.productVariantId;
  return typeof v === 'object' && v !== null && '_id' in v ? v : null;
}

export function CartMain({
  sectionId,
  templateId = 'cart',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const isEditorPreview = useThemeEditorPreview();
  const { text, background, primary, fontHeading, fontBody } = useThemeColors();
  const { user, checkAuth } = useStorefrontAuth();
  const { getAllItems, getCartByCustomerId, updateCartEntry, deleteCartEntry, loading } =
    useStorefrontCart();
  const [qtyDraft, setQtyDraft] = useState<Record<string, string>>({});

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;

  const title = cfgString(config, `${settingsBase}.settings.title`, 'Your cart');
  const emptyTitle = cfgString(
    config,
    `${settingsBase}.blocks.empty_state.blocks.empty_message.settings.emptyTitle`,
    'Your cart is empty'
  );
  const continueLabel = cfgString(
    config,
    `${settingsBase}.blocks.empty_state.blocks.continue_link.settings.label`,
    'Continue shopping'
  );
  const continueHref = cfgString(
    config,
    `${settingsBase}.blocks.empty_state.blocks.continue_link.settings.href`,
    '/'
  );
  const removeLabel = cfgString(
    config,
    `${settingsBase}.blocks.line_items.blocks.item_actions.settings.removeLabel`,
    'Remove'
  );
  const loadingLabel = cfgString(
    config,
    `${settingsBase}.blocks.line_items.blocks.item_actions.settings.loadingLabel`,
    'Loading…'
  );
  const subtotalPrefix = cfgString(
    config,
    `${settingsBase}.blocks.cart_summary.blocks.subtotal.settings.label`,
    'Subtotal:'
  );
  const checkoutLabel = cfgString(
    config,
    `${settingsBase}.blocks.cart_summary.blocks.checkout_button.settings.label`,
    'Proceed to checkout'
  );
  const checkoutHelperText = cfgString(
    config,
    `${settingsBase}.blocks.cart_summary.blocks.checkout_button.settings.helperText`,
    ''
  );

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

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
    <EditorSection
      sectionId={sectionId}
      label="Cart"
      editorNodeId={editorNodeId}
      style={{ padding: `40px ${layout.padX}px 64px`, fontFamily: fontBody, color: text }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <EditorField fieldPath={`${settingsBase}.settings.title`} label="Page title" as="h1" style={{ fontFamily: fontHeading, fontSize: 32, marginTop: 0 }}>
          {title}
        </EditorField>
        {showLoading ? (
          <EditorBlock nodeId={`${editorNodeId}:block:line_items`} label="Line items">
            <p style={{ opacity: 0.7 }}>{loadingLabel}</p>
          </EditorBlock>
        ) : null}
        {showEmpty ? (
          <EditorBlock nodeId={`${editorNodeId}:block:empty_state`} label="Empty cart">
            <p style={{ opacity: 0.7 }}>
              <EditorField
                fieldPath={`${settingsBase}.blocks.empty_state.blocks.empty_message.settings.emptyTitle`}
                label="Empty cart text"
                as="span"
              >
                {emptyTitle}
              </EditorField>{' '}
              <Link to={continueHref} style={{ color: primary }} onClick={(e) => isEditorPreview && e.preventDefault()}>
                <EditorField
                  fieldPath={`${settingsBase}.blocks.empty_state.blocks.continue_link.settings.label`}
                  label="Link label"
                  as="span"
                >
                  {continueLabel}
                </EditorField>
              </Link>
            </p>
          </EditorBlock>
        ) : null}
        {lines.length > 0 ? (
          <>
            <EditorBlock nodeId={`${editorNodeId}:block:line_items`} label="Line items">
              <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
                {lines.map((item) => {
                  const v = variantOf(item);
                  return (
                    <article
                      key={item._id}
                      style={{
                        border: `1px solid ${layout.line}`,
                        borderRadius: 10,
                        padding: 16,
                        background,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 16,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          {v ? (
                            <Link
                              to={`/products/${v.productId}`}
                              style={{ color: text, fontWeight: 600 }}
                              onClick={(e) => isEditorPreview && e.preventDefault()}
                            >
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
                              const n = Math.max(
                                1,
                                Math.floor(Number(qtyDraft[item._id]) || item.quantity)
                              );
                              if (n !== item.quantity) void updateCartEntry({ id: item._id, quantity: n });
                            }}
                            style={{ ...inputStyle, width: 72, fontFamily: fontBody }}
                          />
                          <EditorBlock
                            nodeId={`${editorNodeId}:block:line_items:block:item_actions`}
                            label="Item actions"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (!isEditorPreview) void deleteCartEntry(item._id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: primary,
                                cursor: isEditorPreview ? 'default' : 'pointer',
                              }}
                            >
                              <EditorField
                                fieldPath={`${settingsBase}.blocks.line_items.blocks.item_actions.settings.removeLabel`}
                                label="Remove button"
                                as="span"
                              >
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
            <EditorBlock nodeId={`${editorNodeId}:block:cart_summary`} label="Summary">
              <p style={{ marginTop: 24, fontSize: 20, fontWeight: 600 }}>
                <EditorField
                  fieldPath={`${settingsBase}.blocks.cart_summary.blocks.subtotal.settings.label`}
                  label="Subtotal prefix"
                  as="span"
                >
                  {subtotalPrefix}
                </EditorField>{' '}
                {formatINR(total)}
              </p>
              <div style={{ marginTop: 20, maxWidth: 360 }}>
                <EditorField
                  fieldPath={`${settingsBase}.blocks.cart_summary.blocks.checkout_button.settings.label`}
                  label="Checkout button"
                  as="span"
                  style={{ display: 'block', width: '100%' }}
                >
                  <Link
                    to="/checkout"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      minHeight: 48,
                      padding: '12px 24px',
                      borderRadius: 12,
                      background: '#111827',
                      color: '#ffffff',
                      fontSize: 15,
                      fontWeight: 600,
                      fontFamily: fontBody,
                      textDecoration: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {checkoutLabel}
                  </Link>
                </EditorField>
                {checkoutHelperText ? (
                  <EditorField
                    fieldPath={`${settingsBase}.blocks.cart_summary.blocks.checkout_button.settings.helperText`}
                    label="Checkout helper text"
                    as="p"
                    style={{ margin: '8px 0 0', fontSize: 13, color: text, opacity: 0.65, textAlign: 'center' }}
                  >
                    {checkoutHelperText}
                  </EditorField>
                ) : null}
              </div>
            </EditorBlock>
          </>
        ) : null}
      </div>
    </EditorSection>
  );
}
