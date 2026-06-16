"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORE_SENDER_EMAIL_VERIFICATION_TTL_MS = exports.STORE_SENDER_EMAIL_VERIFICATION_PURPOSE = void 0;
exports.getStoreEmailVerificationSecret = getStoreEmailVerificationSecret;
exports.hashVerificationToken = hashVerificationToken;
exports.createStoreSenderEmailVerificationToken = createStoreSenderEmailVerificationToken;
exports.verifyStoreSenderEmailVerificationToken = verifyStoreSenderEmailVerificationToken;
exports.getStoreSenderEmailVerificationExpiryDate = getStoreSenderEmailVerificationExpiryDate;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.STORE_SENDER_EMAIL_VERIFICATION_PURPOSE = 'store_sender_email_verification';
exports.STORE_SENDER_EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
function getStoreEmailVerificationSecret() {
    const secret = process.env.STORE_EMAIL_VERIFICATION_SECRET ||
        process.env.JWT_SECRET ||
        process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw new Error('Store email verification secret is not configured');
    }
    return secret;
}
function hashVerificationToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
function createStoreSenderEmailVerificationToken(payload) {
    const secret = getStoreEmailVerificationSecret();
    return jsonwebtoken_1.default.sign({
        ...payload,
        purpose: exports.STORE_SENDER_EMAIL_VERIFICATION_PURPOSE,
    }, secret, { expiresIn: '24h' });
}
function verifyStoreSenderEmailVerificationToken(token) {
    const secret = getStoreEmailVerificationSecret();
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    if (decoded.purpose !== exports.STORE_SENDER_EMAIL_VERIFICATION_PURPOSE) {
        throw new Error('Invalid verification token purpose');
    }
    if (!decoded.storeId || !decoded.storeNotificationEmailId || !decoded.email) {
        throw new Error('Invalid verification token payload');
    }
    return decoded;
}
function getStoreSenderEmailVerificationExpiryDate() {
    return new Date(Date.now() + exports.STORE_SENDER_EMAIL_VERIFICATION_TTL_MS);
}
