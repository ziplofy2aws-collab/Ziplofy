export type CheckoutSettingsPanelId =
  | 'header'
  | 'logo'
  | 'order-summary'
  | 'footer'
  | 'sign-in-main'
  | 'thank-you-main';

const HEADER_NODE_IDS = new Set(['checkout:header']);

const LOGO_NODE_IDS = new Set(['checkout:header:logo']);

const ORDER_SUMMARY_NODE_IDS = new Set(['checkout:order-summary']);

const FOOTER_NODE_IDS = new Set(['checkout:footer']);

const SIGN_IN_MAIN_NODE_IDS = new Set(['checkout:sign-in:group:main']);

const THANK_YOU_MAIN_NODE_IDS = new Set(['checkout:thank-you:group:main']);

export function resolveCheckoutSettingsPanelId(nodeId: string): CheckoutSettingsPanelId | null {
  if (HEADER_NODE_IDS.has(nodeId)) {
    return 'header';
  }
  if (LOGO_NODE_IDS.has(nodeId)) {
    return 'logo';
  }
  if (ORDER_SUMMARY_NODE_IDS.has(nodeId)) {
    return 'order-summary';
  }
  if (FOOTER_NODE_IDS.has(nodeId)) {
    return 'footer';
  }
  if (SIGN_IN_MAIN_NODE_IDS.has(nodeId)) {
    return 'sign-in-main';
  }
  if (THANK_YOU_MAIN_NODE_IDS.has(nodeId)) {
    return 'thank-you-main';
  }
  return null;
}
