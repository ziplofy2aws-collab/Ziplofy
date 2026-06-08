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
exports.SupplierModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const supplierSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'storeId is required'],
        index: true,
    },
    company: {
        type: String,
        required: [true, 'Company is required'],
        trim: true,
        maxlength: [200, 'Company cannot exceed 200 characters'],
    },
    countryOrRegion: {
        type: String,
        required: [true, 'Country/Region is required'],
        trim: true,
        maxlength: [100, 'Country/Region cannot exceed 100 characters'],
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    apartmentSuite: {
        type: String,
        trim: true,
        maxlength: [100, 'Apartment/Suite cannot exceed 100 characters'],
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxlength: [100, 'State cannot exceed 100 characters'],
    },
    pinCode: {
        type: String,
        required: [true, 'PIN code is required'],
        trim: true,
        maxlength: [20, 'PIN code cannot exceed 20 characters'],
    },
    contactName: {
        type: String,
        required: [true, 'Contact name is required'],
        trim: true,
        maxlength: [120, 'Contact name cannot exceed 120 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        maxlength: [254, 'Email cannot exceed 254 characters'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        maxlength: [30, 'Phone number cannot exceed 30 characters'],
    },
}, {
    timestamps: true,
    versionKey: false,
});
supplierSchema.index({ storeId: 1, company: 1, email: 1 }, { unique: false });
exports.SupplierModel = mongoose_1.default.model('Supplier', supplierSchema);
