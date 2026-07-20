import mongoose, { Document, Model, Schema } from "mongoose";

// Sub-section permission interface
export interface ISubsectionPermission {
  subsection: string;
  permissions: Array<"view" | "edit" | "upload">;
}

// Permission interface and schema
export interface IRolePermission {
  section: "Client List" | "Payment" | "Invoice" | "User Management" | "Membership" | "Developer" | "Support" | "Theme Management";
  permissions: Array<"view" | "edit" | "upload">;
  subsections?: ISubsectionPermission[];
}

const subsectionPermissionSchema = new Schema<ISubsectionPermission>({
  subsection: {
    type: String,
    required: true,
  },
  permissions: [
    {
      type: String,
      enum: ["view", "edit", "upload"],
    },
  ],
}, { _id: false, versionKey: false });

const permissionSchema = new Schema<IRolePermission>({
  section: {
    type: String,
    required: true,
    enum: [
      "Client List",
      "Payment", 
      "Invoice",
      "User Management",
      "Membership",
      "Developer",
      "Support",
      "Theme Management"
    ],
  },
  permissions: [
    {
      type: String,
      enum: ["view", "edit", "upload"],
    },
  ],
  subsections: [subsectionPermissionSchema],
}, { _id: false, versionKey: false, timestamps: true });

// Role interface and schema
export interface IRole extends Document {
  name: "super-admin" | "support-admin" | "developer-admin" | "client-admin";
  description: string;
  permissions: IRolePermission[];
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  hasPermission(section: IRolePermission["section"], permission: IRolePermission["permissions"][number]): boolean;
  hasSubsectionPermission(section: IRolePermission["section"], subsection: string, permission: IRolePermission["permissions"][number]): boolean;
  addPermission(section: IRolePermission["section"], permissions: IRolePermission["permissions"]): Promise<IRole>;
  addSubsectionPermission(section: IRolePermission["section"], subsection: string, permissions: IRolePermission["permissions"]): Promise<IRole>;
  removePermission(section: IRolePermission["section"], permission?: IRolePermission["permissions"][number] | null): Promise<IRole>;
  removeSubsectionPermission(section: IRolePermission["section"], subsection: string, permission?: IRolePermission["permissions"][number] | null): Promise<IRole>;
}

interface IRoleModel extends Model<IRole> {
  findByName(name: string): Promise<IRole | null>;
}

const roleSchema = new Schema<IRole, IRoleModel>({
  name: {
    type: String,
    required: [true, "Role name is required"],
    unique: true,
    enum: ["super-admin", "support-admin", "developer-admin", "client-admin"],
  },
  description: {
    type: String,
    required: [true, "Role description is required"],
    maxLength: [200, "Description cannot exceed 200 characters"],
  },
  permissions: [permissionSchema],
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

// Update timestamp before saving
roleSchema.pre<IRole>("save", function (next: (err?: any) => void) {
  this.updatedAt = new Date();
  next();
});

// Static method to get role by name
roleSchema.statics.findByName = function (name: string) {
  return this.findOne({ name: name.toLowerCase() });
};

// Method to check if role has permission
roleSchema.methods.hasPermission = function (
  this: IRole,
  section: IRolePermission["section"],
  permission: IRolePermission["permissions"][number]
): boolean {
  // Super admin has all permissions
  if (this.isSuperAdmin) {
    return true;
  }
  
  const sectionPermission = this.permissions.find(
    (perm) => perm.section === section
  );
  return !!(sectionPermission && sectionPermission.permissions.includes(permission));
};

// Method to check if role has sub-section permission
roleSchema.methods.hasSubsectionPermission = function (
  this: IRole,
  section: IRolePermission["section"],
  subsection: string,
  permission: IRolePermission["permissions"][number]
): boolean {
  // Super admin has all permissions
  if (this.isSuperAdmin) {
    return true;
  }
  
  const sectionPermission = this.permissions.find(
    (perm) => perm.section === section
  );
  
  if (!sectionPermission) {
    return false;
  }
  
  // Check if subsection exists and has the permission
  const subsectionPermission = sectionPermission.subsections?.find(
    (sub) => sub.subsection === subsection
  );
  
  return !!(subsectionPermission && subsectionPermission.permissions.includes(permission));
};

// Method to add permission
roleSchema.methods.addPermission = function (
  this: IRole,
  section: IRolePermission["section"],
  permissions: IRolePermission["permissions"]
): Promise<IRole> {
  const existingPermission = this.permissions.find(
    (perm) => perm.section === section
  );

  // Auto-include "view" permission if "edit" or "upload" is being granted
  const enhancedPermissions = [...permissions];
  if (permissions.includes('edit') || permissions.includes('upload')) {
    if (!enhancedPermissions.includes('view')) {
      enhancedPermissions.push('view');
    }
  }

  if (existingPermission) {
    enhancedPermissions.forEach((permission) => {
      if (!existingPermission.permissions.includes(permission)) {
        existingPermission.permissions.push(permission);
      }
    });
  } else {
    this.permissions.push({
      section: section,
      permissions: enhancedPermissions,
    });
  }

  return this.save();
};

// Method to add sub-section permission
roleSchema.methods.addSubsectionPermission = function (
  this: IRole,
  section: IRolePermission["section"],
  subsection: string,
  permissions: IRolePermission["permissions"]
): Promise<IRole> {
  let sectionPermission = this.permissions.find(
    (perm) => perm.section === section
  );

  if (!sectionPermission) {
    // Create section permission if it doesn't exist
    sectionPermission = {
      section: section,
      permissions: [],
      subsections: []
    };
    this.permissions.push(sectionPermission);
  }

  // Initialize subsections array if it doesn't exist
  if (!sectionPermission.subsections) {
    sectionPermission.subsections = [];
  }

  // Auto-include "view" permission if "edit" or "upload" is being granted
  const enhancedPermissions = [...permissions];
  if (permissions.includes('edit') || permissions.includes('upload')) {
    if (!enhancedPermissions.includes('view')) {
      enhancedPermissions.push('view');
    }
  }

  const existingSubsection = sectionPermission.subsections.find(
    (sub) => sub.subsection === subsection
  );

  if (existingSubsection) {
    enhancedPermissions.forEach((permission) => {
      if (!existingSubsection.permissions.includes(permission)) {
        existingSubsection.permissions.push(permission);
      }
    });
  } else {
    sectionPermission.subsections.push({
      subsection: subsection,
      permissions: enhancedPermissions,
    });
  }

  return this.save();
};

// Method to remove permission
roleSchema.methods.removePermission = function (
  this: IRole,
  section: IRolePermission["section"],
  permission: IRolePermission["permissions"][number] | null = null
): Promise<IRole> {
  if (permission) {
    const sectionPermission = this.permissions.find(
      (perm) => perm.section === section
    );
    if (sectionPermission) {
      sectionPermission.permissions = sectionPermission.permissions.filter((p) => p !== permission);
      if (sectionPermission.permissions.length === 0) {
        this.permissions = this.permissions.filter(
          (perm) => perm.section !== section
        );
      }
    }
  } else {
    this.permissions = this.permissions.filter(
      (perm) => perm.section !== section
    );
  }

  return this.save();
};

// Method to remove sub-section permission
roleSchema.methods.removeSubsectionPermission = function (
  this: IRole,
  section: IRolePermission["section"],
  subsection: string,
  permission: IRolePermission["permissions"][number] | null = null
): Promise<IRole> {
  const sectionPermission = this.permissions.find(
    (perm) => perm.section === section
  );

  if (!sectionPermission || !sectionPermission.subsections) {
    return Promise.resolve(this);
  }

  if (permission) {
    const subsectionPermission = sectionPermission.subsections.find(
      (sub) => sub.subsection === subsection
    );
    if (subsectionPermission) {
      subsectionPermission.permissions = subsectionPermission.permissions.filter((p) => p !== permission);
      if (subsectionPermission.permissions.length === 0) {
        sectionPermission.subsections = sectionPermission.subsections.filter(
          (sub) => sub.subsection !== subsection
        );
      }
    }
  } else {
    sectionPermission.subsections = sectionPermission.subsections.filter(
      (sub) => sub.subsection !== subsection
    );
  }

  return this.save();
};

export const Role: IRoleModel = mongoose.model<IRole, IRoleModel>("Role", roleSchema);
