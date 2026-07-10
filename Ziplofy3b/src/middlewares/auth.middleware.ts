import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { SUPER_ADMIN_TOKEN } from "../constants";
import { User } from "../models/user.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { UserJwtDecode } from "./socket-auth.middleware";

export interface SecureUserInfo {
  id: string;
  email: string;
  role: string;
  name: string;
  accessToken: string;
  assignedSupportDeveloperId: string;
  superAdmin?: boolean;
  assignedSupportDeveloperDetails?:{
    name:string
    email:string
    id:string
  }
}

export const protect = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  console.log('🔐 Auth Middleware - Token received:', token ? 'Yes' : 'No');

  if (!token) {
    console.log('❌ No token provided');
    return next(new CustomError("Not authorized to access this route", 401));
  }

  if(token === SUPER_ADMIN_TOKEN) {
    console.log('🔑 Super Admin token detected');
    const secureUser:SecureUserInfo & {superAdmin?:boolean} = {
      id: new mongoose.Types.ObjectId().toString(),
      name: "Super Admin",
      email: "superadmin@gmail.com",
      role: "super-admin",
      accessToken: token,
      assignedSupportDeveloperId: "",
      superAdmin: true
    }
    req.user = secureUser
    console.log('✅ Super Admin authenticated:', secureUser);
    return next();
  }

  try {
    console.log('🔍 Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as UserJwtDecode
    console.log('✅ JWT decoded successfully:', decoded);
    
    // Try to find user in Ziplofy3b database
    const user = await User.findById(decoded.uid).select("-password").populate('role').catch(() => null);

    if (user) {
      // Block suspended/inactive users from accessing the dashboard
      // if (user.status !== "active") {
      //   console.log('❌ User account is not active:', user.status);
      //   const msg = user.status === "suspended"
      //     ? "Your account has been suspended. Please contact the administrator."
      //     : "Your session has expired. Please log in again.";
      //   return next(new CustomError(msg, 403));
      // }
      // Ziplofy3b user found - use database data
      console.log('👤 Ziplofy3b User found:', {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      });
      
      if (user.assignedSupportDeveloperId) {
        const populatedUser = await user.populate({
          path: "assignedSupportDeveloperId",
          select: "username email",
        });
        console.log('👥 Populated User with Support Developer:', populatedUser);
      }

      // Get role information
      const role = user.role as any;
      const roleName = role?.name || 'unknown';
      const isSuperAdmin = role?.isSuperAdmin || roleName === 'super-admin';

      console.log('🎭 Role details:', {
        roleName,
        isSuperAdmin,
        roleId: role?._id?.toString()
      });

      const secureUser:SecureUserInfo & {superAdmin?: boolean} = {
        id: user._id.toString(),
        email: user.email,
        role: roleName,
        name: user.name,
        accessToken: token,
        assignedSupportDeveloperId: user.assignedSupportDeveloperId?.toString() || "",
        superAdmin: isSuperAdmin
      }

      req.user = secureUser
      console.log('✅ Ziplofy3b User authenticated successfully:', secureUser);
      return next();
    } else {
      // Ziplofy user (not in database) - use JWT payload data only
      // This allows Ziplofy frontend users to authenticate without being in Ziplofy3b database
      console.log('👤 Ziplofy User (JWT-only, no database user):', {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role || 'client'
      });

      const secureUser:SecureUserInfo & {superAdmin?: boolean} = {
        id: decoded.uid,
        email: decoded.email || '',
        role: decoded.role || 'client',
        name: decoded.email?.split('@')[0] || 'User',
        accessToken: token,
        assignedSupportDeveloperId: "",
        superAdmin: false
      }

      req.user = secureUser
      console.log('✅ Ziplofy User authenticated successfully (JWT-only):', secureUser);
      return next();
    }
  } catch (error) {
    console.log('❌ JWT verification failed:', error);
    return next(new CustomError("Not authorized to access this route", 401));
  }
});

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔒 Authorization check:');
    console.log('Required roles:', roles);
    console.log('User role:', req.user?.role);
    console.log('User:', req.user?.name, req.user?.email);
    
    if (!req.user) {
      console.log('❌ No user in request');
      return next(new CustomError("Not authorized to access this route", 401));
    }

    // Super admin has access to all routes
    if (req.user.superAdmin) {
      console.log('✅ Super Admin - authorized');
      return next();
    }

    if (!roles.includes(req.user.role)) {
      console.log(`❌ Role ${req.user.role} not in allowed roles: ${roles.join(', ')}`);
      return next(new CustomError(`Role ${req.user.role} is not authorized to access this route`, 403));
    }

    console.log('✅ Authorization successful');
    next();
  };
};

/**
 * Permission-based authorization middleware
 * Checks if user has the required permission in a specific section (and optionally subsection)
 * Super-admin always has access
 * Supports both:
 * - Section-level permissions: "Theme Management" → "upload"
 * - Subsection-level permissions: "Developer" → "Theme Developer" → "upload"
 * 
 * @param section - The permission section (e.g., "Theme Management" or "Developer")
 * @param permission - The required permission (e.g., "upload", "edit", "view")
 * @param subsection - Optional subsection (e.g., "Theme Developer")
 */
export const authorizePermission = (
  section: string, 
  permission: "view" | "edit" | "upload",
  subsection?: string
) => {
  return asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log('🔐 Permission check:');
    console.log('Required section:', section);
    console.log('Required subsection:', subsection || 'none');
    console.log('Required permission:', permission);
    console.log('User:', req.user?.name, req.user?.email);
    
    if (!req.user) {
      console.log('❌ No user in request');
      return next(new CustomError("Not authorized to access this route", 401));
    }

    // Super admin always has access
    if (req.user.superAdmin) {
      console.log('✅ Super Admin - has all permissions');
      return next();
    }

    // For Ziplofy users (not in database), deny access (they don't have role permissions)
    if (!req.user.id) {
      console.log('❌ No user ID found');
      return next(new CustomError("Not authorized to access this route", 401));
    }

    // Fetch user with role and permissions
    const user = await User.findById(req.user.id).select("-password").populate('role');
    if (!user || !user.role) {
      console.log('❌ User or role not found');
      return next(new CustomError("User role not found", 403));
    }

    const role = user.role as any;
    
    // Priority 1: Check subsection permission if subsection is provided
    if (subsection) {
      const hasSubsectionPermission = role.hasSubsectionPermission(section, subsection, permission);
      if (hasSubsectionPermission) {
        console.log(`✅ Subsection permission check passed: ${section} → ${subsection} → ${permission}`);
        return next();
      }
      console.log(`⚠️ Subsection permission not found: ${section} → ${subsection} → ${permission}, checking section-level...`);
    }
    
    // Priority 2: Check section-level permission
    const hasSectionPermission = role.hasPermission(section, permission);
    if (hasSectionPermission) {
      console.log(`✅ Section permission check passed: ${section} → ${permission}`);
      return next();
    }
    
    // Also check alternative sections for theme operations
    // Allow "Theme Management" section OR "Developer" → "Theme Developer" subsection
    if (section === "Theme Management") {
      // Check if user has permission via Developer → Theme Developer subsection
      const hasThemeDeveloperPermission = role.hasSubsectionPermission("Developer", "Theme Developer", permission);
      if (hasThemeDeveloperPermission) {
        console.log(`✅ Alternative permission check passed: Developer → Theme Developer → ${permission}`);
        return next();
      }
    }
    
    // Also check reverse: if checking Developer section, also check Theme Management
    if (section === "Developer" && subsection === "Theme Developer") {
      const hasThemeManagementPermission = role.hasPermission("Theme Management", permission);
      if (hasThemeManagementPermission) {
        console.log(`✅ Alternative permission check passed: Theme Management → ${permission}`);
        return next();
      }
    }
    
    console.log(`❌ User does not have ${permission} permission for ${section}${subsection ? ` → ${subsection}` : ''}`);
    return next(new CustomError(`You do not have ${permission} permission for ${section}${subsection ? ` → ${subsection}` : ''}`, 403));
  });
};

// Optional auth: attach req.user if a valid token is presented; otherwise continue without user
// Supports both Ziplofy3b users (database) and Ziplofy users (JWT-only)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return next();
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as UserJwtDecode;
    
    // Try to find user in database, but don't fail if not found (Ziplofy users)
    const user = await User.findById(decoded.uid).select("-password").populate('role').catch(() => null);
    
    if (user) {
      // Ziplofy3b user - use database data
      const role = user.role as any;
      const roleName = role?.name || 'unknown';
      const isSuperAdmin = role?.isSuperAdmin || roleName === 'super-admin';
      const secureUser: SecureUserInfo & { superAdmin?: boolean } = {
        id: user._id.toString(),
        email: user.email,
        role: roleName,
        name: user.name,
        accessToken: token,
        assignedSupportDeveloperId: user.assignedSupportDeveloperId?.toString() || "",
        superAdmin: isSuperAdmin,
      };
      req.user = secureUser;
    } else {
      // Ziplofy user (JWT-only) - use JWT payload
      const secureUser: SecureUserInfo & { superAdmin?: boolean } = {
        id: decoded.uid,
        email: decoded.email || '',
        role: decoded.role || 'client',
        name: decoded.email?.split('@')[0] || 'User',
        accessToken: token,
        assignedSupportDeveloperId: "",
        superAdmin: false,
      };
      req.user = secureUser;
    }
    return next();
  } catch {
    return next();
  }
};