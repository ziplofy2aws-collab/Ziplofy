"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Market = void 0;
const mongoose_1 = require("mongoose");
const MarketSchema = new mongoose_1.Schema({
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    parentMarketId: { type: mongoose_1.Types.ObjectId, ref: 'Market', default: null },
    isDefault: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'active',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.Market = (0, mongoose_1.model)('Market', MarketSchema);
