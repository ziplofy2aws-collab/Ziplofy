import { useMemo } from 'react';
import { useCheckoutPreviewProduct } from '../hooks/useCheckoutPreviewProduct';
import type { CheckoutOrderSummaryConfig } from '../settings/checkout-settings.types';
import { CHECKOUT_DEFAULT_SHIPPING_AMOUNT } from '../utils/checkout-order.utils';
import { CheckoutOrderSummaryContent } from '../CheckoutOrderSummaryContent';

type Props = {
  storeId?: string | null;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  colorPalette?: string[];
  highlightNodeId?: string | null;
  layout?: 'desktop' | 'mobile';
  onSelectNode?: (nodeId: string) => void;
};

export function CheckoutOrderSummaryRuntimePreview({
  storeId,
  orderSummaryConfig,
  colorPalette,
  highlightNodeId = null,
  layout = 'desktop',
  onSelectNode,
}: Props) {
  const { product, loading } = useCheckoutPreviewProduct(storeId);

  const { lines, totals } = useMemo(() => {
    const unitPrice = product?.price ?? 0;
    const quantity = 1;
    const subtotal = unitPrice * quantity;
    const shipping = product ? CHECKOUT_DEFAULT_SHIPPING_AMOUNT : 0;
    const total = subtotal + shipping;

    const lines = product
      ? [
          {
            id: product._id ?? 'preview-product',
            title: product.title,
            imageUrl: product.imageUrl,
            quantity,
            lineTotal: subtotal,
          },
        ]
      : [];

    return {
      lines,
      totals: { subtotal, shipping, total },
    };
  }, [product]);

  return (
    <CheckoutOrderSummaryContent
      lines={lines}
      totals={totals}
      orderSummaryConfig={orderSummaryConfig}
      colorPalette={colorPalette}
      layout={layout}
      loading={loading}
      emptyMessage={
        loading ? 'Loading product…' : 'Add a product to preview your cart'
      }
      highlightNodeId={highlightNodeId}
      onSelectNode={onSelectNode}
      selectable={Boolean(onSelectNode)}
    />
  );
}
