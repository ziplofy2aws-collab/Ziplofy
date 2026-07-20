import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAdminAuth } from '../contexts/admin-auth.context';

/**
 * Debug component to show current user's permissions
 * This helps verify that permission-based conditional rendering is working correctly
 */
export const PermissionDebug: React.FC = () => {
  const { user } = useAdminAuth();
  const { getPermissionDetails } = usePermissions();

  const sections = [
    { section: 'Client List' },
    { section: 'Payment' },
    { section: 'Invoice' },
    { section: 'User Management' },
    { section: 'Membership' },
    { section: 'Developer', subsections: ['Dev Admin', 'Theme Developer', 'Support Developer', 'Hire Developer Requests'] },
    { section: 'Support', subsections: ['Domain', 'Ticket', 'Raise Task', 'Live Support'] }
  ];

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f9fafb', 
      borderRadius: '8px', 
      margin: '20px',
      border: '1px solid #e5e7eb'
    }}>
      <h2>🔍 Permission Debug Panel</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
        <h3>Current User Info:</h3>
        <p><strong>Name:</strong> {user?.name || 'Not loaded'}</p>
        <p><strong>Email:</strong> {user?.email || 'Not loaded'}</p>
        <p><strong>Role:</strong> {user?.roleName || 'Not loaded'}</p>
        <p><strong>Role ID:</strong> {user?.roleId || 'Not loaded'}</p>
      </div>

      <div>
        <h3>Permission Status:</h3>
        {sections.map(({ section, subsections }) => (
          <div key={section} style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>{section}</h4>
            
            {/* Main section permissions */}
            <div style={{ marginLeft: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                <span>View: {getPermissionDetails(section).canView ? '✅' : '❌'}</span>
                <span>Edit: {getPermissionDetails(section).canEdit ? '✅' : '❌'}</span>
                <span>Upload: {getPermissionDetails(section).canUpload ? '✅' : '❌'}</span>
              </div>
            </div>

            {/* Subsection permissions */}
            {subsections && subsections.map((subsection) => (
              <div key={subsection} style={{ marginLeft: '20px', marginTop: '5px' }}>
                <strong>{subsection}:</strong>
                <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
                  <span>View: {getPermissionDetails(section, subsection).canView ? '✅' : '❌'}</span>
                  <span>Edit: {getPermissionDetails(section, subsection).canEdit ? '✅' : '❌'}</span>
                  <span>Upload: {getPermissionDetails(section, subsection).canUpload ? '✅' : '❌'}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
        <h4>🧪 Test Instructions:</h4>
        <ol>
          <li>Login as <strong>super-admin</strong> - Should see all permissions as ✅</li>
          <li>Login as <strong>support-admin</strong> - Should see limited permissions based on role settings</li>
          <li>Login as <strong>developer-admin</strong> - Should see developer-related permissions</li>
          <li>Login as <strong>client-admin</strong> - Should see client-related permissions</li>
        </ol>
        <p><strong>Note:</strong> If you see ❌ for permissions you expect to have, check the role permissions in the Roles & Permission section.</p>
      </div>
    </div>
  );
};
