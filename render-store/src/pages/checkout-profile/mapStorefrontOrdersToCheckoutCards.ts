import type { StorefrontOrder } from '@/contexts/storefront-order.context';
import type { CheckoutOrderCardData } from '@ziplofy/create-theme/checkout/orders/checkout-order-card.types';
import { CHECKOUT_ORDER_CARD_GRADIENTS } from '@ziplofy/create-theme/checkout/orders/checkout-order-card.types';

function formatOrderStatus(order: StorefrontOrder): string {
  if (order.status === 'shipped') return 'On its way';
  if (order.status === 'delivered') return 'Delivered';
  if (order.status === 'paid' || order.paymentStatus === 'paid') return 'Confirmed';
  if (order.status === 'pending') return 'Pending';
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

export function mapStorefrontOrdersToCheckoutCards(orders: StorefrontOrder[]): CheckoutOrderCardData[] {
  return orders.map((order, index) => ({
    id: formatOrderDisplayId(order, index),
    status: formatOrderStatus(order),
    amount: order.total,
    dueDate: formatOrderDueDate(order.orderDate || order.createdAt),
    imageGradient: CHECKOUT_ORDER_CARD_GRADIENTS[index % CHECKOUT_ORDER_CARD_GRADIENTS.length],
  }));
}
