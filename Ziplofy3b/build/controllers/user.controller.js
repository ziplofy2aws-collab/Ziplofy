"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = exports.createUser = void 0;
const user_model_1 = require("../models/user.model");
const role_model_1 = require("../models/role.model");
const edit_verification_otp_model_1 = require("../models/edit-verification-otp.model");
const error_utils_1 = require("../utils/error.utils");
const activity_log_utils_1 = require("../utils/activity-log.utils");
exports.createUser = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    // Only super-admin can add users
    if (!req.user?.superAdmin) {
        throw new error_utils_1.CustomError("Only super-admin can add new users", 403);
    }
    const { name, email, password, role } = req.body;
    // Only allow assigning support-admin, developer-admin, or client-admin
    const allowedRoles = ["support-admin", "developer-admin", "client-admin"];
    if (!role || !allowedRoles.includes(role)) {
        throw new error_utils_1.CustomError("Role must be one of: support-admin, developer-admin, client-admin", 400);
    }
    const roleDoc = await role_model_1.Role.findOne({ name: role });
    if (!roleDoc) {
        throw new error_utils_1.CustomError(`Role '${role}' not found`, 400);
    }
    const existingUser = await user_model_1.User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new error_utils_1.CustomError("A user with this email already exists", 400);
    }
    const user = await user_model_1.User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: roleDoc._id,
        status: "active",
    });
    const userResponse = await user_model_1.User.findById(user._id).select("-password");
    (0, activity_log_utils_1.logActivity)(req, {
        action: "user_create",
        entityType: "user",
        entityId: user._id.toString(),
        entityName: name,
        summary: `Created user "${name}" (${email}) with role ${role}`,
        details: { userId: user._id.toString(), name, email, role },
    }).catch(() => { });
    res.status(201).json({
        success: true,
        data: userResponse,
    });
});
exports.getUsers = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { search, role, status, page = "1", limit = "10", sort = "createdAt", } = req.query;
    // Build filter object
    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    if (role && role !== "all") {
        // Support both role ID (ObjectId) and role name (e.g. "super-admin")
        const isObjectId = /^[a-fA-F0-9]{24}$/.test(role);
        if (isObjectId) {
            filter.role = role;
        }
        else {
            const roleDoc = await role_model_1.Role.findOne({ name: role });
            if (roleDoc) {
                filter.role = roleDoc._id;
            }
        }
    }
    if (status && status !== "all") {
        filter.status = status;
    }
    // Execute query with pagination
    const users = await user_model_1.User.find(filter)
        .select("-password")
        .populate("role", "name")
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .sort(sort === "newest" ? { createdAt: -1 } : { createdAt: 1 });
    // Get total documents count
    const count = await user_model_1.User.countDocuments(filter);
    res.status(200).json({
        success: true,
        data: users,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        total: count,
    });
});
exports.getUser = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const user = await user_model_1.User.findById(id).select("-password");
    if (!user) {
        throw new error_utils_1.CustomError("User not found", 404);
    }
    res.status(200).json({
        success: true,
        data: user,
    });
});
exports.updateUser = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, email, role, status, editOtp } = req.body;
    // OTP required for all users (including super-admin) - sent to super-admin email
    const otp = editOtp || req.headers["x-edit-otp"];
    if (!otp || typeof otp !== "string") {
        throw new error_utils_1.CustomError("Edit verification OTP is required. Request OTP to be sent to super-admin email.", 403);
    }
    const superAdminRole = await role_model_1.Role.findOne({ name: "super-admin" });
    if (!superAdminRole)
        throw new error_utils_1.CustomError("Super-admin role not found", 500);
    const superAdminUser = await user_model_1.User.findOne({ role: superAdminRole._id });
    if (!superAdminUser)
        throw new error_utils_1.CustomError("No super-admin found", 500);
    const superAdminEmail = superAdminUser.email;
    const otpRecord = await edit_verification_otp_model_1.EditVerificationOtp.findOne({ email: superAdminEmail });
    if (!otpRecord)
        throw new error_utils_1.CustomError("OTP expired or not found. Please request a new code.", 400);
    if (otpRecord.expiresAt < new Date()) {
        await edit_verification_otp_model_1.EditVerificationOtp.deleteMany({ email: superAdminEmail });
        throw new error_utils_1.CustomError("OTP expired. Please request a new code.", 400);
    }
    if (otpRecord.code !== otp.trim()) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new error_utils_1.CustomError("Invalid verification code", 400);
    }
    await edit_verification_otp_model_1.EditVerificationOtp.deleteMany({ email: superAdminEmail });
    // Status rules: super-admin = login-based only; other admins = super-admin can set suspended/inactive only
    const targetUser = await user_model_1.User.findById(id).populate("role");
    if (targetUser && status !== undefined) {
        const targetRole = targetUser.role;
        const isSuperAdmin = targetRole?.name === "super-admin" || targetRole?.isSuperAdmin;
        if (isSuperAdmin) {
            throw new error_utils_1.CustomError("Super-admin status cannot be changed manually. It is determined by login state.", 400);
        }
        // For other admins: only "suspended" or "inactive" allowed. "active" is login-based only.
        if (status === "active") {
            throw new error_utils_1.CustomError("Status 'active' is set automatically when the user logs in. You can set 'inactive' or 'suspended' only.", 400);
        }
        if (status !== "inactive" && status !== "suspended") {
            throw new error_utils_1.CustomError("Only 'inactive' or 'suspended' can be set manually.", 400);
        }
    }
    const updateData = { updatedAt: new Date() };
    if (name !== undefined)
        updateData.name = name;
    if (email !== undefined)
        updateData.email = email;
    if (status !== undefined)
        updateData.status = status;
    // Resolve role: accept role ID (ObjectId) or role name
    if (role !== undefined) {
        const isObjectId = /^[a-fA-F0-9]{24}$/.test(role);
        if (isObjectId) {
            updateData.role = role;
        }
        else {
            const roleDoc = await role_model_1.Role.findOne({ name: role });
            if (roleDoc) {
                updateData.role = roleDoc._id;
            }
        }
    }
    const user = await user_model_1.User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    })
        .select("-password")
        .populate("role", "name");
    if (!user) {
        throw new error_utils_1.CustomError("User not found", 404);
    }
    const updates = {};
    if (name !== undefined)
        updates.name = name;
    if (email !== undefined)
        updates.email = email;
    if (role !== undefined)
        updates.role = role;
    if (status !== undefined)
        updates.status = status;
    (0, activity_log_utils_1.logActivity)(req, {
        action: "user_update",
        entityType: "user",
        entityId: id,
        entityName: user.name,
        summary: `Updated user "${user.name}" (${Object.keys(updates).join(", ")})`,
        details: { userId: id, updates },
    }).catch(() => { });
    res.status(200).json({
        success: true,
        data: user,
    });
});
exports.deleteUser = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { editOtp } = req.body || {};
    // Prevent super-admin from deleting themselves
    if (id === req.user?.id) {
        throw new error_utils_1.CustomError("You cannot delete your own account", 400);
    }
    // OTP required for all users (including super-admin) - sent to super-admin email
    const otp = editOtp || req.headers["x-edit-otp"];
    if (!otp || typeof otp !== "string") {
        throw new error_utils_1.CustomError("Edit verification OTP is required. Request OTP to be sent to super-admin email.", 403);
    }
    const superAdminRole = await role_model_1.Role.findOne({ name: "super-admin" });
    if (!superAdminRole)
        throw new error_utils_1.CustomError("Super-admin role not found", 500);
    const superAdminUser = await user_model_1.User.findOne({ role: superAdminRole._id });
    if (!superAdminUser)
        throw new error_utils_1.CustomError("No super-admin found", 500);
    const superAdminEmail = superAdminUser.email;
    const otpRecord = await edit_verification_otp_model_1.EditVerificationOtp.findOne({ email: superAdminEmail });
    if (!otpRecord)
        throw new error_utils_1.CustomError("OTP expired or not found. Please request a new code.", 400);
    if (otpRecord.expiresAt < new Date()) {
        await edit_verification_otp_model_1.EditVerificationOtp.deleteMany({ email: superAdminEmail });
        throw new error_utils_1.CustomError("OTP expired. Please request a new code.", 400);
    }
    if (otpRecord.code !== otp.trim()) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new error_utils_1.CustomError("Invalid verification code", 400);
    }
    await edit_verification_otp_model_1.EditVerificationOtp.deleteMany({ email: superAdminEmail });
    const user = await user_model_1.User.findById(id).select("name email").lean();
    if (!user) {
        throw new error_utils_1.CustomError("User not found", 404);
    }
    // Await logActivity so delete is reliably recorded before user is removed
    await (0, activity_log_utils_1.logActivity)(req, {
        action: "user_delete",
        entityType: "user",
        entityId: id,
        entityName: user.name,
        summary: `Deleted user "${user.name}" (${user.email})`,
        details: { userId: id, deletedUser: user },
    }).catch((err) => {
        console.warn("Activity log (user_delete) failed:", err);
    });
    await user_model_1.User.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        data: {},
    });
});
