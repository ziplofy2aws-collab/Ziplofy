import { Request, Response } from "express";
import { Role } from "../models/role.model";
import { User } from "../models/user.model";

/**
 * @desc    Get all roles
 * @route   GET /api/roles
 * @access  Private/super-admin
 */
export const getRoles = async (req: Request, res: Response) => {
  try {
    console.log("🔍 /roles - User accessing roles list:");
    console.log("Requesting User ID:", req.user?.id);
    console.log("Requesting User Email:", req.user?.email);
    console.log("Requesting User Role:", req.user?.role);
    console.log("Requesting User Name:", req.user?.name);
    console.log("Is Super Admin:", (req.user as any)?.superAdmin);
    
    const { search, page = 1, limit = 10 } = req.query as {
      search?: string;
      page?: string | number;
      limit?: string | number;
    };

    // Build filter object
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;

    // Execute query with pagination
    const roles = await Role.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    // Get total documents count
    const count = await Role.countDocuments(filter);

    console.log(`Found ${roles.length} roles for user ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: roles,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count,
    });
  } catch (error: any) {
    console.error("Error in getRoles:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single role
 * @route   GET /api/roles/:id
 * @access  Private/super-admin
 */
export const getRole = async (req: Request, res: Response) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Create role
 * @route   POST /api/roles
 * @access  Private/super-admin
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;

    // Check if trying to create super-admin (not allowed)
    if (name === "super-admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot create super-admin role",
      });
    }

    const role = await Role.create({
      name: name.toLowerCase(),
      description,
      permissions,
      isSuperAdmin: false,
    });

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Role with this name already exists",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Update role
 * @route   PUT /api/roles/:id
 * @access  Private/super-admin
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;

    // Check if role exists
    const existingRole = await Role.findById(req.params.id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if trying to modify super-admin
    if (existingRole.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify super-admin role",
      });
    }

    // Check if trying to change name to super-admin
    if (name === "super-admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot change role name to super-admin",
      });
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name: name ? name.toLowerCase() : existingRole.name,
        description,
        permissions,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Role with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete role
 * @route   DELETE /api/roles/:id
 * @access  Private/super-admin
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    // Check if role exists
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if trying to delete super-admin
    if (role.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete super-admin role",
      });
    }

    // Check if any users are using this role
    const usersWithRole = await User.countDocuments({ role: req.params.id });
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${usersWithRole} user(s) are assigned this role.`,
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Update role permissions
 * @route   PUT /api/roles/:id/permissions
 * @access  Private/super-admin
 */
export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const { permissions } = req.body;
    const roleId = req.params.id;

    console.log("🔍 Super-admin updating permissions for role:", roleId);
    console.log("Requesting user:", req.user?.email);
    console.log("New permissions:", permissions);

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if trying to modify super-admin
    if (role.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify super-admin permissions",
      });
    }

    // Validate permissions structure
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Permissions must be an array",
      });
    }

    // Validate each permission object
    for (const perm of permissions) {
      if (!perm.section || !Array.isArray(perm.permissions)) {
        return res.status(400).json({
          success: false,
          message: "Each permission must have 'section' and 'permissions' array",
        });
      }
    }

    // Update permissions
    role.permissions = permissions;
    role.updatedAt = new Date();

    await role.save();

    console.log("✅ Role permissions updated successfully by super-admin");

    res.status(200).json({
      success: true,
      message: "Role permissions updated successfully",
      data: role,
    });
  } catch (error: any) {
    console.error("Error updating role permissions:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Bulk update role permissions
 * @route   PUT /api/roles/permissions/bulk
 * @access  Private/super-admin
 */
export const bulkUpdateRolePermissions = async (req: Request, res: Response) => {
  try {
    const { roleUpdates } = req.body;

    console.log("🔍 Super-admin bulk updating permissions");
    console.log("Requesting user:", req.user?.email);
    console.log("Bulk updates:", roleUpdates);

    // Validate input
    if (!Array.isArray(roleUpdates)) {
      return res.status(400).json({
        success: false,
        message: "roleUpdates must be an array",
      });
    }

    const results = [];
    const errors = [];

    for (const update of roleUpdates) {
      try {
        const { roleId, permissions } = update;

        // Check if role exists
        const role = await Role.findById(roleId);
        if (!role) {
          errors.push({ roleId, error: "Role not found" });
          continue;
        }

        // Check if trying to modify super-admin
        if (role.isSuperAdmin) {
          errors.push({ roleId, error: "Cannot modify super-admin permissions" });
          continue;
        }

        // Validate permissions structure
        if (!Array.isArray(permissions)) {
          errors.push({ roleId, error: "Permissions must be an array" });
          continue;
        }

        // Update permissions
        role.permissions = permissions;
        role.updatedAt = new Date();
        await role.save();

        results.push({
          roleId,
          roleName: role.name,
          success: true,
          message: "Permissions updated successfully"
        });

      } catch (error: any) {
        errors.push({
          roleId: update.roleId,
          error: error.message
        });
      }
    }

    console.log(`✅ Bulk update completed: ${results.length} successful, ${errors.length} errors`);

    res.status(200).json({
      success: true,
      message: "Bulk permissions update completed",
      data: {
        successful: results,
        errors: errors,
        summary: {
          total: roleUpdates.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  } catch (error: any) {
    console.error("Error in bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get default roles
 * @route   GET /api/roles/default
 * @access  Private/super-admin
 */
export const getDefaultRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({ isDefault: true });

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
