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
exports.Variants = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Variants Schema
const variantsSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Variant name is required"],
        trim: true,
        maxLength: [100, "Variant name cannot exceed 100 characters"],
        minLength: [2, "Variant name must be at least 2 characters"],
        unique: true,
    },
    values: [{
            type: String,
            required: [true, "Variant value is required"],
            trim: true,
            maxLength: [100, "Variant value cannot exceed 100 characters"],
            minLength: [1, "Variant value must be at least 1 character"],
        }],
}, {
    timestamps: true,
    versionKey: false
});
// Indexes for better performance
variantsSchema.index({ name: 1 });
variantsSchema.index({ values: 1 });
variantsSchema.index({ createdAt: -1 });
variantsSchema.index({ updatedAt: -1 });
// Text search index for searching variants
variantsSchema.index({
    name: 'text',
    values: 'text'
});
// Export the Variants model
exports.Variants = mongoose_1.default.model("Variants", variantsSchema);
