"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STOREFRONT_POLICY_TYPES = void 0;
exports.hasMeaningfulPolicyContent = hasMeaningfulPolicyContent;
exports.isStorefrontPolicyType = isStorefrontPolicyType;
/** True when policy text/HTML has visible content (not blank or empty rich-text blocks). */
function hasMeaningfulPolicyContent(content) {
    if (!content || !content.trim())
        return false;
    const stripped = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();
    return stripped.length > 0;
}
exports.STOREFRONT_POLICY_TYPES = [
    'return-refund',
    'privacy',
    'terms',
    'shipping',
    'contact',
];
function isStorefrontPolicyType(value) {
    return exports.STOREFRONT_POLICY_TYPES.includes(value);
}
