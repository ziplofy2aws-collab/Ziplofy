import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import axiosi from '../config/axios';
import toast from 'react-hot-toast';

export interface SupportDeveloper {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface GetSupportDevelopersApiResponseType {
  success: boolean;
  supportDevelopers: SupportDeveloper[];
  count: number;
}

export interface AddNewSupportDeveloperPayloadType {
  username: string;
  email: string;
}

export interface AddNewSupportDeveloperApiResponseType {
  message: string;
  supportDeveloper: SupportDeveloper;
}

interface SupportDevelopersContextType {
  supportDevelopers: SupportDeveloper[];
  setSupportDevelopers: React.Dispatch<React.SetStateAction<SupportDeveloper[]>>;
  fetchSupportDevelopers: () => Promise<void>;
  addSupportDeveloper: (developerData: AddNewSupportDeveloperPayloadType) => Promise<void>;
}

// Create context with type
const SupportDevelopersContext = createContext<SupportDevelopersContextType | undefined>(undefined);

export const SupportDevelopersProvider = ({ children }: { children: ReactNode }) => {

  const [supportDevelopers, setSupportDevelopers] = useState<SupportDeveloper[]>([]);

  // Fetch all support developers
  const fetchSupportDevelopers = useCallback(async (): Promise<void> => {
    const response = await axiosi.get<GetSupportDevelopersApiResponseType>('/support-developer');
    setSupportDevelopers(response.data.supportDevelopers || []);
  }, []);

  // Add a new support developer
  const addSupportDeveloper = useCallback(async (developerData: AddNewSupportDeveloperPayloadType) => {
    try {
      const { data } = await axiosi.post<AddNewSupportDeveloperApiResponseType>('/support-developer',developerData)
      setSupportDevelopers(prev => [...prev, data.supportDeveloper]);
      toast.success('Support developer added successfully!');
    } catch (err: any) {
      console.error('Failed to add support developer:', err);
      toast.error('Failed to add support developer!');
    }
  },
    [setSupportDevelopers]
  );

  const value: SupportDevelopersContextType = {
    supportDevelopers,
    setSupportDevelopers,
    fetchSupportDevelopers,
    addSupportDeveloper,
  };

  return (
    <SupportDevelopersContext.Provider value={value}>
      {children}
    </SupportDevelopersContext.Provider>
  );
};

export const useSupportDevelopers = (): SupportDevelopersContextType => {
  const context = useContext(SupportDevelopersContext);
  if (!context) {
    throw new Error('useSupportDevelopers must be used within a SupportDevelopersProvider');
  }
  return context;
};