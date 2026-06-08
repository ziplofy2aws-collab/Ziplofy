"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORE_CUSTOM_THEMES_API = void 0;
/** Route paths for store custom themes (mirror Ziplofy context: /store-custom-themes/...) */
exports.STORE_CUSTOM_THEMES_API = {
    base: '/api/store-custom-themes',
    byStore: (storeId) => `/api/store-custom-themes/store/${storeId}`,
    byId: (id) => `/api/store-custom-themes/${id}`,
};
