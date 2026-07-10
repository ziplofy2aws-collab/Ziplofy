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
exports.Store = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateStoreCode() {
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
    }
    return code;
}
const storeSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    storeName: {
        type: String,
        required: [true, "Store name is required"],
        trim: true,
        maxLength: [100, "Store name cannot exceed 100 characters"],
        minLength: [2, "Store name must be at least 2 characters"],
    },
    storeDescription: {
        type: String,
        required: [true, "Store description is required"],
        trim: true,
        maxLength: [500, "Store description cannot exceed 500 characters"],
        minLength: [10, "Store description must be at least 10 characters"],
    },
    appliedTheme: {
        type: mongoose_1.Schema.Types.ObjectId,
        default: null,
        index: true,
    },
    appliedCustomThemeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "StoreCustomTheme",
        default: null,
        index: true,
    },
    storeCode: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
    },
    defaultLocation: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Location',
        default: null,
        index: true
    },
}, {
    timestamps: true,
    versionKey: false
});
// Index for better query performance
storeSchema.index({ userId: 1 });
storeSchema.index({ storeName: 1 });
storeSchema.index({ appliedTheme: 1 });
storeSchema.index({ appliedCustomThemeId: 1 });
// Ensure unique store name per user
storeSchema.index({ userId: 1, storeName: 1 }, { unique: true });
storeSchema.index({ storeCode: 1 }, { unique: true, sparse: true });
storeSchema.pre("save", async function (next) {
    if (!this.storeCode) {
        const Model = this.constructor;
        let attempts = 0;
        let code = "";
        do {
            code = generateStoreCode();
            const existing = await Model.findOne({ storeCode: code });
            if (!existing)
                break;
            attempts++;
        } while (attempts < 10);
        this.storeCode = code;
    }
    next();
});
exports.Store = mongoose_1.default.model("Store", storeSchema);
