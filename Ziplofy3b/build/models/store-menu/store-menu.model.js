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
exports.StoreMenu = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const storeMenuSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "Store ID is required"],
        index: true,
    },
    menuName: {
        type: String,
        required: [true, "Menu name is required"],
        trim: true,
        maxLength: [200, "Menu name cannot exceed 200 characters"],
        minLength: [1, "Menu name is required"],
    },
    handle: {
        type: String,
        required: [true, "Menu handle is required"],
        trim: true,
        lowercase: true,
        maxLength: [100, "Handle cannot exceed 100 characters"],
        match: [/^[a-z0-9-]+$/, "Handle can only contain lowercase letters, numbers, and hyphens"],
    },
}, {
    timestamps: true,
    versionKey: false,
});
storeMenuSchema.index({ storeId: 1, handle: 1 }, { unique: true });
storeMenuSchema.index({ storeId: 1, createdAt: -1 });
exports.StoreMenu = mongoose_1.default.model("StoreMenu", storeMenuSchema);
