import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  clearAllNotifications,
  addNotification,
  removeNotification 
} from '../store/slices/notificationsSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import './Notifications.css';

interface NotificationData {
  [key: string]: any;
}

export interface Notification {
  id: string;
  type?: string;
  title?: string;
  message?: string;
  timestamp?: string | number;
  isRead?: boolean;
  data?: NotificationData;
}

const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, loading, error, unreadCount } = useAppSelector(state => state.notifications);

  // Fetch notifications on mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleRemoveNotification = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
    toast.success('Notification removed');
  };

  const handleClearAll = async () => {
    try {
      await dispatch(clearAllNotifications()).unwrap();
      toast.success('All notifications cleared');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleAddTestNotification = () => {
    const testNotification: Notification = {
      id: Date.now().toString(),
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification from Redux',
      timestamp: new Date().toISOString(),
      isRead: false,
      data: { source: 'test' },
    };

    dispatch(addNotification(testNotification));
    toast.success('Test notification added');
  };

  const formatTimestamp = (timestamp?: string | number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const getNotificationIcon = (type?: string) => {
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

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <FontAwesomeIcon icon={faBell} />
          <span>Notifications</span>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </div>
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <FontAwesomeIcon icon={faBell} />
          <span>Notifications</span>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <FontAwesomeIcon icon={faBell} />
        <span>Notifications</span>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        <div className="header-actions">
          <button onClick={handleAddTestNotification} className="btn-test" title="Add Test Notification">
            Test
          </button>
          {notifications.length > 0 && (
            <button onClick={handleClearAll} className="btn-clear" title="Clear All">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <FontAwesomeIcon icon={faBell} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`}>
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-icon">{getNotificationIcon(notification.type)}</span>
                  <span className="notification-title">{notification.title}</span>
                  <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
                </div>
                <div className="notification-message">{notification.message}</div>
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <div className="notification-data">
                    <pre>{JSON.stringify(notification.data, null, 2)}</pre>
                  </div>
                )}
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="btn-mark-read"
                    title="Mark as Read"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                )}
                <button
                  onClick={() => handleRemoveNotification(notification.id)}
                  className="btn-remove"
                  title="Remove"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
