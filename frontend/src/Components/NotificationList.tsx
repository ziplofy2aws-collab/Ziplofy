import React from 'react';
import NotificationCard from './NotificationCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './NotificationList.css';
import { Notification } from './NotificationCard';
import { useNotifications } from '../contexts/notification.context';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
}) => {
  const { setNotifications } = useNotifications();
  const unreadCount = notifications.filter((n) => !(n as any).isRead).length;

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="notification-list-container">
      {/* Header */}
      <div className="notification-list-header">
        <div className="header-left">
          <FontAwesomeIcon icon={faBell} />
          <span>Notifications</span>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </div>
        {notifications.length > 0 && (
          <div className="header-actions">
            <button
              className="action-btn clear-btn"
              onClick={handleClearAll}
              aria-label="Clear all notifications"
              title="Clear all"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="notification-list-content">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faBell} />
            <p>No notifications yet</p>
            <span>You'll see notifications here when they arrive</span>
          </div>
        ) : (
          <div className="notifications-scroll">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification._id || notification.timestamp || Math.random()}
                notification={notification}
                onClick={onNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
