export type CheckoutSettingsPanelId = 'header' | 'order-summary' | 'footer';

const HEADER_NODE_IDS = new Set(['checkout:header']);

const ORDER_SUMMARY_NODE_IDS = new Set(['checkout:order-summary']);

const FOOTER_NODE_IDS = new Set(['checkout:footer']);

export function resolveCheckoutSettingsPanelId(nodeId: string): CheckoutSettingsPanelId | null {
  if (HEADER_NODE_IDS.has(nodeId)) {
    return 'header';
  }
  if (ORDER_SUMMARY_NODE_IDS.has(nodeId)) {
    return 'order-summary';
  }
  if (FOOTER_NODE_IDS.has(nodeId)) {
    return 'footer';
  }
  return null;
}
