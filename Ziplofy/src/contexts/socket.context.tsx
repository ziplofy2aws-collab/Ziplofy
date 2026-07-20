import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { frontendEnv } from "../config/env";
import { SocketEventType } from "../types/event.types";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  getSocket: () => Socket | null;
}

interface AssignedSupportDeveloperEventData {
  message: string;
  developerName: string;
  developerEmail: string;
  developerId: string;
}


const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({children}: {children: ReactNode}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if(!token) return;

    const newSocket: Socket = io(frontendEnv.socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      extraHeaders: {token}
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on(SocketEventType.HireDeveloper, (data: any) => {
      toast.success(data.message);
    });

    newSocket.on(SocketEventType.DeveloperAssigned, (data: AssignedSupportDeveloperEventData) => {
      toast.success(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);


  const getSocket = (): Socket | null => {
    return socket;
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    getSocket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
