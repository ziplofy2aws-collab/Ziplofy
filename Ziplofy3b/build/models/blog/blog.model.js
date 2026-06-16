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
exports.Blog = exports.BLOG_COMMENTS_MODES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.BLOG_COMMENTS_MODES = ["disabled", "moderated", "allowed"];
const blogSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "Store ID is required"],
        index: true,
    },
    title: {
        type: String,
        required: [true, "Blog title is required"],
        trim: true,
        maxLength: [255, "Title cannot exceed 255 characters"],
        minLength: [1, "Blog title is required"],
    },
    pageTitle: {
        type: String,
        required: [true, "Page title is required"],
        trim: true,
        maxLength: [70, "Page title cannot exceed 70 characters"],
        minLength: [1, "Page title is required"],
    },
    metaDescription: {
        type: String,
        trim: true,
        maxLength: [320, "Meta description cannot exceed 320 characters"],
        default: "",
    },
    urlHandle: {
        type: String,
        required: [true, "URL handle is required"],
        trim: true,
        lowercase: true,
        maxLength: [100, "URL handle cannot exceed 100 characters"],
        minLength: [1, "URL handle is required"],
        match: [/^[a-z0-9-]+$/, "URL handle can only contain lowercase letters, numbers, and hyphens"],
    },
    comments: {
        type: String,
        enum: exports.BLOG_COMMENTS_MODES,
        default: "disabled",
    },
}, {
    timestamps: true,
    versionKey: false,
});
blogSchema.index({ storeId: 1, urlHandle: 1 }, { unique: true });
blogSchema.index({ storeId: 1, updatedAt: -1 });
exports.Blog = mongoose_1.default.model("Blog", blogSchema);
