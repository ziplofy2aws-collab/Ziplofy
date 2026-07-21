import { Request, Response } from "express";
import { IUser, User } from "../models/user.model";
import { Role } from "../models/role.model";
import { EditVerificationOtp } from "../models/edit-verification-otp.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { logActivity } from "../utils/activity-log.utils";

export const createUser = asyncErrorHandler(async (req: Request, res: Response) => {
  // Only super-admin can add users
  if (!(req.user as any)?.superAdmin) {
    throw new CustomError("Only super-admin can add new users", 403);
  }

  const { name, email, password, role } = req.body as Pick<IUser, "name" | "email" | "password" | "role"> & { role?: string };

  // Only allow assigning support-admin, developer-admin, or client-admin
  const allowedRoles = ["support-admin", "developer-admin", "client-admin"];
  if (!role || !allowedRoles.includes(role)) {
    throw new CustomError("Role must be one of: support-admin, developer-admin, client-admin", 400);
  }

  const roleDoc = await Role.findOne({ name: role });
  if (!roleDoc) {
    throw new CustomError(`Role '${role}' not found`, 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new CustomError("A user with this email already exists", 400);
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: roleDoc._id,
    status: "active",
  });

  const userResponse = await User.findById(user._id).select("-password");

  logActivity(req, {
    action: "user_create",
    entityType: "user",
    entityId: user._id.toString(),
    entityName: name,
    summary: `Created user "${name}" (${email}) with role ${role}`,
    details: { userId: user._id.toString(), name, email, role },
  }).catch(() => {});

  res.status(201).json({
    success: true,
    data: userResponse,
  });
});

interface GetUsersQuery {
  search?: string;
  role?: string;
  status?: string;
  page?: string;
  limit?: string;
  sort?: string;
}

export const getUsers = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    search,
    role,
    status,
    page = "1",
    limit = "10",
    sort = "createdAt",
  } = req.query as GetUsersQuery;

  // Build filter object
  const filter: any = {};

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
    } else {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        filter.role = roleDoc._id;
      }
    }
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  // Execute query with pagination
  const users = await User.find(filter)
    .select("-password")
    .populate("role", "name")
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort(sort === "newest" ? { createdAt: -1 } : { createdAt: 1 });

  // Get total documents count
  const count = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: users,
    totalPages: Math.ceil(count / parseInt(limit)),
    currentPage: parseInt(page),
    total: count,
  });
});

interface GetUserParams {
  id: string;
}

export const getUser = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as GetUserParams;

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

interface UpdateUserParams {
  id: string;
}


export const updateUser = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as UpdateUserParams;
  const { name, email, role, status, editOtp } = req.body as {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    editOtp?: string;
  };

  // OTP required for all users (including super-admin) - sent to super-admin email
  const otp = editOtp || req.headers["x-edit-otp"];
  if (!otp || typeof otp !== "string") {
    throw new CustomError("Edit verification OTP is required. Request OTP to be sent to super-admin email.", 403);
  }

  const superAdminRole = await Role.findOne({ name: "super-admin" });
  if (!superAdminRole) throw new CustomError("Super-admin role not found", 500);
  const superAdminUser = await User.findOne({ role: superAdminRole._id });
  if (!superAdminUser) throw new CustomError("No super-admin found", 500);
  const superAdminEmail = superAdminUser.email;

  const otpRecord = await EditVerificationOtp.findOne({ email: superAdminEmail });
  if (!otpRecord) throw new CustomError("OTP expired or not found. Please request a new code.", 400);
  if (otpRecord.expiresAt < new Date()) {
    await EditVerificationOtp.deleteMany({ email: superAdminEmail });
    throw new CustomError("OTP expired. Please request a new code.", 400);
  }
  if (otpRecord.code !== otp.trim()) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new CustomError("Invalid verification code", 400);
  }

  await EditVerificationOtp.deleteMany({ email: superAdminEmail });

  // Status rules: super-admin = login-based only; other admins = super-admin can set suspended/inactive only
  const targetUser = await User.findById(id).populate("role");
  if (targetUser && status !== undefined) {
    const targetRole = targetUser.role as any;
    const isSuperAdmin = targetRole?.name === "super-admin" || targetRole?.isSuperAdmin;
    if (isSuperAdmin) {
      throw new CustomError("Super-admin status cannot be changed manually. It is determined by login state.", 400);
    }
    // For other admins: only "suspended" or "inactive" allowed. "active" is login-based only.
    if (status === "active") {
      throw new CustomError("Status 'active' is set automatically when the user logs in. You can set 'inactive' or 'suspended' only.", 400);
    }
    if (status !== "inactive" && status !== "suspended") {
      throw new CustomError("Only 'inactive' or 'suspended' can be set manually.", 400);
    }
  }

  const updateData: any = { updatedAt: new Date() };
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (status !== undefined) updateData.status = status;

  // Resolve role: accept role ID (ObjectId) or role name
  if (role !== undefined) {
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(role);
    if (isObjectId) {
      updateData.role = role;
    } else {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        updateData.role = roleDoc._id;
      }
    }
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .populate("role", "name");

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (role !== undefined) updates.role = role;
  if (status !== undefined) updates.status = status;

  logActivity(req, {
    action: "user_update",
    entityType: "user",
    entityId: id,
    entityName: user.name,
    summary: `Updated user "${user.name}" (${Object.keys(updates).join(", ")})`,
    details: { userId: id, updates },
  }).catch(() => {});

  res.status(200).json({
    success: true,
    data: user,
  });
});

interface DeleteUserParams {
  id: string;
}

export const deleteUser = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as DeleteUserParams;
  const { editOtp } = req.body as { editOtp?: string } || {};

  // Prevent super-admin from deleting themselves
  if (id === req.user?.id) {
    throw new CustomError("You cannot delete your own account", 400);
  }

  // OTP required for all users (including super-admin) - sent to super-admin email
  const otp = editOtp || req.headers["x-edit-otp"];
  if (!otp || typeof otp !== "string") {
    throw new CustomError("Edit verification OTP is required. Request OTP to be sent to super-admin email.", 403);
  }

  const superAdminRole = await Role.findOne({ name: "super-admin" });
  if (!superAdminRole) throw new CustomError("Super-admin role not found", 500);
  const superAdminUser = await User.findOne({ role: superAdminRole._id });
  if (!superAdminUser) throw new CustomError("No super-admin found", 500);
  const superAdminEmail = superAdminUser.email;

  const otpRecord = await EditVerificationOtp.findOne({ email: superAdminEmail });
  if (!otpRecord) throw new CustomError("OTP expired or not found. Please request a new code.", 400);
  if (otpRecord.expiresAt < new Date()) {
    await EditVerificationOtp.deleteMany({ email: superAdminEmail });
    throw new CustomError("OTP expired. Please request a new code.", 400);
  }
  if (otpRecord.code !== otp.trim()) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new CustomError("Invalid verification code", 400);
  }

  await EditVerificationOtp.deleteMany({ email: superAdminEmail });

  const user = await User.findById(id).select("name email").lean();
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  // Await logActivity so delete is reliably recorded before user is removed
  await logActivity(req, {
    action: "user_delete",
    entityType: "user",
    entityId: id,
    entityName: (user as { name?: string }).name,
    summary: `Deleted user "${(user as { name?: string }).name}" (${(user as { email?: string }).email})`,
    details: { userId: id, deletedUser: user },
  }).catch((err) => {
    console.warn("Activity log (user_delete) failed:", err);
  });

  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

