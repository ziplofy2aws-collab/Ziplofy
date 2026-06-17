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
exports.Company = exports.COMPANY_ORDER_SUBMISSION = exports.COMPANY_TAX_SETTINGS = exports.COMPANY_PAYMENT_TERMS = void 0;
exports.resolveCompanyBillingAddress = resolveCompanyBillingAddress;
const mongoose_1 = __importStar(require("mongoose"));
exports.COMPANY_PAYMENT_TERMS = [
    "none",
    "due_on_fulfillment",
    "net-7",
    "net-15",
    "net-30",
    "net-45",
    "net-60",
    "net-90",
];
exports.COMPANY_TAX_SETTINGS = ["collect", "collect_unless_exempt", "dont_collect"];
exports.COMPANY_ORDER_SUBMISSION = ["auto", "draft"];
const companyAddressSchema = new mongoose_1.Schema({
    country: { type: String, required: true, trim: true, maxLength: 100 },
    firstName: { type: String, required: true, trim: true, maxLength: 50 },
    lastName: { type: String, required: true, trim: true, maxLength: 50 },
    companyAttention: { type: String, trim: true, maxLength: 100 },
    address: { type: String, required: true, trim: true, maxLength: 200 },
    apartment: { type: String, trim: true, maxLength: 50 },
    city: { type: String, required: true, trim: true, maxLength: 100 },
    state: { type: String, trim: true, maxLength: 100 },
    pinCode: { type: String, trim: true, maxLength: 20 },
    phone: { type: String, trim: true, maxLength: 20 },
}, { _id: false });
const companyMainContactSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Customer", index: true },
    firstName: { type: String, trim: true, maxLength: 50 },
    lastName: { type: String, trim: true, maxLength: 50 },
    email: { type: String, trim: true, lowercase: true, maxLength: 255 },
    phoneNumber: { type: String, trim: true, maxLength: 20 },
}, { _id: false });
const companyLocationSchema = new mongoose_1.Schema({
    externalId: { type: String, trim: true, maxLength: 100 },
    shippingAddress: { type: companyAddressSchema, default: undefined },
    billingSameAsShipping: { type: Boolean, default: true },
    billingAddress: { type: companyAddressSchema, default: undefined },
    paymentTerms: {
        type: String,
        enum: exports.COMPANY_PAYMENT_TERMS,
        default: "none",
    },
    allowOneTimeShipAddress: { type: Boolean, default: false },
    orderSubmission: {
        type: String,
        enum: exports.COMPANY_ORDER_SUBMISSION,
        default: "auto",
    },
    taxId: { type: String, trim: true, maxLength: 100 },
    taxSettings: {
        type: String,
        enum: exports.COMPANY_TAX_SETTINGS,
        default: "collect",
    },
}, { _id: false });
const companySchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "Store ID is required"],
        index: true,
    },
    name: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
        maxLength: [255, "Company name cannot exceed 255 characters"],
        minLength: [1, "Company name is required"],
    },
    externalId: {
        type: String,
        trim: true,
        maxLength: [100, "Company ID cannot exceed 100 characters"],
    },
    mainContact: {
        type: companyMainContactSchema,
        default: undefined,
    },
    location: {
        type: companyLocationSchema,
        default: undefined,
    },
    notes: {
        type: String,
        trim: true,
        maxLength: [1000, "Notes cannot exceed 1000 characters"],
    },
}, {
    timestamps: true,
    versionKey: false,
});
companySchema.index({ storeId: 1, updatedAt: -1 });
companySchema.index({ storeId: 1, externalId: 1 }, {
    unique: true,
    partialFilterExpression: { externalId: { $type: "string", $ne: "" } },
});
exports.Company = mongoose_1.default.model("Company", companySchema);
/** Resolve billing address for reads — derive from shipping when flagged as same. */
function resolveCompanyBillingAddress(location) {
    if (!location)
        return undefined;
    if (location.billingSameAsShipping) {
        return location.shippingAddress;
    }
    return location.billingAddress;
}
