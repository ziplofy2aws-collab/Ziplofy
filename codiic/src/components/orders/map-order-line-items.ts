import type { AdminOrder, AdminOrderItem } from '../../contexts/admin-order.context';
import type { OrderLineItemSummary } from './orders-table.types';

export function mapAdminOrderLineItems(items: AdminOrderItem[] | undefined): OrderLineItemSummary[] {
  return (items ?? []).map((item) => {
    const variant = item.productVariantId;
    const product =
      variant?.productId && typeof variant.productId === 'object' ? variant.productId : undefined;

    return {
      lineItemId: item._id,
      productId: product?._id,
      title: product?.title?.trim() || 'Product',
      imageUrl: variant?.images?.[0] || product?.imageUrls?.[0],
      quantity: item.quantity,
      price: item.price,
    };
  });
}

export function mapAdminOrderToLineItems(order: AdminOrder): OrderLineItemSummary[] {
  return mapAdminOrderLineItems(order.items);
}
