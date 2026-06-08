"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const subsectionPermissionSchema = new mongoose_1.Schema({
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
const permissionSchema = new mongoose_1.Schema({
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
const roleSchema = new mongoose_1.Schema({
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
roleSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
// Static method to get role by name
roleSchema.statics.findByName = function (name) {
    return this.findOne({ name: name.toLowerCase() });
};
// Method to check if role has permission
roleSchema.methods.hasPermission = function (section, permission) {
    // Super admin has all permissions
    if (this.isSuperAdmin) {
        return true;
    }
    const sectionPermission = this.permissions.find((perm) => perm.section === section);
    return !!(sectionPermission && sectionPermission.permissions.includes(permission));
};
// Method to check if role has sub-section permission
roleSchema.methods.hasSubsectionPermission = function (section, subsection, permission) {
    // Super admin has all permissions
    if (this.isSuperAdmin) {
        return true;
    }
    const sectionPermission = this.permissions.find((perm) => perm.section === section);
    if (!sectionPermission) {
        return false;
    }
    // Check if subsection exists and has the permission
    const subsectionPermission = sectionPermission.subsections?.find((sub) => sub.subsection === subsection);
    return !!(subsectionPermission && subsectionPermission.permissions.includes(permission));
};
// Method to add permission
roleSchema.methods.addPermission = function (section, permissions) {
    const existingPermission = this.permissions.find((perm) => perm.section === section);
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
    }
    else {
        this.permissions.push({
            section: section,
            permissions: enhancedPermissions,
        });
    }
    return this.save();
};
// Method to add sub-section permission
roleSchema.methods.addSubsectionPermission = function (section, subsection, permissions) {
    let sectionPermission = this.permissions.find((perm) => perm.section === section);
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
    const existingSubsection = sectionPermission.subsections.find((sub) => sub.subsection === subsection);
    if (existingSubsection) {
        enhancedPermissions.forEach((permission) => {
            if (!existingSubsection.permissions.includes(permission)) {
                existingSubsection.permissions.push(permission);
            }
        });
    }
    else {
        sectionPermission.subsections.push({
            subsection: subsection,
            permissions: enhancedPermissions,
        });
    }
    return this.save();
};
// Method to remove permission
roleSchema.methods.removePermission = function (section, permission = null) {
    if (permission) {
        const sectionPermission = this.permissions.find((perm) => perm.section === section);
        if (sectionPermission) {
            sectionPermission.permissions = sectionPermission.permissions.filter((p) => p !== permission);
            if (sectionPermission.permissions.length === 0) {
                this.permissions = this.permissions.filter((perm) => perm.section !== section);
            }
        }
    }
    else {
        this.permissions = this.permissions.filter((perm) => perm.section !== section);
    }
    return this.save();
};
// Method to remove sub-section permission
roleSchema.methods.removeSubsectionPermission = function (section, subsection, permission = null) {
    const sectionPermission = this.permissions.find((perm) => perm.section === section);
    if (!sectionPermission || !sectionPermission.subsections) {
        return Promise.resolve(this);
    }
    if (permission) {
        const subsectionPermission = sectionPermission.subsections.find((sub) => sub.subsection === subsection);
        if (subsectionPermission) {
            subsectionPermission.permissions = subsectionPermission.permissions.filter((p) => p !== permission);
            if (subsectionPermission.permissions.length === 0) {
                sectionPermission.subsections = sectionPermission.subsections.filter((sub) => sub.subsection !== subsection);
            }
        }
    }
    else {
        sectionPermission.subsections = sectionPermission.subsections.filter((sub) => sub.subsection !== subsection);
    }
    return this.save();
};
exports.Role = mongoose_1.default.model("Role", roleSchema);
