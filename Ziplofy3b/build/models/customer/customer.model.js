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
exports.Customer = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Customer Schema
const customerSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "Store ID is required"],
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxLength: [50, "First name cannot exceed 50 characters"],
        minLength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        maxLength: [50, "Last name cannot exceed 50 characters"],
        minLength: [2, "Last name must be at least 2 characters"],
    },
    language: {
        type: String,
        required: [true, "Language is required"],
        trim: true,
        maxLength: [10, "Language code cannot exceed 10 characters"],
        default: "en",
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
        maxLength: [100, "Email cannot exceed 100 characters"],
    },
    phoneNumber: {
        type: String,
        required: false,
        trim: true,
        maxLength: [20, "Phone number cannot exceed 20 characters"],
    },
    password: {
        type: String,
        required: false,
        trim: true,
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    isVerified: {
        type: Boolean,
        required: false,
        default: false,
    },
    agreedToMarketingEmails: {
        type: Boolean,
        default: false,
    },
    agreedToSmsMarketing: {
        type: Boolean,
        default: false,
    },
    collectTax: {
        type: String,
        enum: ['collect', 'dont_collect', 'collect_unless_exempt'],
        default: 'collect',
        required: [true, "Tax collection setting is required"],
    },
    notes: {
        type: String,
        trim: true,
        maxLength: [1000, "Notes cannot exceed 1000 characters"],
    },
    tagIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "CustomerTags",
        }],
    defaultAddress: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "CustomerAddress",
        required: false,
    },
}, {
    timestamps: true,
    versionKey: false
});
// Indexes for better performance
customerSchema.index({ storeId: 1 });
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ phoneNumber: 1 });
customerSchema.index({ firstName: 1, lastName: 1 });
customerSchema.index({ tagIds: 1 });
customerSchema.index({ defaultAddress: 1 });
customerSchema.index({ createdAt: -1 });
// Virtual for full name
customerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
// Virtual for full address can be populated client-side using addressId
// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });
// Pre-save middleware to validate email uniqueness globally
customerSchema.pre('save', async function (next) {
    if (this.isModified('email')) {
        const existingCustomer = await exports.Customer.findOne({
            email: this.email,
            _id: { $ne: this._id }
        });
        if (existingCustomer) {
            const error = new Error('Email already exists');
            return next(error);
        }
    }
    next();
});
// Export the Customer model
exports.Customer = mongoose_1.default.model("Customer", customerSchema);
