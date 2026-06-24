import type { StorefrontOrder } from '@/contexts/storefront-order.context';
import type { CheckoutOrderCardData } from '@ziplofy/create-theme/checkout/orders/checkout-order-card.types';
import { CHECKOUT_ORDER_CARD_GRADIENTS } from '@ziplofy/create-theme/checkout/orders/checkout-order-card.types';

function formatOrderStatus(order: StorefrontOrder): string {
  if (order.status === 'shipped') return 'On its way';
  if (order.status === 'delivered') return 'Delivered';
  if (order.status === 'paid' || order.paymentStatus === 'paid') return 'Confirmed';
  if (order.status === 'pending') return 'Confirmed';
  if (order.status === 'cancelled') return 'Cancelled';
  return order.status;
}

function formatOrderDueDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatOrderDisplayId(order: StorefrontOrder, index: number): string {
  const suffix = order._id.slice(-4);
  if (/^\d+$/.test(suffix)) return suffix;
  return String(1001 + index);
}

function firstItemImage(order: StorefrontOrder): string | null {
  const variant = order.items?.[0]?.productVariantId;
  if (!variant || typeof variant !== 'object') return null;
  return variant.images?.[0] ?? null;
}

function shouldShowPayNow(order: StorefrontOrder): boolean {
  if (order.status === 'delivered' || order.status === 'cancelled') return false;
  return order.paymentStatus === 'unpaid';
}

function shouldShowDueWarning(order: StorefrontOrder): boolean {
  if (order.status === 'delivered' || order.status === 'cancelled') return false;
  return order.paymentStatus === 'unpaid';
}

export function mapStorefrontOrdersToCheckoutCards(orders: StorefrontOrder[]): CheckoutOrderCardData[] {
  return orders.map((order, index) => ({
    id: formatOrderDisplayId(order, index),
    orderRefId: order._id,
    status: formatOrderStatus(order),
    amount: order.total,
    dueDate: shouldShowDueWarning(order)
      ? formatOrderDueDate(order.orderDate || order.createdAt)
      : undefined,
    imageUrl: firstItemImage(order),
    imageGradient: CHECKOUT_ORDER_CARD_GRADIENTS[index % CHECKOUT_ORDER_CARD_GRADIENTS.length],
    showPayNow: shouldShowPayNow(order),
    showDueWarning: shouldShowDueWarning(order),
  }));
}
