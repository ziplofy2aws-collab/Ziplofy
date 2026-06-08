/** Route paths for store custom themes (mirror Ziplofy context: /store-custom-themes/...) */
export const STORE_CUSTOM_THEMES_API = {
  base: '/api/store-custom-themes',
  byStore: (storeId: string) => `/api/store-custom-themes/store/${storeId}`,
  byId: (id: string) => `/api/store-custom-themes/${id}`,
} as const;
