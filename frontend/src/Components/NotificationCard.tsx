import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faClock, faCode } from '@fortawesome/free-solid-svg-icons';
import './NotificationCard.css';

export interface User {
  _id?: string;
  name?: string;
  email?: string;
}

export interface NotificationData {
  userId?: User;
  requestedBy?: User;
  client?: string;
  timeSinceCreated?: string;
}

export interface Notification {
  _id?: string;
  type?: string;
  notificationType?: string;
  title?: string;
  message?: string;
  timestamp?: string | number;
  createdAt?: string | number;
  data?: NotificationData;
  userId?: User;
  timeSinceCreated?: string;
}

export interface NotificationCardProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onClick }) => {

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'hireDeveloper':
        return faCode;
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return faBell;
    }
  };

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case 'hireDeveloper':
        return '#3b82f6'; // Blue
      case 'success':
        return '#10b981'; // Green
      case 'error':
        return '#ef4444'; // Red
      case 'warning':
        return '#f59e0b'; // Yellow
      default:
        return '#6b7280'; // Gray
    }
  };

  const formatTime = (timestamp?: string | number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getUserName = () => {
    return (
      notification.userId?.name ||
      notification.data?.userId?.name ||
      notification.data?.requestedBy?.name ||
      'Unknown User'
    );
  };

  const getUserEmail = () => {
    return (
      notification.userId?.email ||
      notification.data?.userId?.email ||
      notification.data?.requestedBy?.email ||
      'Unknown Email'
    );
  };

  const getNotificationTitle = () => {
    const type = notification.type || notification.notificationType;
    switch (type) {
      case 'hireDeveloper':
        return 'Developer Hire Request';
      default:
        return notification.title || 'Notification';
    }
  };

  const getNotificationMessage = () => {
    const type = notification.type || notification.notificationType;
    switch (type) {
      case 'hireDeveloper':
        const userName = getUserName();
        const userEmail = getUserEmail();
        return `${userName} wants to hire a developer\nUser email: ${userEmail}`;
      default:
        return notification.message || '';
    }
  };

  const isHireDeveloper =
    notification.type === 'hireDeveloper' || notification.notificationType === 'hireDeveloper';

  return (
    <div
      className="notification-card"
      onClick={() => onClick && onClick(notification)}
      style={{ borderLeftColor: getNotificationColor(notification.type) }}
    >
      <div className="notification-card-header">
        <div className="notification-icon">
          {typeof getNotificationIcon(notification.type) === 'string' ? (
            <span className="emoji-icon">{getNotificationIcon(notification.type)}</span>
          ) : (
            <FontAwesomeIcon
              icon={getNotificationIcon(notification.type) as any}
              style={{ color: getNotificationColor(notification.type) }}
            />
          )}
        </div>
        <div className="notification-content">
          <h4 className="notification-title">{getNotificationTitle()}</h4>
          <p className={`notification-message ${isHireDeveloper ? 'hire-developer-message' : ''}`}>
            {getNotificationMessage()}
          </p>
        </div>
        <div className="notification-time">
          <FontAwesomeIcon icon={faClock} />
          <span>{formatTime(notification.timestamp || notification.createdAt)}</span>
        </div>
      </div>

      {isHireDeveloper && (
        <div className="notification-details">
          <div className="user-info">
            <FontAwesomeIcon icon={faUser} />
            <span>{getUserName()}</span>
          </div>
          {(notification.timeSinceCreated || notification.data?.timeSinceCreated) && (
            <div className="time-since">
              <span>{notification.timeSinceCreated || notification.data.timeSinceCreated}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
