import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Single type aligned with backend responses
export interface InventoryLevel {
  _id: string;
  variantId: {
    _id: string;
    sku: string;
    optionValues: Record<string, string>;
    images?: string[];
    productId: {
      _id: string;
      title: string;
      imageUrls?: string[];
    };
  };
  locationId: string; // not populated by controller (id only)
  onHand: number;
  committed: number;
  incoming: number;
  unavailable: {
    damaged: number;
    qualityControl: number;
    safetyStock: number;
    other: number;
  };
  available: number;
  createdAt: string;
  updatedAt: string;
}

// API response types
interface InventoryLevelsApiResponse {
  success: boolean;
  data: InventoryLevel[];
  count: number;
  message?: string;
}

interface UpdateInventoryLevelApiResponse {
  success: boolean;
  data: InventoryLevel;
  message?: string;
}

type UpdateInventoryLevelPayload = Partial<{
  onHand: number;
  available: number;
  unavailable: {
    damaged: number;
    qualityControl: number;
    safetyStock: number;
    other: number;
  };
}>;

interface InventoryLevelsContextType {
  inventoryLevels: InventoryLevel[];
  loading: boolean;
  error: string | null;
  fetchByLocation: (locationId: string) => Promise<void>;
  updateById: (id: string, payload: UpdateInventoryLevelPayload) => Promise<void>;
  clear: () => void;
  clearError: () => void;
}

const InventoryLevelsContext = createContext<InventoryLevelsContextType | undefined>(undefined);

export const useInventoryLevels = (): InventoryLevelsContextType => {
  const ctx = useContext(InventoryLevelsContext);
  if (!ctx) throw new Error('useInventoryLevels must be used within InventoryLevelsProvider');
  return ctx;
};

interface ProviderProps { children: ReactNode }

export const InventoryLevelsProvider: React.FC<ProviderProps> = ({ children }) => {
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByLocation = useCallback(async (locationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.get<InventoryLevelsApiResponse>(`/inventory-levels/location/${locationId}`);
      if (data?.success) {
        setInventoryLevels(data.data as InventoryLevel[]);
      } else {
        throw new Error(data?.message || 'Failed to fetch inventory levels');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch inventory levels';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateById = useCallback(async (id: string, payload: UpdateInventoryLevelPayload) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.put<UpdateInventoryLevelApiResponse>(`/inventory-levels/${id}`, payload);
      if (data?.success) {
        const updated: InventoryLevel = data.data;
        setInventoryLevels(prev => prev.map(l => (l._id === updated._id ? updated : l)));
      } else {
        throw new Error(data?.message || 'Failed to update inventory level');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update inventory level';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = () => setInventoryLevels([]);
  const clearError = () => setError(null);

  const value: InventoryLevelsContextType = {
    inventoryLevels,
    loading,
    error,
    fetchByLocation,
    updateById,
    clear,
    clearError,
  };

  return (
    <InventoryLevelsContext.Provider value={value}>
      {children}
    </InventoryLevelsContext.Provider>
  );
};

export default InventoryLevelsContext;


