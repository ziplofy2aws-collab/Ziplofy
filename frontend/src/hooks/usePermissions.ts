import { useAdminAuth } from '../contexts/admin-auth.context';
import { useState, useEffect } from 'react';
import axios from '../config/axios';

interface UserPermissions {
  [section: string]: {
    permissions: string[];
    subsections?: {
      [subsection: string]: string[];
    };
  };
}

export const usePermissions = () => {
  const { user } = useAdminAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/auth/me');
        const userData = response.data.data || response.data;
        
        // Helper to convert role permissions to UserPermissions format
        const buildPermissionsFromRole = (rolePermissions: any[]): UserPermissions => {
          const userPermissions: UserPermissions = {};
          if (!Array.isArray(rolePermissions)) return userPermissions;
          rolePermissions.forEach((permission: any) => {
            if (permission?.section) {
              userPermissions[permission.section] = {
                permissions: permission.permissions || [],
                subsections: permission.subsections?.reduce((acc: any, sub: any) => {
                  if (sub?.subsection) acc[sub.subsection] = sub.permissions || [];
                  return acc;
                }, {} as Record<string, string[]>)
              };
            }
          });
          return userPermissions;
        };
        
        // Priority 1: Super-admin has all permissions (check before roleWithPermissions since super-admin role may have empty permissions)
        if (userData.role === 'super-admin' || userData.superAdmin || userData.roleWithPermissions?.isSuperAdmin) {
          const allPermissions: UserPermissions = {
            "Client List": { permissions: ["view", "edit", "upload"] },
            "Payment": { permissions: ["view", "edit", "upload"] },
            "Invoice": { permissions: ["view", "edit", "upload"] },
            "User Management": { 
              permissions: ["view", "edit", "upload"],
              subsections: {
                "Manage User": ["view", "edit", "upload"],
                "Roles and Permission": ["view", "edit", "upload"]
              }
            },
            "Membership": { 
              permissions: ["view", "edit", "upload"],
              subsections: {
                "Membership Plan": ["view", "edit", "upload"]
              }
            },
            "Developer": { 
              permissions: ["view", "edit", "upload"],
              subsections: {
                "Dev Admin": ["view", "edit", "upload"],
                "Theme Developer": ["view", "edit", "upload"],
                "Support Developer": ["view", "edit", "upload"],
                "Hire Developer Requests": ["view", "edit", "upload"]
              }
            },
            "Support": { 
              permissions: ["view", "edit", "upload"],
              subsections: {
                "Domain": ["view", "edit", "upload"],
                "Ticket": ["view", "edit", "upload"],
                "Raise Task": ["view", "edit", "upload"],
                "Live Support": ["view", "edit", "upload"]
              }
            }
          };
          setPermissions(allPermissions);
          return;
        }
        
        // Priority 2: Use roleWithPermissions from /auth/me (single source of truth for non-super-admin)
        if (userData.roleWithPermissions?.permissions && Array.isArray(userData.roleWithPermissions.permissions)) {
          const perms = buildPermissionsFromRole(userData.roleWithPermissions.permissions);
          setPermissions(perms);
          return;
        }
        
        // Priority 3: Fallback - fetch /roles and find user's role by name (legacy)
        try {
          const roleResponse = await axios.get('/roles', { params: { limit: 100 } });
          if (roleResponse.data.success && roleResponse.data.data) {
            const userRole = roleResponse.data.data.find((r: any) => r.name === userData.role);
            if (userRole?.permissions) {
              setPermissions(buildPermissionsFromRole(userRole.permissions));
            } else {
              setPermissions({});
            }
          } else {
            setPermissions({});
          }
        } catch (roleError) {
          console.error('Error fetching role permissions:', roleError);
          setPermissions({});
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        // Fallback: if user is super-admin, grant all permissions
        if (user.roleName === 'super-admin' || localStorage.getItem('isSuperAdmin') === 'true') {
          const allPermissions: UserPermissions = {
            "Client List": { permissions: ["view", "edit", "upload"] },
            "Payment": { permissions: ["view", "edit", "upload"] },
            "Invoice": { permissions: ["view", "edit", "upload"] },
            "User Management": { 
              permissions: ["view", "edit", "upload"],
              subsections: {
                "Manage User": ["view", "edit", "upload"],
                "Roles and Permission": ["view", "edit", "upload"]
              }
            },
            "Membership": { 
              permissions: ["view", "edit", "upload"],
              subsections: {
                "Membership Plan": ["view", "edit", "upload"]
              }
            },
            "Developer": { 
              permissions: ["view", "edit", "upload"],
              subsections: {
                "Dev Admin": ["view", "edit", "upload"],
                "Theme Developer": ["view", "edit", "upload"],
                "Support Developer": ["view", "edit", "upload"],
                "Hire Developer Requests": ["view", "edit", "upload"]
              }
            },
            "Support": { 
              permissions: ["view", "edit", "upload"],
              subsections: {
                "Domain": ["view", "edit", "upload"],
                "Ticket": ["view", "edit", "upload"],
                "Raise Task": ["view", "edit", "upload"],
                "Live Support": ["view", "edit", "upload"]
              }
            }
          };
          setPermissions(allPermissions);
        } else {
          setPermissions({});
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, [user]);

  // Check if user has view permission for a section
  const hasViewPermission = (section: string, subsection?: string): boolean => {
    if (!user) return false;

    if (user.roleName === 'super-admin' || localStorage.getItem('isSuperAdmin') === 'true') return true;

    const sectionPermissions = permissions[section];
    if (!sectionPermissions) return false;

    if (subsection) {
      const subsectionPermissions = sectionPermissions.subsections?.[subsection];
      if (!subsectionPermissions) {
        return sectionPermissions.permissions.includes('view') ||
               sectionPermissions.permissions.includes('edit') ||
               sectionPermissions.permissions.includes('upload');
      }
      return subsectionPermissions.includes('view') ||
             subsectionPermissions.includes('edit') ||
             subsectionPermissions.includes('upload');
    }

    return sectionPermissions.permissions.includes('view') ||
           sectionPermissions.permissions.includes('edit') ||
           sectionPermissions.permissions.includes('upload');
  };

  const hasEditPermission = (section: string, subsection?: string): boolean => {
    if (!user) return false;

    if (user.roleName === 'super-admin' || localStorage.getItem('isSuperAdmin') === 'true') return true;

    const sectionPermissions = permissions[section];
    if (!sectionPermissions) return false;

    if (subsection) {
      const subsectionPermissions = sectionPermissions.subsections?.[subsection];
      if (!subsectionPermissions) return sectionPermissions.permissions.includes('edit');
      return subsectionPermissions.includes('edit');
    }

    return sectionPermissions.permissions.includes('edit');
  };

  const hasUploadPermission = (section: string, subsection?: string): boolean => {
    if (!user) {
      return false;
    }

    // Super admin has all permissions
    if (user.roleName === 'super-admin' || localStorage.getItem('isSuperAdmin') === 'true') {
      return true;
    }

    const sectionPermissions = permissions[section];
    if (!sectionPermissions) return false;

    // If checking subsection permission
    if (subsection) {
      const subsectionPermissions = sectionPermissions.subsections?.[subsection];
      if (!subsectionPermissions) return sectionPermissions.permissions.includes('upload');
      return subsectionPermissions.includes('upload') || sectionPermissions.permissions.includes('upload');
    }

    return sectionPermissions.permissions.includes('upload');
  };

  // Comprehensive permission check for a specific section/subsection
  const getPermissionDetails = (section: string, subsection?: string) => {
    return {
      canView: hasViewPermission(section, subsection),
      canEdit: hasEditPermission(section, subsection),
      canUpload: hasUploadPermission(section, subsection),
      hasAnyPermission: hasViewPermission(section, subsection) || hasEditPermission(section, subsection) || hasUploadPermission(section, subsection)
    };
  };

  return {
    permissions,
    loading,
    hasViewPermission,
    hasEditPermission,
    hasUploadPermission,
    getPermissionDetails,
    user
  };
};
