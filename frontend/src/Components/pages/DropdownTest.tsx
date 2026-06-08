import React, { useState } from 'react';

const DropdownTest: React.FC = () => {
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({});

  // Test roles with unique IDs
  const testRoles = [
    { _id: 'role-1', name: 'super-admin' },
    { _id: 'role-2', name: 'support-admin' },
    { _id: 'role-3', name: 'developer-admin' }
  ];

  const testSections = ['User Management', 'Payment', 'Invoice'];

  // Handle dropdown toggle
  const toggleDropdown = (roleId: string, section: string) => {
    const dropdownKey = `${roleId}-${section}`;
    console.log("🔍 TEST - Toggling dropdown:", { roleId, section, dropdownKey });
    
    setOpenDropdowns(prev => {
      const newState = { ...prev };
      
      // Only toggle the specific dropdown that was clicked
      newState[dropdownKey] = !prev[dropdownKey];
      
      console.log("🔍 TEST - Dropdown state after toggle:", { 
        dropdownKey, 
        newValue: newState[dropdownKey],
        allDropdowns: newState 
      });
      
      return newState;
    });
  };

  // Check if dropdown is open
  const isDropdownOpen = (roleId: string, section: string) => {
    const dropdownKey = `${roleId}-${section}`;
    const isOpen = openDropdowns[dropdownKey] || false;
    console.log("🔍 TEST - Checking dropdown state:", { roleId, section, dropdownKey, isOpen });
    return isOpen;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '20px', color: '#374151' }}>Dropdown Test Component</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e5e7eb', borderRadius: '6px' }}>
        <h3>Current Dropdown State:</h3>
        <pre style={{ fontSize: '12px', color: '#6b7280' }}>
          {JSON.stringify(openDropdowns, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {testRoles.map((role) => (
          <div key={role._id} style={{ 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            padding: '16px',
            backgroundColor: '#ffffff'
          }}>
            <h3 style={{ marginBottom: '12px', color: '#374151' }}>Role: {role.name} (ID: {role._id})</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {testSections.map((section) => (
                <div key={section} style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px', 
                  overflow: 'hidden',
                  backgroundColor: '#ffffff'
                }}>
                  <div 
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      padding: '12px 16px', 
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#374151'
                    }}
                    onClick={() => {
                      console.log("🔍 TEST - Clicked dropdown for:", { 
                        roleId: role._id, 
                        roleName: role.name, 
                        section,
                        allRoles: testRoles.map(r => ({ id: r._id, name: r.name }))
                      });
                      toggleDropdown(role._id, section);
                    }}
                  >
                    <span>{section}</span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      transform: isDropdownOpen(role._id, section) ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>▼</span>
                  </div>
                  
                  {isDropdownOpen(role._id, section) && (
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {['view', 'edit', 'upload'].map((permission) => (
                          <button
                            key={permission}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            {permission}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
        <h3 style={{ color: '#92400e' }}>Test Instructions:</h3>
        <ol style={{ color: '#92400e', fontSize: '14px' }}>
          <li>Open browser console (F12)</li>
          <li>Click on different sections for different roles</li>
          <li>Check if only the clicked section opens</li>
          <li>Look for any console errors or unexpected behavior</li>
          <li>Share the console output with the developer</li>
        </ol>
      </div>
    </div>
  );
};

export default DropdownTest;
