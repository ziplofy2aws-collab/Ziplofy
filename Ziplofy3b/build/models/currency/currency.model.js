"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currency = void 0;
const mongoose_1 = require("mongoose");
const CurrencySchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    symbol: { type: String, required: false },
    decimalPlaces: { type: Number, default: 2 },
    symbolPosition: {
        type: String,
        enum: ['before', 'after'],
        default: 'before',
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.Currency = (0, mongoose_1.model)('Currency', CurrencySchema);
