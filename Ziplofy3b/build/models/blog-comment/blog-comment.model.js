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
exports.BlogComment = exports.BLOG_COMMENT_STATUS = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.BLOG_COMMENT_STATUS = ["pending", "published", "spam"];
const blogCommentSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "Store ID is required"],
        index: true,
    },
    articleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "BlogPost",
        required: [true, "Article ID is required"],
        index: true,
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxLength: [120, "Name cannot exceed 120 characters"],
        minLength: [1, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        maxLength: [255, "Email cannot exceed 255 characters"],
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true,
        maxLength: [5000, "Message cannot exceed 5000 characters"],
        minLength: [1, "Message is required"],
    },
    status: {
        type: String,
        enum: exports.BLOG_COMMENT_STATUS,
        default: "pending",
    },
}, {
    timestamps: true,
    versionKey: false,
});
blogCommentSchema.index({ storeId: 1, createdAt: -1 });
blogCommentSchema.index({ articleId: 1, createdAt: -1 });
blogCommentSchema.index({ storeId: 1, articleId: 1, createdAt: -1 });
exports.BlogComment = mongoose_1.default.model("BlogComment", blogCommentSchema);
