import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import axiosi from '../config/axios';

export interface SuperAdminNotification {
  _id: string;
  notificationType: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  timeSinceCreated?: string;
  id: string;
}

export interface GetSuperAdminNotificationsApiResponseType {
  notifications: SuperAdminNotification[];
}

interface NotificationsContextType {
  notifications: SuperAdminNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<SuperAdminNotification[]>>;
  fetchNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Provider component
export const NotificationsProvider = ({ children }:{ children: ReactNode }) => {

  const [notifications, setNotifications] = useState<SuperAdminNotification[]>([]);

  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      const {data} = await axiosi.get<GetSuperAdminNotificationsApiResponseType>('/super-admin/notifications');
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const value: NotificationsContextType = {
    setNotifications,
    notifications,
    fetchNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};