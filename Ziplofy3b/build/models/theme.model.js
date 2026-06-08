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
exports.Theme = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const s3AssetPartSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    url: { type: String, required: true },
    contentType: { type: String },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: false });
const contentRootSchema = new mongoose_1.Schema({
    prefix: { type: String, required: true },
    fileCount: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: false });
const ThemeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Theme name is required"],
        trim: true,
        maxLength: [100, "Theme name cannot exceed 100 characters"],
    },
    description: {
        type: String,
        maxLength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ["travel", "business", "portfolio", "ecommerce", "blog", "education", "health", "food"],
    },
    plan: {
        type: String,
        required: [true, "Plan is required"],
        enum: ["free", "basic", "premium", "enterprise"],
    },
    price: {
        type: Number,
        default: 0,
    },
    themePath: {
        type: String,
        required: true,
        unique: true,
    },
    s3Assets: {
        type: new mongoose_1.Schema({
            contentRoot: { type: contentRootSchema, required: false },
            zip: { type: s3AssetPartSchema, required: false },
            thumbnail: { type: s3AssetPartSchema, required: false },
            reactThemeJs: { type: s3AssetPartSchema, required: false },
            reactThemeCss: { type: s3AssetPartSchema, required: false },
            reactThemeSchema: { type: s3AssetPartSchema, required: false },
            reactThemeDefaultConfig: { type: s3AssetPartSchema, required: false },
            reactThemeManifest: { type: s3AssetPartSchema, required: false },
        }, { _id: false }),
        required: true,
        validate: {
            validator(v) {
                if (!v)
                    return false;
                const hasZip = Boolean(v.zip?.key);
                const hasFolder = Boolean(v.contentRoot?.prefix);
                return hasZip !== hasFolder;
            },
            message: "s3Assets must have exactly one of: zip (legacy) or contentRoot (folder upload)",
        },
    },
    version: {
        type: String,
        default: "1.0.0",
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true,
    },
    downloads: {
        type: Number,
        default: 0,
    },
    installationCount: {
        type: Number,
        default: 0,
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    uploadBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
// Update timestamp before saving
ThemeSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
// Index for search functionality
ThemeSchema.index({ name: "text", description: "text", tags: "text" });
exports.Theme = mongoose_1.default.models.Theme || mongoose_1.default.model("Theme", ThemeSchema);
