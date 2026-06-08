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
exports.CustomTheme = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CustomThemeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Theme name is required"],
        trim: true,
        maxLength: [100, "Theme name cannot exceed 100 characters"],
    },
    html: {
        type: String,
        required: false, // Not required - stored on disk for large themes
    },
    css: {
        type: String,
        required: false, // Not required - stored on disk for large themes
        default: "",
    },
    themePath: {
        type: String,
        required: true,
        unique: true,
    },
    directories: {
        theme: { type: String, required: true },
        thumbnail: { type: String, required: true },
        unzippedTheme: { type: String, required: true },
    },
    thumbnail: {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        uploadDate: {
            type: Date,
            default: Date.now,
        },
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true, versionKey: false });
// Index for faster queries
CustomThemeSchema.index({ createdBy: 1, createdAt: -1 });
CustomThemeSchema.index({ themePath: 1 });
exports.CustomTheme = mongoose_1.default.model("CustomTheme", CustomThemeSchema);
