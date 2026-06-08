"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogout = exports.changePassword = exports.verifyAdminInvite = exports.requestEditVerificationOtp = exports.resendAdminLoginOtp = exports.verifyAdminLoginOtp = exports.adminLoginStep1 = exports.adminLogin = exports.getMe = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const user_model_1 = require("../models/user.model");
const role_model_1 = require("../models/role.model");
const login_otp_model_1 = require("../models/login-otp.model");
const edit_verification_otp_model_1 = require("../models/edit-verification-otp.model");
const pending_admin_user_model_1 = require("../models/pending-admin-user.model");
const email_utils_1 = require("../utils/email.utils");
exports.getMe = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    console.log("🔍 /auth/me - User accessing roles and permission section:");
    console.log("User ID:", req.user?.id);
    console.log("User Email:", req.user?.email);
    console.log("User Role:", req.user?.role);
    console.log("User Name:", req.user?.name);
    console.log("Is Super Admin:", req.user?.superAdmin);
    console.log("Assigned Support Developer ID:", req.user?.assignedSupportDeveloperId);
    console.log("Full User Object:", JSON.stringify(req.user, null, 2));
    // Always fetch user with role populated (including permissions) for consistent permission resolution
    const user = await user_model_1.User.findById(req.user?.id).select("-password").populate("role");
    if (user && user.role) {
        const role = user.role;
        const roleName = role.name || req.user?.role;
        const isSuperAdmin = role.isSuperAdmin || roleName === "super-admin";
        req.user.role = roleName;
        req.user.superAdmin = isSuperAdmin;
        // Include full role with permissions so frontend can render sidebar without extra /roles call
        req.user.roleWithPermissions = {
            name: role.name,
            isSuperAdmin: role.isSuperAdmin || role.name === "super-admin",
            permissions: role.permissions || [],
        };
        console.log("✅ User role with permissions attached:", roleName, "permissions count:", role.permissions?.length || 0);
    }
    res.status(200).json({
        success: true,
        data: req.user
    });
});
exports.adminLogin = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        throw new error_utils_1.CustomError("Please provide email and password", 400);
    const user = await user_model_1.User.findOne({ email }).select("+password role status name email lastLogin");
    if (!user)
        throw new error_utils_1.CustomError("Invalid credentials", 401);
    if (user.status === "suspended")
        throw new error_utils_1.CustomError("Your account has been suspended. Please contact the administrator.", 403);
    const role = await role_model_1.Role.findById(user.role);
    if (!role)
        throw new error_utils_1.CustomError("Role not found", 401);
    const adminRoleNames = ["super-admin", "support-admin", "developer-admin", "client-admin", "admin"];
    if (!adminRoleNames.includes(role.name))
        throw new error_utils_1.CustomError("Not authorized as admin", 403);
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new error_utils_1.CustomError("Invalid credentials", 401);
    const token = jsonwebtoken_1.default.sign({ uid: user._id.toString(), email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30d" });
    user.lastLogin = new Date();
    user.status = "active"; // All admins: active when logged in
    await user.save();
    res.status(200).json({
        accessToken: token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            roleId: role._id.toString(),
            roleName: role.name,
            roleLevel: 1, // Default level since we removed level from role model
            status: user.status,
            lastLogin: user.lastLogin,
            isSuperAdmin: role.isSuperAdmin || role.name === 'super-admin',
        }
    });
});
// Step 1: verify password and send OTP
exports.adminLoginStep1 = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        throw new error_utils_1.CustomError("Please provide email and password", 400);
    const user = await user_model_1.User.findOne({ email }).select("+password role status name email lastLogin");
    if (!user)
        throw new error_utils_1.CustomError("Invalid credentials", 401);
    if (user.status === "suspended")
        throw new error_utils_1.CustomError("Your account has been suspended. Please contact the administrator.", 403);
    const role = await role_model_1.Role.findById(user.role);
    if (!role)
        throw new error_utils_1.CustomError("Role not found", 401);
    const adminRoleNames = ["super-admin", "support-admin", "developer-admin", "client-admin", "admin"];
    if (!adminRoleNames.includes(role.name))
        throw new error_utils_1.CustomError("Not authorized as admin", 403);
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new error_utils_1.CustomError("Invalid credentials", 401);
    // generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    // upsert OTP for this email
    await login_otp_model_1.LoginOtp.deleteMany({ email });
    await login_otp_model_1.LoginOtp.create({ userId: user._id, email, code, expiresAt, attempts: 0 });
    // send email
    await (0, email_utils_1.sendEmail)({
        to: email,
        subject: "Your Ziplofy Admin Login Code",
        body: `<p>Your verification code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in 5 minutes.</p>`
    });
    res.status(200).json({
        success: true,
        twoFactorRequired: true,
        // return lightweight context so frontend can proceed to otp step
        context: { email, userId: user._id.toString() }
    });
});
// Step 2: verify OTP and issue token
exports.verifyAdminLoginOtp = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code)
        throw new error_utils_1.CustomError("Missing fields", 400);
    const otp = await login_otp_model_1.LoginOtp.findOne({ email });
    if (!otp)
        throw new error_utils_1.CustomError("Code expired or not found", 400);
    if (otp.expiresAt < new Date()) {
        await login_otp_model_1.LoginOtp.deleteMany({ email });
        throw new error_utils_1.CustomError("Code expired", 400);
    }
    if (otp.code !== code) {
        otp.attempts += 1;
        await otp.save();
        throw new error_utils_1.CustomError("Invalid code", 401);
    }
    const user = await user_model_1.User.findOne({ email }).select("role status name email lastLogin");
    if (!user)
        throw new error_utils_1.CustomError("User not found", 404);
    if (user.status === "suspended")
        throw new error_utils_1.CustomError("Your account has been suspended. Please contact the administrator.", 403);
    const role = await role_model_1.Role.findById(user.role);
    if (!role)
        throw new error_utils_1.CustomError("Role not found", 404);
    const token = jsonwebtoken_1.default.sign({ uid: user._id.toString(), email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30d" });
    user.lastLogin = new Date();
    user.status = "active"; // All admins: active when logged in
    await user.save();
    await login_otp_model_1.LoginOtp.deleteMany({ email });
    res.status(200).json({
        accessToken: token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            roleId: role._id.toString(),
            roleName: role.name,
            roleLevel: 1,
            status: user.status,
            lastLogin: user.lastLogin,
            isSuperAdmin: role.isSuperAdmin || role.name === 'super-admin',
        }
    });
});
// Resend OTP with 60s cooldown
exports.resendAdminLoginOtp = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw new error_utils_1.CustomError("Email is required", 400);
    const existing = await login_otp_model_1.LoginOtp.findOne({ email }).sort({ createdAt: -1 });
    const now = new Date();
    if (existing && existing.createdAt && now.getTime() - existing.createdAt.getTime() < 60 * 1000) {
        const remaining = 60 - Math.floor((now.getTime() - existing.createdAt.getTime()) / 1000);
        throw new error_utils_1.CustomError(`Please wait ${remaining}s before resending code`, 429);
    }
    // Ensure user exists and not suspended
    const user = await user_model_1.User.findOne({ email }).select("role status name email");
    if (!user)
        throw new error_utils_1.CustomError("User not found", 404);
    if (user.status === "suspended")
        throw new error_utils_1.CustomError("Your account has been suspended. Please contact the administrator.", 403);
    // generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await login_otp_model_1.LoginOtp.deleteMany({ email });
    await login_otp_model_1.LoginOtp.create({ userId: user._id, email, code, expiresAt, attempts: 0 });
    await (0, email_utils_1.sendEmail)({
        to: email,
        subject: "Your Ziplofy Admin Login Code",
        body: `<p>Your verification code is:</p><h2 style=\"letter-spacing:4px\">${code}</h2><p>This code expires in 5 minutes.</p>`
    });
    res.status(200).json({ success: true, message: "Code resent" });
});
// Request OTP for edit verification - sends to super-admin email (required for all users including super-admin)
exports.requestEditVerificationOtp = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    if (!req.user)
        throw new error_utils_1.CustomError("Unauthorized", 401);
    // Find super-admin user - OTP always sent to super-admin email
    const superAdminRole = await role_model_1.Role.findOne({ name: "super-admin" });
    if (!superAdminRole)
        throw new error_utils_1.CustomError("Super-admin role not found", 500);
    const superAdminUser = await user_model_1.User.findOne({ role: superAdminRole._id, status: "active" });
    if (!superAdminUser)
        throw new error_utils_1.CustomError("No active super-admin found", 500);
    const superAdminEmail = superAdminUser.email;
    // 60s cooldown
    const existing = await edit_verification_otp_model_1.EditVerificationOtp.findOne({ email: superAdminEmail }).sort({ createdAt: -1 });
    const now = new Date();
    if (existing && existing.createdAt && now.getTime() - existing.createdAt.getTime() < 60 * 1000) {
        const remaining = 60 - Math.floor((now.getTime() - existing.createdAt.getTime()) / 1000);
        throw new error_utils_1.CustomError(`Please wait ${remaining}s before requesting a new code`, 429);
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await edit_verification_otp_model_1.EditVerificationOtp.deleteMany({ email: superAdminEmail });
    await edit_verification_otp_model_1.EditVerificationOtp.create({ email: superAdminEmail, code, expiresAt, attempts: 0 });
    await (0, email_utils_1.sendEmail)({
        to: superAdminEmail,
        subject: "Ziplofy - Edit Verification Code",
        body: `<p>A user has requested to make changes. Your verification code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in 5 minutes. Share this code with the user to approve the edit.</p>`,
    });
    res.status(200).json({
        success: true,
        message: "Verification code sent to super-admin email",
    });
});
// Public: verify admin invite token and create user
exports.verifyAdminInvite = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { token } = req.query;
    if (!token) {
        throw new error_utils_1.CustomError("Verification token is required", 400);
    }
    const pending = await pending_admin_user_model_1.PendingAdminUser.findOne({ verificationToken: token });
    if (!pending) {
        throw new error_utils_1.CustomError("Invalid or expired verification link", 400);
    }
    if (pending.expiresAt < new Date()) {
        await pending_admin_user_model_1.PendingAdminUser.deleteOne({ _id: pending._id });
        throw new error_utils_1.CustomError("Verification link has expired", 400);
    }
    // Check if user already exists (e.g. already verified)
    const existingUser = await user_model_1.User.findOne({ email: pending.email });
    if (existingUser) {
        await pending_admin_user_model_1.PendingAdminUser.deleteOne({ _id: pending._id });
        return res.status(200).json({
            success: true,
            message: "Account already verified. You can log in.",
        });
    }
    await user_model_1.User.create({
        email: pending.email,
        name: pending.name,
        password: pending.password,
        role: pending.role,
        status: "active",
    });
    await pending_admin_user_model_1.PendingAdminUser.deleteOne({ _id: pending._id });
    res.status(200).json({
        success: true,
        message: "Verification successful. Your account has been activated. You can now log in.",
    });
});
exports.changePassword = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!req.user)
        throw new error_utils_1.CustomError("Unauthorized", 401);
    if (!currentPassword || !newPassword)
        throw new error_utils_1.CustomError("Missing fields", 400);
    const user = await user_model_1.User.findById(new mongoose_1.default.Types.ObjectId(req.user.id)).select("+password");
    if (!user)
        throw new error_utils_1.CustomError("User not found", 404);
    const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isMatch)
        throw new error_utils_1.CustomError("Current password is incorrect", 400);
    if (newPassword.length < 8)
        throw new error_utils_1.CustomError("Password must be at least 8 characters", 400);
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
});
// Logout: set admin status to inactive (status is login-based for all admins)
exports.adminLogout = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    if (!req.user)
        return res.status(200).json({ success: true });
    await user_model_1.User.findByIdAndUpdate(req.user.id, { status: "inactive" });
    res.status(200).json({ success: true });
});
