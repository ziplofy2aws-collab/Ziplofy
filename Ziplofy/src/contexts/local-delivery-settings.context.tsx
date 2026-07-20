import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { axiosi } from '../config/axios.config';

export interface LocalDeliverySettings {
  _id: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateLocalDeliverySettingsPayload {
  storeId: string;
}

interface LocalDeliverySettingsContextType {
  settings: LocalDeliverySettings | null;
  loading: boolean;
  error: string | null;
  fetchLocalDeliverySettingsByStoreId: (storeId: string) => Promise<LocalDeliverySettings | null>;
  createLocalDeliverySettings: (payload: CreateLocalDeliverySettingsPayload) => Promise<LocalDeliverySettings>;
  clearState: () => void;
}

const LocalDeliverySettingsContext = createContext<LocalDeliverySettingsContextType | undefined>(undefined);

export const LocalDeliverySettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<LocalDeliverySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocalDeliverySettingsByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.get<{ success: boolean; data: LocalDeliverySettings; message: string }>(
        `/local-delivery-settings/store/${storeId}`
      );
      setSettings(data.data);
      return data.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to fetch local delivery settings';
      setError(message);
      if (err?.response?.status === 404) {
        setSettings(null);
        return null;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createLocalDeliverySettings = useCallback(async (payload: CreateLocalDeliverySettingsPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.post<{ success: boolean; data: LocalDeliverySettings; message: string }>(
        '/local-delivery-settings',
        payload
      );
      setSettings(data.data);
      return data.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to create local delivery settings';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearState = useCallback(() => {
    setSettings(null);
    setError(null);
    setLoading(false);
  }, []);

  const value: LocalDeliverySettingsContextType = {
    settings,
    loading,
    error,
    fetchLocalDeliverySettingsByStoreId,
    createLocalDeliverySettings,
    clearState,
  };

  return (
    <LocalDeliverySettingsContext.Provider value={value}>
      {children}
    </LocalDeliverySettingsContext.Provider>
  );
};

export const useLocalDeliverySettings = (): LocalDeliverySettingsContextType => {
  const context = useContext(LocalDeliverySettingsContext);
  if (!context) {
    throw new Error('useLocalDeliverySettings must be used within a LocalDeliverySettingsProvider');
  }
  return context;
};

export default LocalDeliverySettingsContext;

