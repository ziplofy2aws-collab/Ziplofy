import React, { useEffect } from 'react';
import { useNotifications } from '../../contexts/notification.context';
import NotificationCard from '../NotificationCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faBell, faUser, faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons';
import { Users, Clock, Mail } from 'lucide-react';
import './DevRequests.css';
import './KpiCard.css';

// TypeScript interface for Notification
interface Notification {
  id?: string;
  _id?: string;
  type?: string;
  notificationType?: string;
  createdAt?: string;
  timestamp?: string;
  userId?: { email?: string };
  data?: {
    userId?: { email?: string };
    requestedBy?: { email?: string };
  };
  [key: string]: any; // for any other properties
}

const DevRequests: React.FC = () => {
  const { notifications, fetchNotifications } = useNotifications();

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter only hire developer notifications
  const devRequests: Notification[] = notifications.filter(
    (notification: Notification) =>
      notification.type === 'hireDeveloper' ||
      notification.notificationType === 'hireDeveloper'
  );

  const handleNotificationClick = (notification: Notification) => {
    console.log('Dev request clicked:', notification);
    // Add additional logic if needed
  };

  return (
    <div className="dev-requests-container">
      <div className="dev-requests-card">
        <div className="dev-requests-card-header">
          <div className="dev-requests-title-block">
            <div className="dev-requests-title-accent" />
            <div>
              <h1 className="dev-requests-title">Hire Developer Requests</h1>
              <p className="dev-requests-subtitle">Manage and view developer hire requests</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="header-stat-kpi">
              <span className="header-stat-value">{devRequests.length}</span>
              <span className="header-stat-label">Total Requests</span>
            </div>
          </div>
        </div>

        {/* Content */}
      <div className="dev-requests-content">
        {devRequests.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faCode} />
            <h3>No Developer Requests</h3>
            <p>There are currently no developer hire requests.</p>
            <p>New requests will appear here when clients request developer services.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {devRequests.map((request: Notification) => (
              <div key={request.id || request._id} className="request-card-wrapper">
                <NotificationCard
                  notification={request}
                  onClick={handleNotificationClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats - Analytics style */}
      {devRequests.length > 0 && (
        <div className="summary-stats kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card-header">
              <div className="kpi-content">
                <div className="kpi-label">Total Requests</div>
                <div className="kpi-value">{devRequests.length}</div>
              </div>
              <div className="kpi-icon-wrap primary">
                <Users size={24} strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-header">
              <div className="kpi-content">
                <div className="kpi-label">Last 24 Hours</div>
                <div className="kpi-value">
                  {devRequests.filter((req: Notification) => {
                    const createdAt = new Date(req.createdAt || req.timestamp || '');
                    const now = new Date();
                    const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
                    return diffInHours < 24;
                  }).length}
                </div>
              </div>
              <div className="kpi-icon-wrap warning">
                <Clock size={24} strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-header">
              <div className="kpi-content">
                <div className="kpi-label">Unique Clients</div>
                <div className="kpi-value">
                  {new Set(
                    devRequests.map((req: Notification) =>
                      req.userId?.email || req.data?.userId?.email || req.data?.requestedBy?.email
                    )
                  ).size}
                </div>
              </div>
              <div className="kpi-icon-wrap accent">
                <Mail size={24} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DevRequests;
