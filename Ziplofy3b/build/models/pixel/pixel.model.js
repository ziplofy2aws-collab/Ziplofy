"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pixel = exports.DataSaleOption = void 0;
const mongoose_1 = require("mongoose");
var DataSaleOption;
(function (DataSaleOption) {
    DataSaleOption["QUALIFIES_AS_DATA_SALE"] = "qualifies_as_data_sale";
    DataSaleOption["QUALIFIES_WITH_LIMITED_USE"] = "qualifies_as_data_sale_limited_use";
    DataSaleOption["DOES_NOT_QUALIFY"] = "does_not_qualify_as_data_sale";
})(DataSaleOption || (exports.DataSaleOption = DataSaleOption = {}));
const PixelSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true,
    },
    pixelName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        required: true,
        trim: true,
    },
    required: {
        type: Boolean,
        default: false,
    },
    notRequired: {
        type: Boolean,
        default: true,
    },
    marketing: {
        type: Boolean,
        default: false,
    },
    analytics: {
        type: Boolean,
        default: false,
    },
    preferences: {
        type: Boolean,
        default: false,
    },
    dataSale: {
        type: String,
        enum: Object.values(DataSaleOption),
        default: DataSaleOption.DOES_NOT_QUALIFY,
    },
    code: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});
exports.Pixel = (0, mongoose_1.model)('Pixel', PixelSchema);
