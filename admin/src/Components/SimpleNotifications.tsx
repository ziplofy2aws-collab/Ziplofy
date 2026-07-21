import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useNotifications } from '../contexts/NotificationsContext';

interface Notification {
  id?: string | number;
  type?: string;
  title?: string;
  message?: string;
  timestamp?: string | number;
  data?: Record<string, any>;
}

const SimpleNotifications: React.FC = () => {
  const { notifications, addNotification, fetchNotifications } = useNotifications();

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Add a test notification
  const handleAddTest = () => {
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification from context',
      timestamp: new Date().toISOString(),
      data: { source: 'test' },
    });
  };

  // Format timestamp
  const formatTime = (timestamp?: string | number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get icon based on type
  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'hireDeveloper':
        return '👨‍💻';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '20px auto',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faBell} style={{ marginRight: '8px' }} />
          <span>Notifications ({notifications.length})</span>
        </div>
        <button
          onClick={handleAddTest}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Test
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666',
            }}
          >
            <FontAwesomeIcon icon={faBell} style={{ fontSize: '32px', opacity: 0.5 }} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ marginRight: '8px' }}>{getIcon(notification.type)}</span>
                <span style={{ fontWeight: '600', color: '#333' }}>{notification.title}</span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginLeft: 'auto',
                  }}
                >
                  {formatTime(notification.timestamp)}
                </span>
              </div>
              <div style={{ color: '#555', fontSize: '14px' }}>{notification.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimpleNotifications;
