import { faCheck, faSearch, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useAssignedDevelopers } from '../contexts/assign-developer.context';
import { useNotifications } from '../contexts/notification.context';
import './AssignDeveloperModal.css';

interface Developer {
  _id: string;
  username: string;
  email: string;
}

interface NotificationData {
  userId?: {
    _id: string;
    name?: string;
    email?: string;
  };
  requestedBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  client?: string;
}

interface Notification {
  _id: string;
  type?: string;
  notificationType?: string;
  userId?: NotificationData['userId'];
  data?: NotificationData;
}

interface AssignDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer?: Developer | null;
}

interface UserItem {
  id: string | null;
  name: string;
  email: string;
  request: Notification;
}

const AssignDeveloperModal: React.FC<AssignDeveloperModalProps> = ({ isOpen, onClose, developer }) => {
  const { notifications, fetchNotifications } = useNotifications();
  const { assignDeveloper } = useAssignedDevelopers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [hireRequests, setHireRequests] = useState<Notification[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch notifications when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Filter hire developer requests
  useEffect(() => {
    const filtered = notifications.filter(
      (notification) =>
        notification.notificationType === 'hireDeveloper' || notification.notificationType === 'hireDeveloper'
    );
    setHireRequests(filtered);
  }, [notifications]);

  // Helper functions to extract user info
  const getUserName = (notification: Notification) => {
    return (
      notification.userId?.name ||
      notification.data?.userId?.name ||
      notification.data?.requestedBy?.name ||
      notification.data?.client ||
      'Unknown User'
    );
  };

  const getUserEmail = (notification: Notification) => {
    return (
      notification.userId?.email ||
      notification.data?.userId?.email ||
      notification.data?.requestedBy?.email ||
      'Unknown Email'
    );
  };

  const getUserId = (notification: Notification) => {
    return (
      notification.userId?._id ||
      notification.data?.userId?._id ||
      notification.data?.requestedBy?._id ||
      null
    );
  };

  const handleUserSelect = (user: UserItem) => {
    setSelectedUser(user);
  };

  const handleAssign = async () => {
    if (!selectedUser || !developer) return;
    setIsAssigning(true);
    
    try {
      await assignDeveloper({
        supportDeveloperId: developer._id,
        userId: selectedUser.id || '',
      });
      
      // Close modal after successful assignment
      handleClose();
    } catch (error) {
      console.error('Failed to assign developer:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedUser(null);
    setSearchTerm('');
  };

  const filteredUsers: UserItem[] = hireRequests
    .map((request) => ({
      id: getUserId(request),
      name: getUserName(request),
      email: getUserEmail(request),
      request,
    }))
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="assign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Developer</h2>
          <button className="close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body">
          <div className="developer-info">
            <h3>Assigning: {developer?.username}</h3>
            <p>{developer?.email}</p>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="users-list">
            <h4>Users with Developer Requests ({filteredUsers.length})</h4>
            <div className="users-container">
              {filteredUsers.length === 0 ? (
                <div className="no-users">
                  <FontAwesomeIcon icon={faUser} />
                  <p>No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id || user.request._id}
                    className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-avatar">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="user-details">
                      <h5>{user.name}</h5>
                      <p>{user.email}</p>
                    </div>
                    {selectedUser?.id === user.id && (
                      <div className="selected-indicator">
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            className={`btn btn-primary ${selectedUser ? 'btn-success' : 'btn-disabled'}`}
            onClick={handleAssign}
            disabled={!selectedUser || isAssigning}
          >
            {isAssigning ? 'Assigning...' : 'Assign Developer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDeveloperModal;
