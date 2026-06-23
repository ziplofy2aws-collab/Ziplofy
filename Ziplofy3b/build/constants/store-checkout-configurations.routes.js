"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutEditorPath = exports.STORE_CHECKOUT_CONFIGURATIONS_API = void 0;
/** Route paths for store checkout configurations */
exports.STORE_CHECKOUT_CONFIGURATIONS_API = {
    base: '/api/store-checkout-configurations',
    byStore: (storeId) => `/api/store-checkout-configurations/store/${storeId}`,
    byId: (id) => `/api/store-checkout-configurations/${id}`,
};
const checkoutEditorPath = (configId) => `/themes/editor/checkout/${configId}`;
exports.checkoutEditorPath = checkoutEditorPath;
