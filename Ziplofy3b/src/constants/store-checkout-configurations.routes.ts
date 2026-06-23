/** Route paths for store checkout configurations */
export const STORE_CHECKOUT_CONFIGURATIONS_API = {
  base: '/api/store-checkout-configurations',
  byStore: (storeId: string) => `/api/store-checkout-configurations/store/${storeId}`,
  byId: (id: string) => `/api/store-checkout-configurations/${id}`,
} as const;

export const checkoutEditorPath = (configId: string) =>
  `/themes/editor/checkout/${configId}`;
