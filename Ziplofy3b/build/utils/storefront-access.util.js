"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STOREFRONT_UNLOCK_HEADER = void 0;
exports.signStorefrontUnlockToken = signStorefrontUnlockToken;
exports.verifyStorefrontUnlockToken = verifyStorefrontUnlockToken;
exports.extractStorefrontUnlockToken = extractStorefrontUnlockToken;
exports.isStorefrontUnlocked = isStorefrontUnlocked;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.STOREFRONT_UNLOCK_HEADER = 'x-storefront-unlock-token';
function signStorefrontUnlockToken(storeId) {
    return jsonwebtoken_1.default.sign({ storeId, type: 'storefront_unlock' }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}
function verifyStorefrontUnlockToken(token, storeId) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return decoded.type === 'storefront_unlock' && decoded.storeId === storeId;
    }
    catch {
        return false;
    }
}
function extractStorefrontUnlockToken(req) {
    const headerValue = req.headers[exports.STOREFRONT_UNLOCK_HEADER];
    if (typeof headerValue === 'string' && headerValue.trim()) {
        return headerValue.trim();
    }
    if (Array.isArray(headerValue) && headerValue[0]?.trim()) {
        return headerValue[0].trim();
    }
    return null;
}
function isStorefrontUnlocked(req, storeId) {
    const token = extractStorefrontUnlockToken(req);
    if (!token)
        return false;
    return verifyStorefrontUnlockToken(token, storeId);
}
