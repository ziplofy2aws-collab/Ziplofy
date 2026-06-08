"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxDefault = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Tax Default Schema
const TaxDefaultSchema = new mongoose_1.Schema({
    countryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Country",
        required: [true, "Country ID is required"],
        index: true,
    },
    stateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "State",
        default: null,
        index: true,
    },
    taxLabel: {
        type: String,
        required: [true, "Tax label is required"],
        trim: true,
    },
    taxRate: {
        type: Number,
        required: [true, "Tax rate is required"],
        min: [0, "Tax rate cannot be negative"],
    },
    calculationMethod: {
        type: String,
        enum: ["added", "instead", "compounded", null],
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Avoid duplicate defaults per state/country
TaxDefaultSchema.index({ countryId: 1, stateId: 1 }, { unique: true });
// Export the TaxDefault model
exports.TaxDefault = mongoose_1.default.model("TaxDefault", TaxDefaultSchema);
