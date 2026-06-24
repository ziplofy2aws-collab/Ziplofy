"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorefrontPolicyByType = exports.getStorefrontWrittenPoliciesByStoreId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_contact_info_model_1 = require("../models/store-contact-info/store-contact-info.model");
const store_privacy_policy_model_1 = require("../models/store-privacy-policy/store-privacy-policy.model");
const store_return_refund_policy_model_1 = require("../models/store-return-refund-policy/store-return-refund-policy.model");
const store_shipping_policy_model_1 = require("../models/store-shipping-policy/store-shipping-policy.model");
const store_terms_policy_model_1 = require("../models/store-terms-policy/store-terms-policy.model");
const error_utils_1 = require("../utils/error.utils");
const store_policy_content_util_1 = require("../utils/store-policy-content.util");
function assertValidStoreId(storeId) {
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
}
function toPublicPolicy(doc, content) {
    if (!doc || !(0, store_policy_content_util_1.hasMeaningfulPolicyContent)(content))
        return null;
    const updatedAt = doc.updatedAt;
    return {
        content: content.trim(),
        updatedAt: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
    };
}
async function loadPolicyByType(storeId, policyType) {
    switch (policyType) {
        case 'return-refund': {
            const doc = await store_return_refund_policy_model_1.StoreReturnRefundPolicy.findOne({ storeId })
                .select({ returnRefundPolicy: 1, updatedAt: 1 })
                .lean();
            return toPublicPolicy(doc, doc?.returnRefundPolicy);
        }
        case 'privacy': {
            const doc = await store_privacy_policy_model_1.StorePrivacyPolicy.findOne({ storeId })
                .select({ privacyPolicy: 1, updatedAt: 1 })
                .lean();
            return toPublicPolicy(doc, doc?.privacyPolicy);
        }
        case 'terms': {
            const doc = await store_terms_policy_model_1.StoreTermsPolicy.findOne({ storeId })
                .select({ termsPolicy: 1, updatedAt: 1 })
                .lean();
            return toPublicPolicy(doc, doc?.termsPolicy);
        }
        case 'shipping': {
            const doc = await store_shipping_policy_model_1.StoreShippingPolicy.findOne({ storeId })
                .select({ shippingPolicy: 1, updatedAt: 1 })
                .lean();
            return toPublicPolicy(doc, doc?.shippingPolicy);
        }
        case 'contact': {
            const doc = await store_contact_info_model_1.StoreContactInfo.findOne({ storeId })
                .select({ contactInfo: 1, updatedAt: 1 })
                .lean();
            return toPublicPolicy(doc, doc?.contactInfo);
        }
        default:
            return null;
    }
}
async function loadWrittenPoliciesForStore(storeId) {
    const [returnRefund, privacy, terms, shipping, contact] = await Promise.all([
        store_return_refund_policy_model_1.StoreReturnRefundPolicy.findOne({ storeId }).select({ returnRefundPolicy: 1, updatedAt: 1 }).lean(),
        store_privacy_policy_model_1.StorePrivacyPolicy.findOne({ storeId }).select({ privacyPolicy: 1, updatedAt: 1 }).lean(),
        store_terms_policy_model_1.StoreTermsPolicy.findOne({ storeId }).select({ termsPolicy: 1, updatedAt: 1 }).lean(),
        store_shipping_policy_model_1.StoreShippingPolicy.findOne({ storeId }).select({ shippingPolicy: 1, updatedAt: 1 }).lean(),
        store_contact_info_model_1.StoreContactInfo.findOne({ storeId }).select({ contactInfo: 1, updatedAt: 1 }).lean(),
    ]);
    return {
        returnRefund: toPublicPolicy(returnRefund, returnRefund?.returnRefundPolicy),
        privacy: toPublicPolicy(privacy, privacy?.privacyPolicy),
        terms: toPublicPolicy(terms, terms?.termsPolicy),
        shipping: toPublicPolicy(shipping, shipping?.shippingPolicy),
        contact: toPublicPolicy(contact, contact?.contactInfo),
    };
}
// GET /storefront/policies/store/:storeId
exports.getStorefrontWrittenPoliciesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    assertValidStoreId(storeId);
    const data = await loadWrittenPoliciesForStore(storeId);
    return res.status(200).json({
        success: true,
        data,
        message: 'Storefront written policies fetched',
    });
});
// GET /storefront/policies/store/:storeId/type/:policyType
exports.getStorefrontPolicyByType = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, policyType } = req.params;
    assertValidStoreId(storeId);
    if (!(0, store_policy_content_util_1.isStorefrontPolicyType)(policyType)) {
        throw new error_utils_1.CustomError('policyType must be one of: return-refund, privacy, terms, shipping, contact', 400);
    }
    const policy = await loadPolicyByType(storeId, policyType);
    return res.status(200).json({
        success: true,
        data: policy,
        message: policy ? 'Storefront policy fetched' : 'No policy found',
    });
});
