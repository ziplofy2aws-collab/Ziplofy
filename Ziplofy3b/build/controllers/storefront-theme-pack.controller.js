"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreTheme = exports.getStorefrontReactThemePack = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const error_utils_1 = require("../utils/error.utils");
const store_model_1 = require("../models/store/store.model");
function readPackFile(packId) {
    const filePath = path_1.default.join(process.cwd(), "src", "data", "storefront-theme-packs", `${packId}.json`);
    const raw = fs_1.default.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}
/**
 * Network payload for React theme packs.
 * These files are what "travel over the network" to storefront clients.
 */
exports.getStorefrontReactThemePack = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId)
        throw new error_utils_1.CustomError("Store ID is required", 400);
    const store = await store_model_1.Store.findById(storeId).select("_id").lean();
    if (!store)
        throw new error_utils_1.CustomError("Store not found", 404);
    const theme1 = readPackFile("theme1");
    const theme2 = readPackFile("theme2");
    const packs = [theme1, theme2];
    // For now we keep active pack deterministic; can later be mapped from installed theme per store.
    const activePackId = "theme1";
    res.status(200).json({
        success: true,
        data: {
            storeId,
            activePackId,
            packs,
        },
    });
});
/**
 * Simple production-like endpoint requested by frontend:
 * GET /api/get-store-theme
 * Returns theme1 pack payload over network.
 */
exports.getStoreTheme = (0, error_utils_1.asyncErrorHandler)(async (_req, res) => {
    const theme1 = readPackFile("theme1");
    res.status(200).json({
        success: true,
        data: {
            activePackId: "theme1",
            theme: theme1,
            packs: [theme1],
        },
    });
});
