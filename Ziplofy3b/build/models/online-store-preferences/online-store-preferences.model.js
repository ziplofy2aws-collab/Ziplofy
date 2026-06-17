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
exports.OnlineStorePreferences = exports.ONLINE_STORE_PREFERENCES_LIMITS = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/** Max lengths aligned with Online Store → Preferences UI. */
exports.ONLINE_STORE_PREFERENCES_LIMITS = {
    storefrontPassword: 100,
    messageToYourVisitors: 5000,
    seoHomePageTitle: 70,
    seoMetaDescription: 320,
};
const onlineStorePreferencesSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        unique: true,
        index: true,
    },
    passwordProtectionEnabled: {
        type: Boolean,
        default: false,
    },
    storefrontPassword: {
        type: String,
        trim: true,
        maxLength: [exports.ONLINE_STORE_PREFERENCES_LIMITS.storefrontPassword, 'Storefront password cannot exceed 100 characters'],
        default: undefined,
    },
    messageToYourVisitors: {
        type: String,
        trim: true,
        maxLength: [
            exports.ONLINE_STORE_PREFERENCES_LIMITS.messageToYourVisitors,
            'Message to visitors cannot exceed 5000 characters',
        ],
        default: undefined,
    },
    b2bCustomersOnly: {
        type: Boolean,
        default: false,
    },
    seoHomePageTitle: {
        type: String,
        trim: true,
        maxLength: [
            exports.ONLINE_STORE_PREFERENCES_LIMITS.seoHomePageTitle,
            'SEO home page title cannot exceed 70 characters',
        ],
        default: '',
    },
    seoMetaDescription: {
        type: String,
        trim: true,
        maxLength: [
            exports.ONLINE_STORE_PREFERENCES_LIMITS.seoMetaDescription,
            'SEO meta description cannot exceed 320 characters',
        ],
        default: '',
    },
    seoSocialImageUrl: {
        type: String,
        trim: true,
        default: '',
    },
    countryRedirectionEnabled: {
        type: Boolean,
        default: true,
    },
    languageRedirectionEnabled: {
        type: Boolean,
        default: false,
    },
    spamContactFormsEnabled: {
        type: Boolean,
        default: true,
    },
    spamAuthPagesEnabled: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
onlineStorePreferencesSchema.index({ storeId: 1 });
exports.OnlineStorePreferences = mongoose_1.default.models.OnlineStorePreferences ||
    mongoose_1.default.model('OnlineStorePreferences', onlineStorePreferencesSchema);
