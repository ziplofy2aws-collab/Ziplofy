import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { SuperAdminNotification, useNotifications } from './notification.context';

interface HireDeveloperData {
  message:string
  notification:SuperAdminNotification
}

interface SocketContextType {
  socket: Socket | null;
  getSocket: () => Socket | null;
}

// Enum for socket event types
export enum SocketEventType {
  Connect = 'connect',
  Disconnect = 'disconnect',
  HireDeveloper = 'hireDeveloper',
  Welcome = 'welcome',
}

interface WelcomeEventResponseType {
  message:string
}

// Create context with type
const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { setNotifications } = useNotifications();

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('admin_token');
    // Do not connect sockets if not authenticated
    if (!baseUrl || !token) {
      setSocket(null);
      return;
    }

    const socketInstance = io(baseUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      extraHeaders: { token },
    });

    // Connection event handlers
    socketInstance.on(SocketEventType.Connect, () => {
      toast.success('Socket connected!');
    });

    socketInstance.on(SocketEventType.Disconnect, () => {
      toast.error('Socket disconnected!');
    });

    socketInstance.on(SocketEventType.Welcome, (data: WelcomeEventResponseType) => {
      toast.success(data.message);
    });

    // Listen for hireDeveloper events
    socketInstance.on(SocketEventType.HireDeveloper, (data: HireDeveloperData) => {
      const {message, notification} = data;
      toast.success(message);
      setNotifications(prev => [notification, ...prev]);
    });

    setSocket(socketInstance);

    // Cleanup on unmount: remove event listeners and close socket
    return () => {
      socketInstance.off(SocketEventType.Connect);
      socketInstance.off(SocketEventType.Disconnect);
      socketInstance.off(SocketEventType.HireDeveloper);
      socketInstance.close();
    };
  }, []);

  // Function to get socket instance directly
  const getSocket = (): Socket | null => {
    return socket;
  };

  const value: SocketContextType = {
    socket,
    getSocket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};