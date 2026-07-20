import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import axiosi from '../config/axios';

export interface AssignedDeveloperData {
  _id: string;
  adminId: string | null;
  supportDeveloperId: {
    _id: string;
    username: string;
    email: string;
  }
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  completedAt: string | null;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AssignDeveloperApiResponseType {
  success: boolean;
  data: AssignedDeveloperData;
  message: string;
}

interface AssignDeveloperParams {
  supportDeveloperId: string;
  userId: string;
}

interface AssignedDevelopersContextType {
  assignedDevelopers: AssignedDeveloperData[];
  assignDeveloper: (params: AssignDeveloperParams) => Promise<void>;
}

// Create context with type
const AssignedDevelopersContext = createContext<AssignedDevelopersContextType | undefined>(undefined);

// Provider component
export const AssignedDevelopersProvider = ({ children }: { children: ReactNode }) => {
  const [assignedDevelopers, setAssignedDevelopers] = useState<AssignedDeveloperData[]>([]);

  const assignDeveloper = useCallback(
    async (payload: AssignDeveloperParams): Promise<void> => {
      try {
        const {data} = await axiosi.post<AssignDeveloperApiResponseType>(
          '/assigned-support-developer',
          payload);

        setAssignedDevelopers(prev => [data.data, ...prev]);
        toast.success('Developer assigned successfully!');
      } catch (error: any) {
        toast.error("Failed to assign developer!");
        console.error('Failed to assign developer:', error);
      }
    },
    []
  );
  
  const value: AssignedDevelopersContextType = {
    assignedDevelopers,
    assignDeveloper,
  };

  return (
    <AssignedDevelopersContext.Provider value={value}>
      {children}
    </AssignedDevelopersContext.Provider>
  );
};

// Custom hook to use assigned developers context
export const useAssignedDevelopers = (): AssignedDevelopersContextType => {
  const context = useContext(AssignedDevelopersContext);
  if (!context) {
    throw new Error('useAssignedDevelopers must be used within an AssignedDevelopersProvider');
  }
  return context;
};