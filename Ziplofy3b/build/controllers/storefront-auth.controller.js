"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.storefrontMe = exports.storefrontLogin = exports.storefrontSignup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const models_1 = require("../models");
const email_utils_1 = require("../utils/email.utils");
const error_utils_1 = require("../utils/error.utils");
function signCustomerToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}
exports.storefrontSignup = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, firstName, lastName, email, password } = req.body;
    if (!storeId || !mongoose_1.default.Types.ObjectId.isValid(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (!firstName || !lastName || !email || !password)
        throw new error_utils_1.CustomError('firstName, lastName, email, password are required', 400);
    const existing = await models_1.Customer.findOne({ storeId, email: email.toLowerCase() }).lean();
    if (existing)
        throw new error_utils_1.CustomError('Email already in use', 409);
    const hash = await bcryptjs_1.default.hash(password, 10);
    const created = await models_1.Customer.create({ storeId, firstName, lastName, email: email.toLowerCase(), phoneNumber: '', password: hash });
    const token = signCustomerToken({ _id: created._id.toString(), storeId });
    const secureCustomerInfo = {
        _id: created._id.toString(),
        storeId: created.storeId.toString(),
        firstName: created.firstName,
        lastName: created.lastName,
        language: created.language,
        email: created.email,
        phoneNumber: created.phoneNumber ?? '',
        isVerified: created.isVerified ?? false,
        agreedToMarketingEmails: created.agreedToMarketingEmails ?? false,
        agreedToSmsMarketing: created.agreedToSmsMarketing ?? false,
        collectTax: created.collectTax,
        tagIds: created.tagIds ?? [],
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        defaultAddress: created.defaultAddress?.toString() ?? '',
    };
    res
        .cookie('accessToken', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 })
        .status(201)
        .json({ success: true, data: secureCustomerInfo, token });
});
exports.storefrontLogin = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, email, password } = req.body;
    if (!storeId || !mongoose_1.default.Types.ObjectId.isValid(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (!email || !password)
        throw new error_utils_1.CustomError('email and password are required', 400);
    const customer = await models_1.Customer.findOne({ storeId, email: email.toLowerCase() }).select('+password');
    if (!customer || !customer.password)
        throw new error_utils_1.CustomError('Invalid credentials', 401);
    const ok = await bcryptjs_1.default.compare(password, customer.password);
    if (!ok)
        throw new error_utils_1.CustomError('Invalid credentials', 401);
    const token = signCustomerToken({ _id: customer._id.toString(), storeId });
    const secureCustomerInfo = {
        _id: customer._id.toString(),
        storeId: customer.storeId.toString(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        language: customer.language,
        email: customer.email,
        phoneNumber: customer.phoneNumber ?? '',
        isVerified: customer.isVerified ?? false,
        agreedToMarketingEmails: customer.agreedToMarketingEmails ?? false,
        agreedToSmsMarketing: customer.agreedToSmsMarketing ?? false,
        collectTax: customer.collectTax,
        tagIds: customer.tagIds ?? [],
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        defaultAddress: customer.defaultAddress?.toString() ?? '',
    };
    res
        .cookie('customer_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json({ success: true, data: secureCustomerInfo, token });
});
exports.storefrontMe = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    // Return the same shape as signup/login without virtuals
    const me = req.storefrontUser;
    if (!me)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    const secureCustomerInfo = {
        _id: me._id.toString(),
        storeId: me.storeId.toString(),
        firstName: me.firstName,
        lastName: me.lastName,
        language: me.language,
        email: me.email,
        phoneNumber: me.phoneNumber ?? '',
        isVerified: me.isVerified ?? false,
        agreedToMarketingEmails: me.agreedToMarketingEmails ?? false,
        agreedToSmsMarketing: me.agreedToSmsMarketing ?? false,
        collectTax: me.collectTax,
        tagIds: me.tagIds ?? [],
        createdAt: me.createdAt,
        updatedAt: me.updatedAt,
        defaultAddress: me.defaultAddress?.toString() ?? '',
    };
    res.json({ success: true, data: secureCustomerInfo });
});
// Forgot Password - Send reset email
exports.forgotPassword = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { email, storeId } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }
    if (!storeId) {
        return res.status(400).json({
            success: false,
            message: 'Store ID is required'
        });
    }
    // Validate storeId format
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid store ID format'
        });
    }
    // Check if store exists
    const store = await models_1.Store.findById(storeId);
    if (!store) {
        return res.status(400).json({
            success: false,
            message: 'Store not found'
        });
    }
    // Check if customer exists for this store
    const customer = await models_1.Customer.findOne({
        email: email.toLowerCase(),
        storeId: storeId
    });
    console.log('customer data is', customer);
    if (!customer) {
        // Return success even if email doesn't exist (security best practice)
        return res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent'
        });
    }
    // Generate JWT token
    const tokenPayload = {
        userId: customer._id.toString(),
        email: customer.email,
        type: 'password_reset'
    };
    const resetToken = jsonwebtoken_1.default.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    // Create reset password token record
    const resetPasswordToken = new models_1.ResetPasswordToken({
        token: resetToken,
        userId: customer._id,
        storeId: customer.storeId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });
    await resetPasswordToken.save();
    const storeSubdomain = await models_1.Subdomain.findOne({ storeId: store._id });
    if (!storeSubdomain) {
        return res.status(400).json({
            success: false,
            message: 'Store subdomain not found'
        });
    }
    // Generate URL based on environment
    const baseUrl = config_1.config.clientUrl.replace(/^https?:\/\//, ''); // Remove protocol
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const resetUrl = `${protocol}://${storeSubdomain.subdomain}.${baseUrl}/auth/reset-password?reset-token=${resetToken}`;
    await (0, email_utils_1.sendEmail)({
        to: customer.email,
        subject: 'Password Reset',
        body: `Click the link below to reset your password: ${resetUrl}`,
        url: resetUrl
    });
    res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
    });
});
// Reset Password - Handle password reset
exports.resetPassword = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { token, newPassword, storeId } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Token and new password are required'
        });
    }
    if (!storeId) {
        return res.status(400).json({
            success: false,
            message: 'Store ID is required'
        });
    }
    // Validate storeId format
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid store ID format'
        });
    }
    // Check if store exists
    const store = await models_1.Store.findById(storeId);
    if (!store) {
        return res.status(400).json({
            success: false,
            message: 'Store not found'
        });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }
    // Verify the JWT token first
    let tokenPayload;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        // Validate token type
        if (decoded.type !== 'password_reset') {
            return res.status(400).json({
                success: false,
                message: 'Invalid token type'
            });
        }
        tokenPayload = decoded;
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
        });
    }
    // Find the reset token in database with storeId validation
    const resetTokenRecord = await models_1.ResetPasswordToken.findOne({
        token,
        storeId: storeId,
        expiresAt: { $gt: new Date() }
    });
    if (!resetTokenRecord) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
        });
    }
    // Find the customer using the token payload
    const customer = await models_1.Customer.findOne({
        _id: tokenPayload.userId,
        storeId: storeId
    });
    if (!customer) {
        return res.status(400).json({
            success: false,
            message: 'Customer not found'
        });
    }
    // Verify the email matches
    if (customer.email !== tokenPayload.email) {
        return res.status(400).json({
            success: false,
            message: 'Token email mismatch'
        });
    }
    // Hash the new password
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
    // Update customer password
    customer.password = hashedPassword;
    await customer.save();
    // Delete the used token
    await models_1.ResetPasswordToken.findByIdAndDelete(resetTokenRecord._id);
    res.status(200).json({
        success: true,
        message: 'Password has been reset successfully'
    });
});
