# Permission-Based Conditional Rendering Implementation Guide

## Overview

This guide explains how to implement permission-based conditional rendering throughout your application. Users will only see buttons, forms, and functionality that they have permission to use.

## 🎯 Key Components Created

### 1. Enhanced `usePermissions` Hook
**Location**: `src/hooks/usePermissions.ts`

**New Methods Added**:
- `hasEditPermission(section, subsection?)` - Check if user can edit
- `hasUploadPermission(section, subsection?)` - Check if user can upload
- `getPermissionDetails(section, subsection?)` - Get all permission details

### 2. Permission Components
**Location**: `src/Components/PermissionGate.tsx`

- **`PermissionGate`** - Conditionally render content based on permissions
- **`PermissionButton`** - Button that's disabled/styled based on permissions
- **`PermissionIcon`** - Icon that changes appearance based on permissions

### 3. Example Components
- **`ThemeDeveloper.tsx`** - Example implementation for Theme Developer section
- **`PermissionExamples.tsx`** - Comprehensive examples for all sections

## 🚀 How to Use

### Basic Permission Check

```tsx
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { hasUploadPermission } = usePermissions();
  
  // Check if user can upload themes
  const canUploadThemes = hasUploadPermission('Developer', 'Theme Developer');
  
  return (
    <div>
      {canUploadThemes && (
        <button onClick={() => console.log('Upload theme')}>
          Upload Theme
        </button>
      )}
    </div>
  );
};
```

### Using PermissionGate Component

```tsx
import { PermissionGate } from '../Components/PermissionGate';

const ThemeSection = () => {
  return (
    <div>
      {/* Only show upload buttons if user has upload permission */}
      <PermissionGate 
        action="upload" 
        section="Developer" 
        subsection="Theme Developer"
        fallback={<p>You don't have permission to upload themes</p>}
      >
        <button onClick={() => console.log('Upload theme')}>
          Upload Theme
        </button>
        <button onClick={() => console.log('Add theme')}>
          Add Theme
        </button>
      </PermissionGate>
    </div>
  );
};
```

### Using PermissionButton Component

```tsx
import { PermissionButton } from '../Components/PermissionGate';

const ActionButtons = () => {
  return (
    <div>
      {/* Button is automatically disabled if user lacks permission */}
      <PermissionButton
        action="upload"
        section="Developer"
        subsection="Theme Developer"
        onClick={() => console.log('Upload theme')}
        style={{ backgroundColor: '#10b981', color: 'white' }}
      >
        Upload Theme
      </PermissionButton>
    </div>
  );
};
```

### Using PermissionIcon Component

```tsx
import { PermissionIcon } from '../Components/PermissionGate';

const ActionIcons = () => {
  return (
    <div>
      <PermissionIcon
        action="upload"
        section="Developer"
        subsection="Theme Developer"
        icon="📤"
        fallbackIcon="🚫"
      />
      <span>Upload Themes</span>
    </div>
  );
};
```

## 🎯 Implementation Examples

### Example 1: Theme Developer Section

```tsx
const ThemeDeveloperSection = () => {
  return (
    <div>
      <h3>Theme Developer</h3>
      
      {/* View permission - show content */}
      <PermissionGate action="view" section="Developer" subsection="Theme Developer">
        <div>
          <p>Available themes...</p>
          
          {/* Edit permission - show edit buttons */}
          <PermissionGate action="edit" section="Developer" subsection="Theme Developer">
            <button>Edit Theme</button>
            <button>Customize Theme</button>
          </PermissionGate>
          
          {/* Upload permission - show upload buttons */}
          <PermissionGate action="upload" section="Developer" subsection="Theme Developer">
            <button style={{ backgroundColor: '#10b981' }}>Upload Theme</button>
            <button style={{ backgroundColor: '#3b82f6' }}>Add Theme</button>
          </PermissionGate>
        </div>
      </PermissionGate>
    </div>
  );
};
```

### Example 2: Support Section

```tsx
const SupportSection = () => {
  return (
    <div>
      <h3>Support</h3>
      
      {/* Domain Management */}
      <PermissionGate action="view" section="Support" subsection="Domain">
        <div>
          <h4>Domain Management</h4>
          <PermissionGate action="edit" section="Support" subsection="Domain">
            <button>Configure Domain</button>
          </PermissionGate>
        </div>
      </PermissionGate>
      
      {/* Ticket System */}
      <PermissionGate action="view" section="Support" subsection="Ticket">
        <div>
          <h4>Ticket System</h4>
          <PermissionGate action="edit" section="Support" subsection="Ticket">
            <button>Manage Tickets</button>
          </PermissionGate>
        </div>
      </PermissionGate>
    </div>
  );
};
```

## 🔧 Permission Structure

### Sections and Subsections

```typescript
// Main Sections
"Client List"     // No subsections
"Payment"         // No subsections  
"Invoice"         // No subsections
"User Management" // Subsections: "Manage User", "Roles and Permission"
"Membership"      // Subsections: "Membership Plan"
"Developer"       // Subsections: "Dev Admin", "Theme Developer", "Support Developer", "Hire Developer Requests"
"Support"         // Subsections: "Domain", "Ticket", "Raise Task", "Live Support"
```

### Permission Types

- **`view`** - Can see the content
- **`edit`** - Can modify existing content
- **`upload`** - Can add/upload new content

## 🎨 Styling and UX

### Automatic Styling
- **Disabled buttons**: Automatically styled with reduced opacity and "not-allowed" cursor
- **Hidden content**: Completely hidden if no permission
- **Fallback content**: Show custom message if permission denied

### Custom Styling
```tsx
<PermissionButton
  action="upload"
  section="Developer"
  subsection="Theme Developer"
  style={{
    backgroundColor: '#10b981',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px'
  }}
>
  Upload Theme
</PermissionButton>
```

## 🧪 Testing

### Test Different User Roles

1. **Super Admin**: Should see all buttons and functionality
2. **Support Admin**: Should only see buttons for sections they have permissions for
3. **Developer Admin**: Should see developer-related buttons based on their permissions
4. **Client Admin**: Should see client-related buttons based on their permissions

### Debug Permission Status

```tsx
const { getPermissionDetails } = usePermissions();

// Get permission details for debugging
const permissions = getPermissionDetails('Developer', 'Theme Developer');
console.log('Permissions:', permissions);
// Output: { canView: true, canEdit: false, canUpload: true, hasAnyPermission: true }
```

## 📝 Best Practices

### 1. Always Check Permissions
```tsx
// ✅ Good - Check permission before rendering
<PermissionGate action="upload" section="Developer" subsection="Theme Developer">
  <button>Upload Theme</button>
</PermissionGate>

// ❌ Bad - Don't render without permission check
<button>Upload Theme</button>
```

### 2. Provide Fallback Content
```tsx
// ✅ Good - Provide helpful fallback
<PermissionGate 
  action="upload" 
  section="Developer" 
  subsection="Theme Developer"
  fallback={<p>Contact admin to get upload permissions</p>}
>
  <button>Upload Theme</button>
</PermissionGate>
```

### 3. Use Appropriate Permission Types
```tsx
// ✅ Good - Use specific permission types
<PermissionGate action="upload" section="Developer" subsection="Theme Developer">
  <button>Upload Theme</button>
</PermissionGate>

<PermissionGate action="edit" section="Developer" subsection="Theme Developer">
  <button>Edit Theme</button>
</PermissionGate>
```

### 4. Test with Different Roles
- Test with super-admin (should see everything)
- Test with limited permissions (should see only allowed content)
- Test with no permissions (should see fallback content)

## 🚀 Next Steps

1. **Implement in existing components**: Add permission checks to your existing components
2. **Test with different users**: Login with different roles and verify permissions work
3. **Customize styling**: Adjust button styles and fallback messages as needed
4. **Add more sections**: Extend the permission system to other parts of your application

## 🔍 Debugging

### Check Permission Status
```tsx
const { getPermissionDetails } = usePermissions();
const permissions = getPermissionDetails('Developer', 'Theme Developer');

console.log('Theme Developer Permissions:', {
  canView: permissions.canView,
  canEdit: permissions.canEdit,
  canUpload: permissions.canUpload,
  hasAnyPermission: permissions.hasAnyPermission
});
```

### Console Logs
The system provides detailed console logs for debugging:
- Permission check requests
- User role information
- Permission results
- Fallback rendering

This implementation ensures that users only see and can interact with functionality they have permission to use, creating a secure and user-friendly experience.
  