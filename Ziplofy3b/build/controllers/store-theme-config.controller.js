"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putStoreThemeConfigByStore = exports.getStoreThemeConfigByStore = void 0;
const error_utils_1 = require("../utils/error.utils");
const store_theme_config_service_1 = require("../services/store-theme-config.service");
/** GET /store-theme-config/:storeId/:themeId */
exports.getStoreThemeConfigByStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, themeId } = req.params;
    const data = await (0, store_theme_config_service_1.loadStoreThemeConfig)(storeId, themeId);
    res.status(200).json({ success: true, data });
});
/** PUT /store-theme-config/:storeId/:themeId — body: { values } | { overrides } | { config } */
exports.putStoreThemeConfigByStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, themeId } = req.params;
    const { config, overrides, values } = req.body;
    const data = await (0, store_theme_config_service_1.saveStoreThemeConfig)(storeId, themeId, { config, overrides, values });
    res.status(200).json({
        success: true,
        message: "Theme configuration saved",
        data,
    });
});
