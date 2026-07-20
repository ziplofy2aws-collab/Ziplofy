import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "../../config/axios";
import { Search, Plus, X, Shield } from "lucide-react";
import "./RolesPermission.css";
import { useAdminAuth } from "../../contexts/admin-auth.context";

// Define a Role type matching backend
interface SubsectionPermission {
  subsection: string;
  permissions: string[];
}

interface Role {
  _id: string;
  name: string;
  description: string;
  isSuperAdmin: boolean;
  canEditPermissions: boolean;
  permissions: Array<{
    section: string;
    permissions: string[];
    subsections?: SubsectionPermission[];
  }>;
}

const RolesPermission: React.FC = () => {
  const { user } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showEntries, setShowEntries] = useState<number>(10);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<{roleId: string, section: string} | null>(null);
  const [permissionChanges, setPermissionChanges] = useState<Record<string, string[]>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Sidebar sections with their actual sub-sections (matching your sidebar structure)
  const sidebarSectionsWithSubsections = {
    "Client List": [], // No subsections - will show view/edit/upload buttons
    "Payment": [], // No subsections - will show view/edit/upload buttons
    "Invoice": [], // No subsections - will show view/edit/upload buttons
    "User Management": [
      "Manage User",
      "Roles and Permission"
    ],
    "Membership": [
      "Membership Plan"
    ],
    "Developer": [
      "Dev Admin",
      "Theme Developer", 
      "Support Developer",
      "Hire Developer Requests"
    ],
    "Support": [
      "Domain",
      "Ticket",
      "Raise Task",
      "Live Support"
    ]
  };

  // Get sidebar sections array
  const sidebarSections = Object.keys(sidebarSectionsWithSubsections);

  const permissionTypes = ["view", "edit", "upload"];

  // Fetch roles from backend
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/roles");
      setRoles(response.data?.data || response.data || []);
    } catch (err: any) {
      console.error("Error fetching roles:", err);
      setError(err.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);


  // Filter roles based on search term
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get permissions for a specific section
  const getSectionPermissions = (role: Role, section: string) => {
    // Super admin has all permissions for all sections
    if (role.isSuperAdmin || role.name === 'super-admin' || role.name.toLowerCase().includes('super')) {
      return permissionTypes;
    }
    const sectionPermission = role.permissions.find(p => p.section === section);
    return sectionPermission ? sectionPermission.permissions : [];
  };

  // Check if current user is super admin
  const isCurrentUserSuperAdmin = () => {
    if (user?.roleName === 'super-admin') return true;

    const userRole = localStorage.getItem('userRole');
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (userRole === 'super-admin' || isSuperAdmin === 'true') return true;

    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.role === 'super-admin' || parsed.superAdmin === true) return true;
      } catch {
        // ignore parse errors
      }
    }
    return false;
  };


  // Check if there are any changes for a specific role
  const hasChangesForRole = (roleId: string) => {
    // Check if there are any permission changes that start with this roleId
    return Object.keys(permissionChanges).some(key => key.startsWith(roleId));
  };

  // Handle dialog open/close
  const openPermissionDialog = (roleId: string, section: string) => {
    setOpenDialog({ roleId, section });
  };

  const closePermissionDialog = () => {
    setOpenDialog(null);
  };

  // Save permission changes
  const savePermissionChanges = async (roleId: string) => {
    try {
      // Get all changes for this role
      const roleChanges = Object.keys(permissionChanges)
        .filter(key => key.startsWith(roleId))
        .reduce((acc, key) => {
          const parts = key.split('-');
          const section = parts[1];
          acc[section] = permissionChanges[key];
          return acc;
        }, {} as Record<string, string[]>);
      
      if (Object.keys(roleChanges).length === 0) return;

      console.log("Saving changes for role:", roleId, roleChanges);
      
      // Get the current role to preserve unmodified permissions
      const currentRole = roles.find(r => r._id === roleId);
      if (!currentRole) {
        console.error("Role not found:", roleId);
        return;
      }
      
      console.log("Current role permissions:", currentRole.permissions);
      
      // Create complete permissions array by merging changes with existing permissions
      const permissionsArray = sidebarSections.map(section => {
        // Get existing permission for this section
        const existingPermission = currentRole.permissions.find(p => p.section === section);
        
        // Check if there are subsection changes for this section
        const subsectionChanges = Object.keys(permissionChanges)
          .filter(key => key.startsWith(`${roleId}-${section}-`))
          .reduce((acc, key) => {
            const subsection = key.split('-').slice(2).join('-');
            acc[subsection] = permissionChanges[key];
            return acc;
          }, {} as Record<string, string[]>);

        // If there are subsection changes, merge them with existing subsections
        let subsections: SubsectionPermission[] = existingPermission?.subsections || [];
        if (Object.keys(subsectionChanges).length > 0) {
          // Update or add subsection permissions
          Object.keys(subsectionChanges).forEach(subsection => {
            const existingSubsectionIndex = subsections.findIndex((sub: SubsectionPermission) => sub.subsection === subsection);
            if (existingSubsectionIndex >= 0) {
              subsections[existingSubsectionIndex] = {
                subsection,
                permissions: subsectionChanges[subsection]
              };
            } else {
              subsections.push({
                subsection,
                permissions: subsectionChanges[subsection]
              });
            }
          });
        }

        // If this section has direct changes (not subsection), use the changes
        if (roleChanges[section]) {
          console.log(`📝 Using changes for ${section}:`, roleChanges[section]);
          return {
            section: section,
            permissions: roleChanges[section],
            subsections: subsections
          };
        }
        
        // Otherwise, use the existing permissions from the role
        const permissions = existingPermission ? existingPermission.permissions : [];
        console.log(`💾 Preserving existing permissions for ${section}:`, permissions);
        return {
          section: section,
          permissions: permissions,
          subsections: subsections
        };
      });
      
      console.log("Sending complete permissions to backend:", permissionsArray);
      
      // Call the API to update role permissions
      const response = await axios.put(`/roles/${roleId}/permissions`, {
        permissions: permissionsArray
      });
      
      if (response.data.success) {
        console.log("✅ Permissions saved successfully");
        
        // Clear changes after successful save
        setPermissionChanges(prev => {
          const newChanges = { ...prev };
          delete newChanges[roleId];
          return newChanges;
        });
        
        setIsEditing(false);
        
        // Refresh roles data to get updated permissions
        await fetchRoles();
      } else {
        console.error("❌ Failed to save permissions:", response.data.message);
        alert("Failed to save permissions: " + response.data.message);
      }
      
    } catch (error: any) {
      console.error("Error saving permission changes:", error);
      const errorMessage = error.response?.data?.message || "Failed to save permissions";
      alert("Error: " + errorMessage);
    }
  };

  // Clear changes for a specific role
  const clearChangesForRole = (roleId: string) => {
    setPermissionChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[roleId];
      return newChanges;
    });
    
    // Check if there are any other changes
    const hasOtherChanges = Object.keys(permissionChanges).some(id => id !== roleId);
    setIsEditing(hasOtherChanges);
  };

  // Cancel changes for a specific role (deselect all options)
  const cancelChangesForRole = (roleId: string) => {
    console.log("🔍 Cancelling changes for role:", roleId);
    
    // Clear all changes for this role
    setPermissionChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[roleId];
      return newChanges;
    });
    
    // Check if there are any other changes
    const hasOtherChanges = Object.keys(permissionChanges).some(id => id !== roleId);
    setIsEditing(hasOtherChanges);
    
    console.log("🔍 Changes cancelled for role:", roleId);
  };

  // Check if current user can edit permissions
  const canCurrentUserEditPermissions = () => {
    console.log("🔍 Checking if current user can edit permissions:", {
      userRoleName: user?.roleName,
      isSuperAdmin: isCurrentUserSuperAdmin(),
      user: user
    });
    
    // ONLY super-admin can edit permissions - no exceptions
    if (isCurrentUserSuperAdmin()) {
      console.log("✅ Super admin can edit permissions");
      return true;
    }
    
    // For now, we're restricting to super-admin only
    // If you want to allow other roles to edit permissions, you need to:
    // 1. Have super-admin explicitly grant canEditPermissions to that role
    // 2. Update this logic to check for that specific permission
    
    console.log("❌ Only super-admin can edit permissions - current user is not super-admin");
    return false;
  };

  // Check if user has permission to modify roles
  const canModifyPermissions = canCurrentUserEditPermissions();

  // Check if a subsection should be visible based on view permissions
  const shouldShowSubsection = (roleId: string, section: string, subsection: string) => {
    const role = roles.find(r => r._id === roleId);
    if (!role) return false;
    
    // For super admin, show all subsections
    if (role.isSuperAdmin || role.name === 'super-admin') {
      return true;
    }
    
    const sectionPermission = role.permissions.find(p => p.section === section);
    if (!sectionPermission) return false;
    
    // If the section has subsections defined, show all subsections for editing
    // The user can then set permissions for each subsection
    if (sectionPermission.subsections && sectionPermission.subsections.length > 0) {
      return true; // Show all subsections for sections that have them
    }
    
    // For sections without subsections, check section-level permissions
    return sectionPermission.permissions.includes('view') ||
           sectionPermission.permissions.includes('edit') ||
           sectionPermission.permissions.includes('upload');
  };

  // Toggle sub-section permission
  // Toggle main section permission (for sections without subsections)
  const togglePermission = (roleId: string, section: string, permission: string) => {
    if (!canCurrentUserEditPermissions()) return;
    
    const key = `${roleId}-${section}`;
    const currentChanges = permissionChanges[key] || [];
    
    // Check if permission is currently active (either in changes or original role)
    const isCurrentlyActive = isPermissionActive(roleId, section, permission);
    
    console.log('🔍 togglePermission called:', { 
      roleId, 
      section, 
      permission, 
      key, 
      currentChanges, 
      isCurrentlyActive 
    });
    
    let newPermissions: string[];
    if (isCurrentlyActive) {
      // Removing permission
      newPermissions = currentChanges.filter(p => p !== permission);
      console.log('🔍 Removing permission, new permissions:', newPermissions);
      
      // If removing "view", check if "edit" or "upload" are still present in the final state
      if (permission === 'view') {
        // Check if edit or upload will still be present after removing view
        const willHaveEditOrUpload = newPermissions.includes('edit') || newPermissions.includes('upload');
        console.log('🔍 Will have edit/upload after removing view:', willHaveEditOrUpload);
        if (willHaveEditOrUpload) {
          console.log('🔍 Cannot remove view permission while edit/upload are present');
          return; // Don't allow removing view if edit/upload are present
        }
      }
    } else {
      // Adding permission
      newPermissions = [...currentChanges, permission];
      console.log('🔍 Adding permission, new permissions:', newPermissions);
      
      // Auto-include "view" permission if "edit" or "upload" is being granted
      if (permission === 'edit' || permission === 'upload') {
        if (!newPermissions.includes('view')) {
          newPermissions.push('view');
          console.log('🔍 Auto-added view permission');
        }
      }
    }
    
    console.log('🔍 Final new permissions:', newPermissions);
    
    setPermissionChanges(prev => ({
      ...prev,
      [key]: newPermissions
    }));
    
    // Check if there are any changes for this role
    const hasChanges = Object.keys(permissionChanges).some(k => k.startsWith(roleId));
    setIsEditing(hasChanges);
  };

  const toggleSubsectionPermission = (roleId: string, section: string, subsection: string, permission: string) => {
    console.log('🔍 toggleSubsectionPermission called:', { roleId, section, subsection, permission });
    
    if (!canCurrentUserEditPermissions()) {
      console.log('❌ Cannot edit permissions - user not authorized');
      return;
    }
    
    const key = `${roleId}-${section}-${subsection}`;
    const currentChanges = permissionChanges[key] || [];
    
    console.log('🔍 Current changes for key:', key, currentChanges);
    
    // Check if permission is currently active (either in changes or original role)
    const isCurrentlyActive = isSubsectionPermissionActive(roleId, section, subsection, permission);
    console.log('🔍 Permission currently active:', isCurrentlyActive);
    
    let newPermissions: string[];
    if (isCurrentlyActive) {
      // Removing permission
      newPermissions = currentChanges.filter(p => p !== permission);
      console.log('🔍 Removing permission:', permission, 'New permissions:', newPermissions);
      
      // If removing "view", check if "edit" or "upload" are still present in the final state
      if (permission === 'view') {
        // Check if edit or upload will still be present after removing view
        const willHaveEditOrUpload = newPermissions.includes('edit') || newPermissions.includes('upload');
        if (willHaveEditOrUpload) {
          console.log('🔍 Cannot remove view permission while edit/upload are present');
          return; // Don't allow removing view if edit/upload are present
        }
      }
    } else {
      // Adding permission
      newPermissions = [...currentChanges, permission];
      console.log('🔍 Adding permission:', permission, 'New permissions before auto-view:', newPermissions);
      
      // Auto-include "view" permission if "edit" or "upload" is being granted
      if (permission === 'edit' || permission === 'upload') {
        if (!newPermissions.includes('view')) {
          newPermissions.push('view');
          console.log('🔍 Auto-added view permission. Final permissions:', newPermissions);
        }
      }
    }
    
    console.log('🔍 Setting permission changes for key:', key, 'with permissions:', newPermissions);
    
    setPermissionChanges(prev => ({
      ...prev,
      [key]: newPermissions
    }));
    
    // Check if there are any changes for this role
    const hasChanges = Object.keys(permissionChanges).some(k => k.startsWith(roleId));
    setIsEditing(hasChanges);
  };

  // Check if sub-section permission is active
  // Check if main section permission is active (for sections without subsections)
  const isPermissionActive = (roleId: string, section: string, permission: string) => {
    const key = `${roleId}-${section}`;
    const changes = permissionChanges[key];
    
    console.log('🔍 isPermissionActive called:', { roleId, section, permission, key, changes });
    
    if (changes !== undefined) {
      // If changes is defined (even if empty array), use it
      // For "view" permission, check if it's explicitly in changes OR if edit/upload are present
      if (permission === 'view') {
        const result = changes.includes('view') || changes.includes('edit') || changes.includes('upload');
        console.log('🔍 View permission in changes:', { 
          hasView: changes.includes('view'), 
          hasEdit: changes.includes('edit'), 
          hasUpload: changes.includes('upload'), 
          result 
        });
        return result;
      }
      const result = changes.includes(permission);
      console.log('🔍 Permission in changes:', { permission, result });
      return result;
    }
    
    const role = roles.find(r => r._id === roleId);
    if (!role) return false;
    
    // For super admin role being edited, show their actual permissions (not always true)
    if (role.isSuperAdmin || role.name === 'super-admin') {
      const sectionPermission = role.permissions.find(p => p.section === section);
      if (!sectionPermission) return false;
      
      // For "view" permission, also return true if user has "edit" or "upload"
      if (permission === 'view') {
        const result = sectionPermission.permissions.includes('view') ||
               sectionPermission.permissions.includes('edit') ||
               sectionPermission.permissions.includes('upload');
        console.log('🔍 Super admin view permission:', { 
          hasView: sectionPermission.permissions.includes('view'),
          hasEdit: sectionPermission.permissions.includes('edit'),
          hasUpload: sectionPermission.permissions.includes('upload'),
          result 
        });
        return result;
      }
      const result = sectionPermission.permissions.includes(permission);
      console.log('🔍 Super admin permission:', { permission, result });
      return result;
    }
    
    const sectionPermission = role.permissions.find(p => p.section === section);
    if (!sectionPermission) return false;
    
    // For "view" permission, also return true if user has "edit" or "upload"
    if (permission === 'view') {
      const result = sectionPermission.permissions.includes('view') ||
             sectionPermission.permissions.includes('edit') ||
             sectionPermission.permissions.includes('upload');
      console.log('🔍 Regular role view permission:', { 
        hasView: sectionPermission.permissions.includes('view'),
        hasEdit: sectionPermission.permissions.includes('edit'),
        hasUpload: sectionPermission.permissions.includes('upload'),
        result 
      });
      return result;
    }
    const result = sectionPermission.permissions.includes(permission);
    console.log('🔍 Regular role permission:', { permission, result });
    return result;
  };

  const isSubsectionPermissionActive = (roleId: string, section: string, subsection: string, permission: string) => {
    const key = `${roleId}-${section}-${subsection}`;
    const changes = permissionChanges[key];
    
    console.log('🔍 isSubsectionPermissionActive called:', { roleId, section, subsection, permission, key, changes });
    
    // Check if there are pending changes for this subsection
    if (changes !== undefined) {
      // If changes is defined (even if empty array), use it
      const hasPermission = changes.includes(permission);
      console.log('🔍 Checking permission in changes:', { permission, changes, hasPermission });
      
      // For "view" permission, also check if "edit" or "upload" are present in changes
      if (permission === 'view') {
        const hasView = changes.includes('view');
        const hasEditOrUpload = changes.includes('edit') || changes.includes('upload');
        const result = hasView || hasEditOrUpload;
        console.log('🔍 View permission check in changes:', { hasView, hasEditOrUpload, result });
        return result;
      }
      
      return hasPermission;
    }
    
    // Check original role permissions
    const role = roles.find(r => r._id === roleId);
    if (!role) return false;
    
    // For super admin role being edited, show their actual permissions (not always true)
    if (role.isSuperAdmin || role.name === 'super-admin') {
      // Check if the role has this specific sub-section permission
      const sectionPermission = role.permissions.find(p => p.section === section);
      if (!sectionPermission) return false;
      
      // Check subsections array for the specific subsection
      if (sectionPermission.subsections && sectionPermission.subsections.length > 0) {
        const subsectionPermission = sectionPermission.subsections.find((sub: SubsectionPermission) => sub.subsection === subsection);
        if (subsectionPermission) {
          // For "view" permission, also return true if user has "edit" or "upload"
          if (permission === 'view') {
            return subsectionPermission.permissions.includes('view') ||
                   subsectionPermission.permissions.includes('edit') ||
                   subsectionPermission.permissions.includes('upload');
          }
          return subsectionPermission.permissions.includes(permission);
        }
      }
      
      // Fallback: if no subsections defined, check section-level permissions
      if (permission === 'view') {
        return sectionPermission.permissions.includes('view') ||
               sectionPermission.permissions.includes('edit') ||
               sectionPermission.permissions.includes('upload');
      }
      return sectionPermission.permissions.includes(permission);
    }
    
    // Check if the role has this specific sub-section permission
    const sectionPermission = role.permissions.find(p => p.section === section);
    if (!sectionPermission) return false;
    
    // Check subsections array for the specific subsection
    if (sectionPermission.subsections && sectionPermission.subsections.length > 0) {
      const subsectionPermission = sectionPermission.subsections.find((sub: SubsectionPermission) => sub.subsection === subsection);
      if (subsectionPermission) {
        // For "view" permission, also return true if user has "edit" or "upload"
        if (permission === 'view') {
          return subsectionPermission.permissions.includes('view') ||
                 subsectionPermission.permissions.includes('edit') ||
                 subsectionPermission.permissions.includes('upload');
        }
        return subsectionPermission.permissions.includes(permission);
      }
    }
    
    // Fallback: if no subsections defined, check section-level permissions
    if (permission === 'view') {
      return sectionPermission.permissions.includes('view') ||
             sectionPermission.permissions.includes('edit') ||
             sectionPermission.permissions.includes('upload');
    }
    return sectionPermission.permissions.includes(permission);
  };

  return (
    <div className="roles-permission-page">
      <div className="roles-permission-card">
        <div className="roles-permission-card-header">
          <div className="roles-permission-title-block">
            <div className="roles-permission-title-accent" />
            <div>
              <h1 className="roles-permission-title">Roles and Permissions</h1>
              <p className="roles-permission-subtitle">
                View and manage role permissions for your store
              </p>
            </div>
          </div>
          {canModifyPermissions && (
            <div className="header-actions">
              <button className="btn-icon add">
                <Plus size={18} />
                Add New Roles
              </button>
            </div>
          )}
        </div>

        {/* Authorization Warning */}
        {!canModifyPermissions && (
          <div className="roles-permission-warning">
            <span className="roles-permission-warning-icon">⚠️</span>
            <div>
              <h3>Read-Only Access</h3>
              <p>Only Super Admin can modify role permissions. You can view the current permissions but cannot make changes.</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {/* Top Controls */}
        <div className="roles-permission-toolbar">
          <div className="roles-permission-toolbar-inner">
            <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search Roles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="roles-permission-table-wrap">
            <table className="roles-table">
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th
                    style={{
                      padding: "16px 24px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111827",
                      width: "80px",
                    }}
                  >
                    S.No.
                  </th>
                  <th
                    style={{
                      padding: "16px 24px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    Role Name
                  </th>
                  <th
                    style={{
                      padding: "16px 24px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    Permissions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "48px" }}>
                      <div className="roles-loading-cell">
                        <div className="loading-spinner" aria-hidden="true" />
                        <span className="roles-loading-text">Loading roles...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "40px", color: "red" }}>
                      {error}
                    </td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "0" }}>
                      <div className="roles-permission-empty">
                        <Shield className="roles-permission-empty-icon" size={64} strokeWidth={1.5} />
                        <p className="roles-permission-empty-message">No roles found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role, index) => (
                    <tr
                      key={role._id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    <td
                      style={{
                        padding: "16px 24px",
                        fontSize: "14px",
                        color: "#111827",
                          verticalAlign: "top",
                      }}
                    >
                        {index + 1}
                    </td>
                    <td
                      style={{
                        padding: "16px 24px",
                        fontSize: "14px",
                        color: "#111827",
                        verticalAlign: "top",
                        width: "200px", // Fixed width for role names
                      }}
                    >
                        <div>
                          <span className={`role-badge ${role.isSuperAdmin ? "super-admin" : "regular"}`}>
                            {role.isSuperAdmin ? "Super Admin" : role.name.replace('-', ' ')}
                          </span>
                        </div>
                    </td>
                    <td
                      style={{
                        padding: "16px 24px",
                        fontSize: "14px",
                        color: "#374151",
                        verticalAlign: "top",
                        width: "calc(100% - 200px)", // Fill remaining space
                      }}
                    >
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
                          gap: "8px",
                          width: "100%"
                        }}>
                          {sidebarSections.map((section) => (
                            <div 
                              key={`${role._id}-${section}`} 
                              className="permission-card"
                              style={{ opacity: canModifyPermissions ? 1 : 0.7, cursor: canModifyPermissions ? "pointer" : "default" }}
                              onClick={() => canModifyPermissions && openPermissionDialog(role._id, section)}
                            >
                              <div className="permission-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>{section}</span>
                                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{canModifyPermissions ? "⚙️" : "👁️"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>

        {/* Bottom Controls */}
        <div className="roles-permission-footer">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", color: "#64748b" }}>Show</span>
                <select
                  value={showEntries}
                  onChange={(e) => setShowEntries(Number(e.target.value))}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 32px 8px 12px",
                    fontSize: "14px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button className="pagination-btn" disabled>◀ Prev</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">Next ▶</button>
              </div>
            </div>
        </div>
      </div>

      {/* Permission Dialog */}
      {openDialog && (
        <div className="permission-dialog-overlay">
          <div className="permission-dialog">
            <div className="permission-dialog-header">
              <h3>{canModifyPermissions ? "Edit" : "View"} Permissions - {openDialog.section}</h3>
              <button className="dialog-close-btn" onClick={closePermissionDialog}>
                <X size={20} />
              </button>
            </div>

            {/* Permissions content */}
            <div style={{ marginBottom: "20px" }}>
              {sidebarSectionsWithSubsections[openDialog.section as keyof typeof sidebarSectionsWithSubsections]?.length > 0 ? (
                // Show subsections for sections that have them
                sidebarSectionsWithSubsections[openDialog.section as keyof typeof sidebarSectionsWithSubsections]?.map((subsection: string) => (
                  <div key={subsection} style={{
                    marginBottom: "16px",
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    backgroundColor: "#f9fafb"
                  }}>
                    <h4 style={{ 
                      margin: "0 0 8px 0", 
                      fontSize: "14px", 
                      fontWeight: "600",
                      color: "#374151"
                    }}>
                      {subsection}
                    </h4>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {permissionTypes.map((permission) => {
                        const isActive = isSubsectionPermissionActive(openDialog.roleId, openDialog.section, subsection, permission);
                        const role = roles.find(r => r._id === openDialog.roleId);
                        const isSuperAdminRole = role?.isSuperAdmin || role?.name === 'super-admin' || role?.name.toLowerCase().includes('super');
                        const canEdit = canModifyPermissions && !isSuperAdminRole;
                        
                        console.log('🔍 Button state:', { 
                          roleId: openDialog.roleId, 
                          section: openDialog.section, 
                          subsection, 
                          permission, 
                          isActive, 
                          canEdit, 
                          canModifyPermissions, 
                          isSuperAdminRole,
                          roleName: role?.name 
                        });
                        
                        return (
                          <button
                            key={`${subsection}-${permission}`}
                            onClick={() => {
                              console.log('🔍 Button clicked:', { roleId: openDialog.roleId, section: openDialog.section, subsection, permission, canEdit });
                              if (canEdit) {
                                toggleSubsectionPermission(openDialog.roleId, openDialog.section, subsection, permission);
                              }
                            }}
                            disabled={!canEdit}
                            className={`perm-btn ${permission} ${isActive ? "active" : ""}`}
                          >
                            {permission}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                // Show main permission buttons for sections without subsections
                <div style={{
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  backgroundColor: "#f9fafb"
                }}>
                  <h4 style={{ 
                    margin: "0 0 8px 0", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    color: "#374151"
                  }}>
                    Permissions
                  </h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {permissionTypes.map((permission) => {
                      const isActive = isPermissionActive(openDialog.roleId, openDialog.section, permission);
                      const role = roles.find(r => r._id === openDialog.roleId);
                      const isSuperAdminRole = role?.isSuperAdmin || role?.name === 'super-admin' || role?.name.toLowerCase().includes('super');
                      const canEdit = canModifyPermissions && !isSuperAdminRole;
                      
                      console.log('🔍 Main button state:', { 
                        roleId: openDialog.roleId, 
                        section: openDialog.section, 
                        permission, 
                        isActive, 
                        canEdit, 
                        canModifyPermissions, 
                        isSuperAdminRole,
                        roleName: role?.name 
                      });
                      
                      return (
                        <button
                          key={permission}
                          onClick={() => canEdit && togglePermission(openDialog.roleId, openDialog.section, permission)}
                          disabled={!canEdit}
                          className={`perm-btn ${permission} ${isActive ? "active" : ""}`}
                        >
                          {permission}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {!canModifyPermissions && (
              <div style={{
                backgroundColor: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "12px",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "14px"
              }}>
                <span style={{ fontSize: "16px", marginRight: "8px" }}>👁️</span>
                Read-only mode: You can view permissions but cannot modify them
              </div>
            )}

            {canModifyPermissions && hasChangesForRole(openDialog.roleId) && (
              <div className="dialog-actions">
                <button className="btn-cancel" onClick={() => cancelChangesForRole(openDialog.roleId)}>
                  Cancel
                </button>
                <button
                  className="btn-save"
                  onClick={() => {
                    savePermissionChanges(openDialog.roleId);
                    closePermissionDialog();
                  }}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermission;
