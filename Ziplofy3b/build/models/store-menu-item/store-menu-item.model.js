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
exports.StoreMenuItem = exports.MENU_ITEM_LINK_TYPES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.MENU_ITEM_LINK_TYPES = [
    "homepage",
    "all-collections",
    "all-products",
    "specific-collection",
    "specific-product",
    "custom",
];
const storeMenuItemSchema = new mongoose_1.Schema({
    menuId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "StoreMenu",
        required: [true, "Menu ID is required"],
        index: true,
    },
    label: {
        type: String,
        required: [true, "Label is required"],
        trim: true,
        maxLength: [200, "Label cannot exceed 200 characters"],
        minLength: [1, "Label is required"],
    },
    linkType: {
        type: String,
        enum: exports.MENU_ITEM_LINK_TYPES,
        required: [true, "Link type is required"],
    },
    link: {
        type: String,
        trim: true,
        maxLength: [2000, "Link cannot exceed 2000 characters"],
    },
    collectionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Collections",
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
    },
    position: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
});
storeMenuItemSchema.index({ menuId: 1, position: 1 });
exports.StoreMenuItem = mongoose_1.default.model("StoreMenuItem", storeMenuItemSchema);
