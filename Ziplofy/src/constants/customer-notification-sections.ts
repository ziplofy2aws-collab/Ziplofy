/** Shopify-style customer notification sections and display order. */
export const CUSTOMER_NOTIFICATION_SEGMENT_ORDER = [
  'order_processing',
  'local_pick_up',
  'local_delivery',
  'gift_cards',
  'store_credit',
  'order_exceptions',
  'payments',
  'shipping_updated',
  'returns',
  'accounts_and_outreach',
] as const;

export const CUSTOMER_NOTIFICATION_SEGMENT_LABELS: Record<string, string> = {
  order_processing: 'Order processing',
  local_pick_up: 'Local pick up',
  local_delivery: 'Local delivery',
  gift_cards: 'Gift cards',
  store_credit: 'Store credit',
  order_exceptions: 'Order exceptions',
  payments: 'Payments',
  shipping_updated: 'Shipping updated',
  returns: 'Returns',
  accounts_and_outreach: 'Accounts and outreach',
};

/** Option names in Shopify display order within each segment. */
export const CUSTOMER_NOTIFICATION_OPTION_ORDER: Record<string, string[]> = {
  order_processing: ['Order confirmation', 'Draft order invoice', 'Shipping confirmation'],
  local_pick_up: ['Ready for local pickup', 'Picked up by customer'],
  local_delivery: [
    'Order out for local delivery',
    'Order locally delivered',
    'Order missed local delivery',
  ],
  gift_cards: ['New gift card', 'Gift card receipt'],
  store_credit: ['Store credit issued'],
  order_exceptions: [
    'Order invoice',
    'Order edited',
    'Order canceled',
    'Order payment receipt',
    'Order refund',
    'Order link',
  ],
  payments: [
    'Payment error',
    'Pending payment error',
    'Pending payment success',
    'Payment reminder',
  ],
  shipping_updated: ['Shipping update', 'Out for delivery', 'Delivered'],
  returns: [
    'Return created',
    'Order-level return label created',
    'Return request received',
    'Return request approved',
    'Return request declined',
  ],
  accounts_and_outreach: [
    'Contact customer',
    'Customer account invite',
    'Customer account password reset',
    'Customer account welcome',
    'Customer email address change confirmation',
  ],
};

export function sortCustomerNotificationOptions<T extends { optionName: string; segment?: string }>(
  options: T[],
  segment: string
): T[] {
  const order = CUSTOMER_NOTIFICATION_OPTION_ORDER[segment];
  if (!order) {
    return [...options].sort((a, b) => a.optionName.localeCompare(b.optionName));
  }
  const rank = new Map(order.map((name, index) => [name, index]));
  return [...options].sort((a, b) => {
    const aRank = rank.get(a.optionName) ?? Number.MAX_SAFE_INTEGER;
    const bRank = rank.get(b.optionName) ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.optionName.localeCompare(b.optionName);
  });
}
