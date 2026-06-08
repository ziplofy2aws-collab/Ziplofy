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
exports.StoreBillingAddress = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const storeBillingAddressSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "Store ID is required"],
        index: true,
    },
    legalBusinessName: {
        type: String,
        required: [true, "Legal business name is required"],
        trim: true,
        maxLength: [150, "Legal business name cannot exceed 150 characters"],
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
        maxLength: [100, "Country cannot exceed 100 characters"],
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        maxLength: [200, "Address cannot exceed 200 characters"],
    },
    apartment: {
        type: String,
        trim: true,
        maxLength: [50, "Apartment/suite cannot exceed 50 characters"],
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxLength: [100, "City cannot exceed 100 characters"],
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        maxLength: [100, "State cannot exceed 100 characters"],
    },
    pinCode: {
        type: String,
        required: [true, "PIN code is required"],
        trim: true,
        maxLength: [20, "PIN code cannot exceed 20 characters"],
    },
}, { timestamps: true, versionKey: false });
storeBillingAddressSchema.index({ storeId: 1, createdAt: -1 });
exports.StoreBillingAddress = mongoose_1.default.model("StoreBillingAddress", storeBillingAddressSchema);
