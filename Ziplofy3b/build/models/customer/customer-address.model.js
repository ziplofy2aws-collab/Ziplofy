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
exports.CustomerAddress = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const customerAddressSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Customer", required: [true, "Customer ID is required"] },
    countryId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Country", required: [true, "Country ID is required"], index: true },
    firstName: { type: String, required: [true, "First name is required"], trim: true, maxLength: [50, "First name cannot exceed 50 characters"] },
    lastName: { type: String, required: [true, "Last name is required"], trim: true, maxLength: [50, "Last name cannot exceed 50 characters"] },
    company: { type: String, trim: true, maxLength: [100, "Company name cannot exceed 100 characters"] },
    address: { type: String, required: [true, "Address is required"], trim: true, maxLength: [200, "Address cannot exceed 200 characters"] },
    apartment: { type: String, trim: true, maxLength: [50, "Apartment/suite cannot exceed 50 characters"] },
    city: { type: String, required: [true, "City is required"], trim: true, maxLength: [100, "City cannot exceed 100 characters"] },
    state: { type: String, required: [true, "State is required"], trim: true, maxLength: [100, "State cannot exceed 100 characters"] },
    pinCode: { type: String, required: [true, "Pin code is required"], trim: true, maxLength: [20, "Pin code cannot exceed 20 characters"] },
    phoneNumber: { type: String, required: [true, "Phone number is required"], trim: true, maxLength: [20, "Phone number cannot exceed 20 characters"] },
    addressType: { type: String, default: 'home' },
}, { timestamps: true, versionKey: false });
customerAddressSchema.index({ countryId: 1, city: 1 });
customerAddressSchema.index({ customerId: 1, createdAt: -1 });
exports.CustomerAddress = mongoose_1.default.model("CustomerAddress", customerAddressSchema);
