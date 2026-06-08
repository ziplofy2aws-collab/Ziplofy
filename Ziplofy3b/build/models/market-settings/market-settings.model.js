"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketSettings = void 0;
const mongoose_1 = require("mongoose");
const MarketSettingsSchema = new mongoose_1.Schema({
    // 🏪 Associations
    marketId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Market', required: true, index: true },
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    // 💰 Currency
    currencyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Currency', required: true },
    // 🌐 Domain & Language
    domain: { type: String, required: true },
    locale: { type: String, required: true },
    languageCode: { type: String, required: true },
    countryCode: { type: String, required: true },
    subfolder: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    // 🧾 Taxes & Duties
    salesTaxCollecting: { type: Boolean, default: false },
    dutiesAndImportTaxCollecting: { type: Boolean, default: false },
    dutiesAndImportTaxDisplay: {
        type: String,
        enum: ['line_item', 'included_in_price'],
        required: false, // only relevant if duties are being collected
    },
    taxDisplay: {
        type: String,
        enum: ['dynamic', 'included', 'line_item'],
        default: 'dynamic',
        required: true,
    },
    // 🏬 Online Store Theme
    onlineStoreTheme: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Theme' },
}, { timestamps: true, versionKey: false });
// Ensure one settings document per market
MarketSettingsSchema.index({ marketId: 1 }, { unique: true });
exports.MarketSettings = (0, mongoose_1.model)('MarketSettings', MarketSettingsSchema);
