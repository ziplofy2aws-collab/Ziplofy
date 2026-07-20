import React from 'react';
import { PermissionGate, PermissionButton, PermissionIcon } from './PermissionGate';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Theme Developer Component
 * Example component showing how to implement permission-based conditional rendering
 */
export const ThemeDeveloper: React.FC = () => {
  const { getPermissionDetails } = usePermissions();
  
  // Get permission details for Theme Developer subsection
  const permissions = getPermissionDetails('Developer', 'Theme Developer');
  
  console.log('🔍 Theme Developer permissions:', permissions);

  return (
    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', margin: '10px' }}>
      <h3>Theme Developer Section</h3>
      
      {/* View Permission - Always show content but with different styling */}
      <PermissionGate action="view" section="Developer" subsection="Theme Developer">
        <div>
          <h4>Available Themes</h4>
          <p>Here are the available themes for your store...</p>
          
          {/* Edit Permission - Show edit buttons only if user has edit permission */}
          <PermissionGate 
            action="edit" 
            section="Developer" 
            subsection="Theme Developer"
            fallback={<p style={{ color: '#9ca3af', fontStyle: 'italic' }}>You don't have permission to edit themes</p>}
          >
            <div style={{ marginTop: '10px' }}>
              <PermissionButton
                action="edit"
                section="Developer"
                subsection="Theme Developer"
                onClick={() => console.log('Edit theme clicked')}
                style={{ marginRight: '10px', padding: '8px 16px' }}
              >
                Edit Theme
              </PermissionButton>
              
              <PermissionButton
                action="edit"
                section="Developer"
                subsection="Theme Developer"
                onClick={() => console.log('Customize theme clicked')}
                style={{ padding: '8px 16px' }}
              >
                Customize Theme
              </PermissionButton>
            </div>
          </PermissionGate>
          
          {/* Upload Permission - Show upload buttons only if user has upload permission */}
          <PermissionGate 
            action="upload" 
            section="Developer" 
            subsection="Theme Developer"
            fallback={<p style={{ color: '#9ca3af', fontStyle: 'italic' }}>You don't have permission to upload themes</p>}
          >
            <div style={{ marginTop: '10px' }}>
              <PermissionButton
                action="upload"
                section="Developer"
                subsection="Theme Developer"
                onClick={() => console.log('Upload theme clicked')}
                style={{ 
                  marginRight: '10px', 
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Upload New Theme
              </PermissionButton>
              
              <PermissionButton
                action="upload"
                section="Developer"
                subsection="Theme Developer"
                onClick={() => console.log('Add theme clicked')}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Add Theme
              </PermissionButton>
            </div>
          </PermissionGate>
          
          {/* Example with icons */}
          <div style={{ marginTop: '20px' }}>
            <h5>Actions with Icons:</h5>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <PermissionIcon
                action="view"
                section="Developer"
                subsection="Theme Developer"
                icon="👁️"
              />
              <span>View Themes</span>
              
              <PermissionIcon
                action="edit"
                section="Developer"
                subsection="Theme Developer"
                icon="✏️"
                fallbackIcon="🚫"
              />
              <span>Edit Themes</span>
              
              <PermissionIcon
                action="upload"
                section="Developer"
                subsection="Theme Developer"
                icon="📤"
                fallbackIcon="🚫"
              />
              <span>Upload Themes</span>
            </div>
          </div>
        </div>
      </PermissionGate>
      
      {/* Show permission status for debugging */}
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>Permission Status:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Can View: {permissions.canView ? '✅' : '❌'}</li>
          <li>Can Edit: {permissions.canEdit ? '✅' : '❌'}</li>
          <li>Can Upload: {permissions.canUpload ? '✅' : '❌'}</li>
          <li>Has Any Permission: {permissions.hasAnyPermission ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Example usage in other components
 */
export const ExampleUsage: React.FC = () => {
  return (
    <div>
      <h2>Permission-Based Component Examples</h2>
      
      {/* Example 1: Simple conditional rendering */}
      <PermissionGate action="view" section="Developer" subsection="Theme Developer">
        <div>
          <h3>Theme Management</h3>
          <p>This section is only visible to users with view permission for Theme Developer.</p>
        </div>
      </PermissionGate>
      
      {/* Example 2: Upload button with permission check */}
      <PermissionGate action="upload" section="Developer" subsection="Theme Developer">
        <button 
          onClick={() => console.log('Upload theme')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          Upload Theme
        </button>
      </PermissionGate>
      
      {/* Example 3: Edit form with permission check */}
      <PermissionGate action="edit" section="Developer" subsection="Theme Developer">
        <div>
          <h4>Edit Theme Settings</h4>
          <form>
            <input type="text" placeholder="Theme name" />
            <button type="submit">Save Changes</button>
          </form>
        </div>
      </PermissionGate>
    </div>
  );
};
