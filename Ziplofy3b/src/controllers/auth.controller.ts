import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { User } from "../models/user.model";
import { Role } from "../models/role.model";
import { LoginOtp } from "../models/login-otp.model";
import { EditVerificationOtp } from "../models/edit-verification-otp.model";
import { PendingAdminUser } from "../models/pending-admin-user.model";
import { sendEmail } from "../utils/email.utils";


export const getMe = asyncErrorHandler(async (req: Request, res: Response) => {
  console.log("🔍 /auth/me - User accessing roles and permission section:");
  console.log("User ID:", req.user?.id);
  console.log("User Email:", req.user?.email);
  console.log("User Role:", req.user?.role);
  console.log("User Name:", req.user?.name);
  console.log("Is Super Admin:", (req.user as any)?.superAdmin);
  console.log("Assigned Support Developer ID:", req.user?.assignedSupportDeveloperId);
  console.log("Full User Object:", JSON.stringify(req.user, null, 2));
  
  // Always fetch user with role populated (including permissions) for consistent permission resolution
  const user = await User.findById(req.user?.id).select("-password").populate("role");
  if (user && user.role) {
    const role = user.role as any;
    const roleName = role.name || req.user?.role;
    const isSuperAdmin = role.isSuperAdmin || roleName === "super-admin";
    (req.user as any).role = roleName;
    (req.user as any).superAdmin = isSuperAdmin;
    // Include full role with permissions so frontend can render sidebar without extra /roles call
    (req.user as any).roleWithPermissions = {
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

export const adminLogin = asyncErrorHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) throw new CustomError("Please provide email and password", 400);

  const user = await User.findOne({ email }).select("+password role status name email lastLogin");
  if (!user) throw new CustomError("Invalid credentials", 401);
  if (user.status === "suspended") throw new CustomError("Your account has been suspended. Please contact the administrator.", 403);

  const role = await Role.findById(user.role);
  if (!role) throw new CustomError("Role not found", 401);

  const adminRoleNames = ["super-admin","support-admin","developer-admin","client-admin","admin"];
  if (!adminRoleNames.includes(role.name)) throw new CustomError("Not authorized as admin", 403);

  const isMatch = await bcrypt.compare(password, (user as any).password);
  if (!isMatch) throw new CustomError("Invalid credentials", 401);

  const token = jwt.sign(
    { uid: user._id.toString(), email: user.email }, 
    process.env.ACCESS_TOKEN_SECRET as string, 
    { expiresIn: "30d" }
  );

  user.lastLogin = new Date();
  (user as any).status = "active"; // All admins: active when logged in
  await user.save();

  res.status(200).json({
    accessToken: token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roleId: (role._id as any).toString(),
      roleName: role.name,
      roleLevel: 1, // Default level since we removed level from role model
      status: user.status,
      lastLogin: user.lastLogin,
      isSuperAdmin: role.isSuperAdmin || role.name === 'super-admin',
    }
  });
});

// Step 1: verify password and send OTP
export const adminLoginStep1 = asyncErrorHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) throw new CustomError("Please provide email and password", 400);

  const user = await User.findOne({ email }).select("+password role status name email lastLogin");
  if (!user) throw new CustomError("Invalid credentials", 401);
  if (user.status === "suspended") throw new CustomError("Your account has been suspended. Please contact the administrator.", 403);

  const role = await Role.findById(user.role);
  if (!role) throw new CustomError("Role not found", 401);
  const adminRoleNames = ["super-admin","support-admin","developer-admin","client-admin","admin"];
  if (!adminRoleNames.includes(role.name)) throw new CustomError("Not authorized as admin", 403);

  const isMatch = await bcrypt.compare(password, (user as any).password);
  if (!isMatch) throw new CustomError("Invalid credentials", 401);

  // generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // upsert OTP for this email
  await LoginOtp.deleteMany({ email });
  await LoginOtp.create({ userId: user._id, email, code, expiresAt, attempts: 0 });

  // send email
  await sendEmail({
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
export const verifyAdminLoginOtp = asyncErrorHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body as { email: string; code: string };
  if (!email || !code) throw new CustomError("Missing fields", 400);

  const otp = await LoginOtp.findOne({ email });
  if (!otp) throw new CustomError("Code expired or not found", 400);
  if (otp.expiresAt < new Date()) {
    await LoginOtp.deleteMany({ email });
    throw new CustomError("Code expired", 400);
  }
  if (otp.code !== code) {
    otp.attempts += 1;
    await otp.save();
    throw new CustomError("Invalid code", 401);
  }

  const user = await User.findOne({ email }).select("role status name email lastLogin");
  if (!user) throw new CustomError("User not found", 404);
  if (user.status === "suspended") throw new CustomError("Your account has been suspended. Please contact the administrator.", 403);
  const role = await Role.findById(user.role);
  if (!role) throw new CustomError("Role not found", 404);

  const token = jwt.sign(
    { uid: user._id.toString(), email: user.email },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "30d" }
  );

  user.lastLogin = new Date();
  (user as any).status = "active"; // All admins: active when logged in
  await user.save();
  await LoginOtp.deleteMany({ email });

  res.status(200).json({
    accessToken: token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roleId: (role._id as any).toString(),
      roleName: role.name,
      roleLevel: 1,
      status: user.status,
      lastLogin: user.lastLogin,
      isSuperAdmin: role.isSuperAdmin || role.name === 'super-admin',
    }
  });
});

// Resend OTP with 60s cooldown
export const resendAdminLoginOtp = asyncErrorHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  if (!email) throw new CustomError("Email is required", 400);

  const existing = await LoginOtp.findOne({ email }).sort({ createdAt: -1 });
  const now = new Date();
  if (existing && existing.createdAt && now.getTime() - existing.createdAt.getTime() < 60 * 1000) {
    const remaining = 60 - Math.floor((now.getTime() - existing.createdAt.getTime()) / 1000);
    throw new CustomError(`Please wait ${remaining}s before resending code`, 429);
  }

  // Ensure user exists and not suspended
  const user = await User.findOne({ email }).select("role status name email");
  if (!user) throw new CustomError("User not found", 404);
  if (user.status === "suspended") throw new CustomError("Your account has been suspended. Please contact the administrator.", 403);

  // generate new code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await LoginOtp.deleteMany({ email });
  await LoginOtp.create({ userId: user._id, email, code, expiresAt, attempts: 0 });

  await sendEmail({
    to: email,
    subject: "Your Ziplofy Admin Login Code",
    body: `<p>Your verification code is:</p><h2 style=\"letter-spacing:4px\">${code}</h2><p>This code expires in 5 minutes.</p>`
  });

  res.status(200).json({ success: true, message: "Code resent" });
});

// Request OTP for edit verification - sends to super-admin email (required for all users including super-admin)
export const requestEditVerificationOtp = asyncErrorHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new CustomError("Unauthorized", 401);

  // Find super-admin user - OTP always sent to super-admin email
  const superAdminRole = await Role.findOne({ name: "super-admin" });
  if (!superAdminRole) throw new CustomError("Super-admin role not found", 500);

  const superAdminUser = await User.findOne({ role: superAdminRole._id, status: "active" });
  if (!superAdminUser) throw new CustomError("No active super-admin found", 500);

  const superAdminEmail = superAdminUser.email;

  // 60s cooldown
  const existing = await EditVerificationOtp.findOne({ email: superAdminEmail }).sort({ createdAt: -1 });
  const now = new Date();
  if (existing && existing.createdAt && now.getTime() - existing.createdAt.getTime() < 60 * 1000) {
    const remaining = 60 - Math.floor((now.getTime() - existing.createdAt.getTime()) / 1000);
    throw new CustomError(`Please wait ${remaining}s before requesting a new code`, 429);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await EditVerificationOtp.deleteMany({ email: superAdminEmail });
  await EditVerificationOtp.create({ email: superAdminEmail, code, expiresAt, attempts: 0 });

  await sendEmail({
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
export const verifyAdminInvite = asyncErrorHandler(async (req: Request, res: Response) => {
  const { token } = req.query as { token?: string };
  if (!token) {
    throw new CustomError("Verification token is required", 400);
  }

  const pending = await PendingAdminUser.findOne({ verificationToken: token });
  if (!pending) {
    throw new CustomError("Invalid or expired verification link", 400);
  }
  if (pending.expiresAt < new Date()) {
    await PendingAdminUser.deleteOne({ _id: pending._id });
    throw new CustomError("Verification link has expired", 400);
  }

  // Check if user already exists (e.g. already verified)
  const existingUser = await User.findOne({ email: pending.email });
  if (existingUser) {
    await PendingAdminUser.deleteOne({ _id: pending._id });
    return res.status(200).json({
      success: true,
      message: "Account already verified. You can log in.",
    });
  }

  await User.create({
    email: pending.email,
    name: pending.name,
    password: pending.password,
    role: pending.role,
    status: "active",
  });

  await PendingAdminUser.deleteOne({ _id: pending._id });

  res.status(200).json({
    success: true,
    message: "Verification successful. Your account has been activated. You can now log in.",
  });
});

export const changePassword = asyncErrorHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!req.user) throw new CustomError("Unauthorized", 401);
  if (!currentPassword || !newPassword) throw new CustomError("Missing fields", 400);

  const user = await User.findById(new mongoose.Types.ObjectId(req.user.id)).select("+password");
  if (!user) throw new CustomError("User not found", 404);

  const isMatch = await bcrypt.compare(currentPassword, (user as any).password);
  if (!isMatch) throw new CustomError("Current password is incorrect", 400);

  if (newPassword.length < 8) throw new CustomError("Password must be at least 8 characters", 400);

  (user as any).password = newPassword;
  await user.save();
  res.status(200).json({ message: "Password changed successfully" });
});

// Logout: set admin status to inactive (status is login-based for all admins)
export const adminLogout = asyncErrorHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(200).json({ success: true });
  await User.findByIdAndUpdate(req.user.id, { status: "inactive" });
  res.status(200).json({ success: true });
});
