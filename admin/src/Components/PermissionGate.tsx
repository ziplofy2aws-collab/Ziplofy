import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGateProps {
  action: 'view' | 'edit' | 'upload';
  section: string;
  subsection?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 * 
 * @param action - The permission to check ('view', 'edit', 'upload')
 * @param section - The main section (e.g., "Developer", "Support")
 * @param subsection - Optional subsection (e.g., "Theme Developer", "Dev Admin")
 * @param children - Content to render if permission is granted
 * @param fallback - Content to render if permission is denied (optional)
 * @param showTooltip - Whether to show a tooltip when permission is denied
 * @param tooltipMessage - Custom tooltip message
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  action,
  section,
  subsection,
  children,
  fallback = null,
  showTooltip = false,
  tooltipMessage = "You don't have permission to perform this action"
}) => {
  const { hasViewPermission, hasEditPermission, hasUploadPermission } = usePermissions();

  let hasPermission = false;

  switch (action) {
    case 'view':
      hasPermission = hasViewPermission(section, subsection);
      break;
    case 'edit':
      hasPermission = hasEditPermission(section, subsection);
      break;
    case 'upload':
      hasPermission = hasUploadPermission(section, subsection);
      break;
    default:
      hasPermission = false;
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showTooltip) {
    return (
      <div 
        title={tooltipMessage}
        style={{ 
          opacity: 0.5, 
          cursor: 'not-allowed',
          position: 'relative'
        }}
      >
        {children}
      </div>
    );
  }

  return null;
};

/**
 * Permission Button Component
 * A button that is disabled and styled based on permissions
 */
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: 'view' | 'edit' | 'upload';
  section: string;
  subsection?: string;
  children: React.ReactNode;
  disabledMessage?: string;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  action,
  section,
  subsection,
  children,
  disabledMessage = "You don't have permission to perform this action",
  ...buttonProps
}) => {
  const { hasViewPermission, hasEditPermission, hasUploadPermission } = usePermissions();

  let hasPermission = false;

  switch (action) {
    case 'view':
      hasPermission = hasViewPermission(section, subsection);
      break;
    case 'edit':
      hasPermission = hasEditPermission(section, subsection);
      break;
    case 'upload':
      hasPermission = hasUploadPermission(section, subsection);
      break;
    default:
      hasPermission = false;
  }

  return (
    <button
      {...buttonProps}
      disabled={!hasPermission || buttonProps.disabled}
      title={!hasPermission ? disabledMessage : buttonProps.title}
      style={{
        ...buttonProps.style,
        opacity: hasPermission ? 1 : 0.5,
        cursor: hasPermission ? 'pointer' : 'not-allowed',
        backgroundColor: hasPermission ? undefined : '#f3f4f6'
      }}
    >
      {children}
    </button>
  );
};

/**
 * Permission Icon Component
 * An icon that changes appearance based on permissions
 */
interface PermissionIconProps {
  action: 'view' | 'edit' | 'upload';
  section: string;
  subsection?: string;
  icon: React.ReactNode;
  fallbackIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PermissionIcon: React.FC<PermissionIconProps> = ({
  action,
  section,
  subsection,
  icon,
  fallbackIcon = null,
  className = '',
  style = {}
}) => {
  const { hasViewPermission, hasEditPermission, hasUploadPermission } = usePermissions();

  let hasPermission = false;

  switch (action) {
    case 'view':
      hasPermission = hasViewPermission(section, subsection);
      break;
    case 'edit':
      hasPermission = hasEditPermission(section, subsection);
      break;
    case 'upload':
      hasPermission = hasUploadPermission(section, subsection);
      break;
    default:
      hasPermission = false;
  }

  if (!hasPermission && fallbackIcon) {
    return <span className={className} style={style}>{fallbackIcon}</span>;
  }

  return (
    <span 
      className={className} 
      style={{
        ...style,
        opacity: hasPermission ? 1 : 0.3,
        color: hasPermission ? undefined : '#9ca3af'
      }}
    >
      {icon}
    </span>
  );
};
