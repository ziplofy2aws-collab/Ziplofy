import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { axiosi } from '../config/axios.config';
import type { Location } from './location.context';

export interface LocalDeliveryLocationEntry {
  _id: string;
  localDeliveryId: string;
  locationId: Location | string;
  canLocalDeliver: boolean;
  deliveryZoneType: 'radius' | 'pin-codes';
  includeNeighboringStates: boolean;
  radiusUnit: 'km' | 'mi';
  currencyCode: string;
  currencySymbol?: string;
  createdAt: string;
  updatedAt: string;
}

interface LocalDeliveryLocationEntriesContextValue {
  entries: LocalDeliveryLocationEntry[];
  loading: boolean;
  error: string | null;
  fetchEntriesByLocalDeliveryId: (localDeliveryId: string) => Promise<LocalDeliveryLocationEntry[]>;
  clearEntries: () => void;
}

const LocalDeliveryLocationEntriesContext = createContext<LocalDeliveryLocationEntriesContextValue | undefined>(undefined);

export const LocalDeliveryLocationEntriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<LocalDeliveryLocationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntriesByLocalDeliveryId = useCallback(async (localDeliveryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.get<{ success: boolean; data: LocalDeliveryLocationEntry[]; message: string }>(
        `/local-delivery-location-entries/local-delivery/${localDeliveryId}`
      );
      setEntries(data.data);
      return data.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to fetch local delivery location entries';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
    setError(null);
    setLoading(false);
  }, []);

  const value = useMemo<LocalDeliveryLocationEntriesContextValue>(() => ({
    entries,
    loading,
    error,
    fetchEntriesByLocalDeliveryId,
    clearEntries,
  }), [entries, loading, error, fetchEntriesByLocalDeliveryId, clearEntries]);

  return (
    <LocalDeliveryLocationEntriesContext.Provider value={value}>
      {children}
    </LocalDeliveryLocationEntriesContext.Provider>
  );
};

export const useLocalDeliveryLocationEntries = (): LocalDeliveryLocationEntriesContextValue => {
  const context = useContext(LocalDeliveryLocationEntriesContext);
  if (!context) {
    throw new Error('useLocalDeliveryLocationEntries must be used within a LocalDeliveryLocationEntriesProvider');
  }
  return context;
};

export default LocalDeliveryLocationEntriesContext;

