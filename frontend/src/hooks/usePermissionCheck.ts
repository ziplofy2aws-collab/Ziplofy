import React from 'react';
import { useAdminAuth } from '../contexts/admin-auth.context';

export interface PermissionCheckResult {
  canView: boolean;
  canEdit: boolean;
  canUpload: boolean;
  hasAnyPermission: boolean;
}

/**
 * Hook to check user permissions for specific sections and subsections
 * @param section - The main section (e.g., "Developer", "Support", "Client List")
 * @param subsection - Optional subsection (e.g., "Theme Developer", "Dev Admin")
 * @returns PermissionCheckResult with boolean flags for each permission type
 */
export const usePermissionCheck = (section: string, subsection?: string): PermissionCheckResult => {
  const { user } = useAdminAuth();

  // Super admin has all permissions
  if (user?.roleName === 'super-admin' || localStorage.getItem('isSuperAdmin') === 'true') {
    return {
      canView: true,
      canEdit: true,
      canUpload: true,
      hasAnyPermission: true
    };
  }

  // For non-super-admin users, we need to check their role permissions
  // This would typically involve fetching the user's role permissions from the backend
  // For now, we'll implement a basic structure that can be extended
  
  // TODO: Implement actual permission checking logic based on user's role
  // This would involve:
  // 1. Fetching the user's role permissions from the backend
  // 2. Checking if the user has the specific permissions for the section/subsection
  // 3. Returning the appropriate boolean values
  
  console.log('🔍 Permission check requested:', { 
    section, 
    subsection, 
    userRole: user?.roleName,
    userId: user?.id 
  });

  // Placeholder implementation - replace with actual permission logic
  return {
    canView: false,
    canEdit: false,
    canUpload: false,
    hasAnyPermission: false
  };
};

/**
 * Hook to check if user can perform a specific action
 * @param action - The action to check ('view', 'edit', 'upload')
 * @param section - The main section
 * @param subsection - Optional subsection
 * @returns boolean indicating if the user can perform the action
 */
export const useCanPerformAction = (
  action: 'view' | 'edit' | 'upload',
  section: string,
  subsection?: string
): boolean => {
  const permissions = usePermissionCheck(section, subsection);
  
  switch (action) {
    case 'view':
      return permissions.canView;
    case 'edit':
      return permissions.canEdit;
    case 'upload':
      return permissions.canUpload;
    default:
      return false;
  }
};

/**
 * Higher-order component for conditional rendering based on permissions
 * @param action - The action to check
 * @param section - The main section
 * @param subsection - Optional subsection
 * @param children - The content to render if permission is granted
 * @param fallback - Optional content to render if permission is denied
 */
export const PermissionGate = ({ 
  action, 
  section, 
  subsection, 
  children, 
  fallback = null 
}: {
  action: 'view' | 'edit' | 'upload';
  section: string;
  subsection?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const canPerform = useCanPerformAction(action, section, subsection);

  return canPerform
    ? React.createElement(React.Fragment, null, children)
    : React.createElement(React.Fragment, null, fallback);
};

/**
 * Hook to get permission-based button props
 * @param action - The action to check
 * @param section - The main section
 * @param subsection - Optional subsection
 * @returns Object with disabled state and styling for buttons
 */
export const usePermissionButtonProps = (
  action: 'view' | 'edit' | 'upload',
  section: string,
  subsection?: string
) => {
  const canPerform = useCanPerformAction(action, section, subsection);
  
  return {
    disabled: !canPerform,
    style: {
      opacity: canPerform ? 1 : 0.5,
      cursor: canPerform ? 'pointer' : 'not-allowed',
      backgroundColor: canPerform ? undefined : '#f3f4f6'
    }
  };
};
