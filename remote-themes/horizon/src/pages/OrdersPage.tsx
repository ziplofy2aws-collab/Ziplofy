import { useEffect, useMemo } from 'react';
import { formatINR, useStorefrontAuth, useStorefrontOrder, useThemeConfig, useThemeEditorPreview } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { PREVIEW_ORDERS } from '../lib/editorPreviewFixtures';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { PageShell } from '../shell/PageShell';
import { layout, useThemeColors } from '../tokens';

const SEC = 'templates.orders.sections.orders_main';

export function OrdersPage() {
  const config = useThemeConfig();
  const isEditorPreview = useThemeEditorPreview();
  const { user, checkAuth } = useStorefrontAuth();
  const { orders, getOrdersByCustomerId, loading } = useStorefrontOrder();
  const { text, fontHeading, fontBody } = useThemeColors();

  const title = cfgString(config, `${SEC}.settings.title`);
  const subtitle = cfgString(config, `${SEC}.settings.subtitle`, '');
  const loadingMsg = cfgString(config, `${SEC}.blocks.loading_state.settings.message`);
  const emptyMsg = cfgString(config, `${SEC}.blocks.empty_state.settings.message`);
  const totalLabel = cfgString(config, `${SEC}.blocks.order_card.blocks.order_total_line.settings.label`);
  const datePrefix = cfgString(config, `${SEC}.blocks.order_card.blocks.order_date_line.settings.prefix`);
  const statusPrefix = cfgString(config, `${SEC}.blocks.order_card.blocks.status_line.settings.prefix`);

  useEffect(() => {
    if (!isEditorPreview) void checkAuth();
  }, [checkAuth, isEditorPreview]);

  useEffect(() => {
    if (isEditorPreview || !user?._id) return;
    void getOrdersByCustomerId(user._id);
  }, [getOrdersByCustomerId, isEditorPreview, user?._id]);

  const displayOrders = useMemo(() => {
    if (orders.length > 0) return orders;
    if (isEditorPreview) return PREVIEW_ORDERS;
    return [];
  }, [isEditorPreview, orders]);

  const showLoading = !isEditorPreview && loading;
  const showEmpty = !showLoading && displayOrders.length === 0;

  return (
    <PageShell>
      <EditorSection
        sectionId="orders_main"
        label="Order history"
        style={{ padding: `48px ${layout.padX}px 80px`, maxWidth: 720, margin: '0 auto', fontFamily: fontBody, color: text }}
      >
        <EditorField fieldPath={`${SEC}.settings.title`} label="Heading" as="h1" style={{ fontFamily: fontHeading, fontSize: 32, marginTop: 0 }}>
          {title}
        </EditorField>
        {subtitle ? (
          <EditorField fieldPath={`${SEC}.settings.subtitle`} label="Subtext" as="p" style={{ opacity: 0.85, margin: '8px 0 24px' }}>
            {subtitle}
          </EditorField>
        ) : null}
        {showLoading ? (
          <EditorBlock nodeId="template:orders:orders_main:block:loading_state" label="Loading">
            <EditorField fieldPath={`${SEC}.blocks.loading_state.settings.message`} label="Loading message" as="p" style={{ opacity: 0.7 }}>
              {loadingMsg}
            </EditorField>
          </EditorBlock>
        ) : null}
        {showEmpty ? (
          <EditorBlock nodeId="template:orders:orders_main:block:empty_state" label="Empty orders">
            <EditorField fieldPath={`${SEC}.blocks.empty_state.settings.message`} label="Empty message" as="p" style={{ opacity: 0.7 }}>
              {emptyMsg}
            </EditorField>
          </EditorBlock>
        ) : null}
        <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          {displayOrders.map((order) => (
            <EditorBlock key={order._id} nodeId="template:orders:orders_main:block:order_card" label="Order card">
              <article style={{ border: `1px solid ${layout.line}`, borderRadius: 10, padding: 20 }}>
                <EditorBlock nodeId="template:orders:orders_main:block:order_card:block:order_total_line" label="Order total">
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    <EditorField fieldPath={`${SEC}.blocks.order_card.blocks.order_total_line.settings.label`} label="Total label" as="span">
                      {totalLabel}
                    </EditorField>
                    : {formatINR(order.total)}
                  </p>
                </EditorBlock>
                <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.75, wordBreak: 'break-all' }}>{order._id}</p>
                <EditorBlock nodeId="template:orders:orders_main:block:order_card:block:order_date_line" label="Order date">
                  <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.75 }}>
                    <EditorField fieldPath={`${SEC}.blocks.order_card.blocks.order_date_line.settings.prefix`} label="Date prefix" as="span">
                      {datePrefix}
                    </EditorField>
                    : {order.orderDate}
                  </p>
                </EditorBlock>
                <EditorBlock nodeId="template:orders:orders_main:block:order_card:block:status_line" label="Status">
                  <p style={{ margin: '8px 0 0' }}>
                    <EditorField fieldPath={`${SEC}.blocks.order_card.blocks.status_line.settings.prefix`} label="Status prefix" as="span">
                      {statusPrefix}
                    </EditorField>{' '}
                    {order.status}
                  </p>
                </EditorBlock>
              </article>
            </EditorBlock>
          ))}
        </div>
      </EditorSection>
    </PageShell>
  );
}
