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
exports.Collections = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const collectionSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "Store ID is required"],
    },
    title: {
        type: String,
        required: [true, "Collection title is required"],
        trim: true,
        maxLength: [200, "Title cannot exceed 200 characters"],
        minLength: [2, "Title must be at least 2 characters"],
    },
    imageUrl: {
        type: String,
        trim: true,
        maxLength: [2000, "Image URL cannot exceed 2000 characters"],
    },
    imageAltText: {
        type: String,
        trim: true,
        maxLength: [500, "Image alt text cannot exceed 500 characters"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxLength: [5000, "Description cannot exceed 5000 characters"],
    },
    pageTitle: {
        type: String,
        required: [true, "Page title is required"],
        trim: true,
        maxLength: [200, "Page title cannot exceed 200 characters"],
        minLength: [2, "Page title must be at least 2 characters"],
    },
    metaDescription: {
        type: String,
        required: [true, "Meta description is required"],
        trim: true,
        maxLength: [500, "Meta description cannot exceed 500 characters"],
        minLength: [10, "Meta description must be at least 10 characters"],
    },
    urlHandle: {
        type: String,
        required: [true, "URL handle is required"],
        trim: true,
        maxLength: [100, "URL handle cannot exceed 100 characters"],
        minLength: [2, "URL handle must be at least 2 characters"],
        match: [/^[a-z0-9-]+$/, "URL handle can only contain lowercase letters, numbers, and hyphens"],
    },
    productSort: {
        type: String,
        enum: ['manual', 'title-asc', 'title-desc', 'price-high', 'price-low', 'newest', 'oldest'],
        default: 'manual',
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published',
    },
}, {
    timestamps: true,
    versionKey: false,
});
collectionSchema.index({ title: 1 });
collectionSchema.index({ storeId: 1 });
collectionSchema.index({ urlHandle: 1 });
collectionSchema.index({ storeId: 1, urlHandle: 1 });
collectionSchema.index({ createdAt: -1 });
collectionSchema.index({ updatedAt: -1 });
exports.Collections = mongoose_1.default.model("Collections", collectionSchema);
