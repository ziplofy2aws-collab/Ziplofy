import React from 'react';
import { PermissionGate, PermissionButton, PermissionIcon } from './PermissionGate';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Comprehensive examples of permission-based conditional rendering
 * This component demonstrates how to implement permission checks throughout the application
 */
export const PermissionExamples: React.FC = () => {
  const { getPermissionDetails } = usePermissions();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Permission-Based Conditional Rendering Examples</h1>
      
      {/* Client List Section Examples */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <h2>Client List Section</h2>
        
        {/* View Permission */}
        <PermissionGate action="view" section="Client List">
          <div>
            <h3>Client Management</h3>
            <p>List of all clients...</p>
            
            {/* Edit Permission */}
            <PermissionGate action="edit" section="Client List">
              <div style={{ marginTop: '10px' }}>
                <PermissionButton
                  action="edit"
                  section="Client List"
                  onClick={() => console.log('Edit client')}
                  style={{ marginRight: '10px' }}
                >
                  Edit Client
                </PermissionButton>
                
                <PermissionButton
                  action="edit"
                  section="Client List"
                  onClick={() => console.log('Delete client')}
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  Delete Client
                </PermissionButton>
              </div>
            </PermissionGate>
            
            {/* Upload Permission */}
            <PermissionGate action="upload" section="Client List">
              <div style={{ marginTop: '10px' }}>
                <PermissionButton
                  action="upload"
                  section="Client List"
                  onClick={() => console.log('Import clients')}
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                  Import Clients
                </PermissionButton>
              </div>
            </PermissionGate>
          </div>
        </PermissionGate>
      </div>

      {/* Developer Section Examples */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <h2>Developer Section</h2>
        
        {/* Dev Admin Subsection */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Dev Admin</h3>
          <PermissionGate action="view" section="Developer" subsection="Dev Admin">
            <div>
              <p>Developer administration panel...</p>
              
              <PermissionGate action="edit" section="Developer" subsection="Dev Admin">
                <PermissionButton
                  action="edit"
                  section="Developer"
                  subsection="Dev Admin"
                  onClick={() => console.log('Manage developers')}
                >
                  Manage Developers
                </PermissionButton>
              </PermissionGate>
            </div>
          </PermissionGate>
        </div>

        {/* Theme Developer Subsection */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Theme Developer</h3>
          <PermissionGate action="view" section="Developer" subsection="Theme Developer">
            <div>
              <p>Theme development tools...</p>
              
              <PermissionGate action="upload" section="Developer" subsection="Theme Developer">
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <PermissionButton
                    action="upload"
                    section="Developer"
                    subsection="Theme Developer"
                    onClick={() => console.log('Upload theme')}
                    style={{ backgroundColor: '#10b981', color: 'white' }}
                  >
                    Upload Theme
                  </PermissionButton>
                  
                  <PermissionButton
                    action="upload"
                    section="Developer"
                    subsection="Theme Developer"
                    onClick={() => console.log('Add theme')}
                    style={{ backgroundColor: '#3b82f6', color: 'white' }}
                  >
                    Add Theme
                  </PermissionButton>
                </div>
              </PermissionGate>
            </div>
          </PermissionGate>
        </div>

        {/* Support Developer Subsection */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Support Developer</h3>
          <PermissionGate action="view" section="Developer" subsection="Support Developer">
            <div>
              <p>Support development tools...</p>
              
              <PermissionGate action="edit" section="Developer" subsection="Support Developer">
                <PermissionButton
                  action="edit"
                  section="Developer"
                  subsection="Support Developer"
                  onClick={() => console.log('Manage support')}
                >
                  Manage Support
                </PermissionButton>
              </PermissionGate>
            </div>
          </PermissionGate>
        </div>
      </div>

      {/* Support Section Examples */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <h2>Support Section</h2>
        
        {/* Domain Subsection */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Domain Management</h3>
          <PermissionGate action="view" section="Support" subsection="Domain">
            <div>
              <p>Domain configuration...</p>
              
              <PermissionGate action="edit" section="Support" subsection="Domain">
                <PermissionButton
                  action="edit"
                  section="Support"
                  subsection="Domain"
                  onClick={() => console.log('Configure domain')}
                >
                  Configure Domain
                </PermissionButton>
              </PermissionGate>
            </div>
          </PermissionGate>
        </div>

        {/* Ticket Subsection */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Ticket System</h3>
          <PermissionGate action="view" section="Support" subsection="Ticket">
            <div>
              <p>Support ticket management...</p>
              
              <PermissionGate action="edit" section="Support" subsection="Ticket">
                <PermissionButton
                  action="edit"
                  section="Support"
                  subsection="Ticket"
                  onClick={() => console.log('Manage tickets')}
                >
                  Manage Tickets
                </PermissionButton>
              </PermissionGate>
            </div>
          </PermissionGate>
        </div>
      </div>

      {/* Permission Status Dashboard */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h2>Permission Status Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Client List Permissions */}
          <div>
            <h4>Client List</h4>
            <PermissionStatus section="Client List" />
          </div>
          
          {/* Developer Permissions */}
          <div>
            <h4>Developer</h4>
            <PermissionStatus section="Developer" subsection="Dev Admin" />
            <PermissionStatus section="Developer" subsection="Theme Developer" />
            <PermissionStatus section="Developer" subsection="Support Developer" />
          </div>
          
          {/* Support Permissions */}
          <div>
            <h4>Support</h4>
            <PermissionStatus section="Support" subsection="Domain" />
            <PermissionStatus section="Support" subsection="Ticket" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Permission Status Component
 * Shows the current permission status for a section/subsection
 */
const PermissionStatus: React.FC<{ section: string; subsection?: string }> = ({ section, subsection }) => {
  const { getPermissionDetails } = usePermissions();
  const permissions = getPermissionDetails(section, subsection);
  
  const title = subsection ? `${section} - ${subsection}` : section;
  
  return (
    <div style={{ 
      padding: '10px', 
      margin: '5px 0', 
      backgroundColor: 'white', 
      borderRadius: '4px',
      border: '1px solid #e5e7eb'
    }}>
      <strong>{title}</strong>
      <div style={{ fontSize: '12px', marginTop: '5px' }}>
        <div>View: {permissions.canView ? '✅' : '❌'}</div>
        <div>Edit: {permissions.canEdit ? '✅' : '❌'}</div>
        <div>Upload: {permissions.canUpload ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};
