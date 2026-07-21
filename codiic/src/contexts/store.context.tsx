import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { toast } from 'react-hot-toast';
import { axiosi } from '../config/axios.config';

// Store interface
export interface Store {
  _id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  appliedTheme?: string | null;
  /** StoreCustomTheme document id when the JSON theme creator theme is live. */
  appliedCustomThemeId?: string | null;
  defaultLocation: string | null;
  createdAt: string;
  updatedAt: string;
}

// Store context interface
interface StoreContextType {
  stores: Store[];
  activeStoreId: string | null;
  loading: boolean;
  error: string | null;
  fetchStores: () => Promise<void>;
  createStore: (storeData: CreateStoreData) => Promise<void>;
  updateStore: (
    storeId: string,
    payload: Partial<
      Pick<Store, 'storeName' | 'storeDescription' | 'defaultLocation' | 'appliedCustomThemeId'>
    >
  ) => Promise<Store>;
  applyStoreCustomTheme: (storeId: string, customThemeId: string) => Promise<Store>;
  setActiveStoreId: (storeId: string | null) => void;
  clearStores: () => void;
  setStores: Dispatch<SetStateAction<Store[]>>;
}

// Create store data interface
export interface CreateStoreData {
  storeName: string;
  storeDescription: string;
}


export interface GetStoresViaUserIdApiResponseType {
  success: boolean;
  data: Store[];
  count: number;
}

// Create store API response interface
export interface CreateStoreApiResponseType {
  success: boolean;
  data: Store;
  message: string;
}

export interface UpdateStoreApiResponseType {
  success: boolean;
  data: Store;
  message: string;
}

// Create context
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Store provider component
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stores for authenticated user
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.get<GetStoresViaUserIdApiResponseType>('/stores/my-stores');
      const { success, data } = response.data;
      
      if (success) {
        if (Array.isArray(data)) {
          setStores(data);
          // Set the first store as active if stores exist
          if (data.length > 0) {
            setActiveStoreId(data[0]._id);
          } else {
            setActiveStoreId(null);
          }
        } else {
          setStores([data]);
          // @ts-ignore
          setActiveStoreId(data._id);
        }
      } else {
        setError('Failed to fetch stores');
      }
    } catch (err: any) {
      console.error('Error fetching stores:', err);
      setError(err.response?.data?.message || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new store
  const createStore = useCallback(async (storeData: CreateStoreData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.post<CreateStoreApiResponseType>('/stores/', storeData);
      const { success, data } = response.data;
      
      if (success) {
        const newStore = data;
        // Add the new store to the existing stores array
        setStores(prevStores => [newStore, ...prevStores]);
        setActiveStoreId(newStore._id); // Set the created store as active
      } else {
        setError('Failed to create store');
      }
    } catch (err: any) {
      console.error('Error creating store:', err);
      setError(err.response?.data?.message || 'Failed to create store');
      throw err; // Re-throw to allow component to handle
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a store
  const updateStore = useCallback(async (
    storeId: string,
    payload: Partial<
      Pick<Store, 'storeName' | 'storeDescription' | 'defaultLocation' | 'appliedCustomThemeId'>
    >
  ): Promise<Store> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.put<UpdateStoreApiResponseType>(`/stores/${storeId}`, payload);
      const { success, data } = response.data;
      if (!success) {
        throw new Error('Failed to update store');
      }
      setStores(prev => prev.map(s => (s._id === storeId ? data : s)));
      return data;
    } catch (err: any) {
      console.error('Error updating store:', err);
      setError(err.response?.data?.message || 'Failed to update store');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyStoreCustomTheme = useCallback(
    async (storeId: string, customThemeId: string): Promise<Store> => {
      const updated = await updateStore(storeId, { appliedCustomThemeId: customThemeId });
      toast.success('Custom theme applied to your live storefront');
      return updated;
    },
    [updateStore]
  );

  // Clear stores data
  const clearStores = useCallback(() => {
    setStores([]);
    setActiveStoreId(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Persist activeStoreId to localStorage when it changes
  useEffect(() => {
    if (activeStoreId) {
      try {
        localStorage.setItem('activeStoreId', activeStoreId);
        sessionStorage.setItem('activeStoreId', activeStoreId);
        // Also set as storeId for backward compatibility
        localStorage.setItem('storeId', activeStoreId);
        sessionStorage.setItem('storeId', activeStoreId);
      } catch (err) {
        console.warn('Failed to persist activeStoreId:', err);
      }
    }
  }, [activeStoreId]);

  // Load activeStoreId from localStorage on mount if not set
  useEffect(() => {
    if (!activeStoreId) {
      try {
        const stored = localStorage.getItem('activeStoreId') || sessionStorage.getItem('activeStoreId');
        if (stored) {
          // Verify store exists in stores array before setting
          const storeExists = stores.some(s => s._id === stored);
          if (storeExists) {
            setActiveStoreId(stored);
          }
        }
      } catch (err) {
        console.warn('Failed to load activeStoreId from storage:', err);
      }
    }
  }, []); // Only run on mount

  // Notify when active store changes
  useEffect(() => {
    if (!activeStoreId) return;
    const activeStore = stores.find(s => s._id === activeStoreId);
    if (activeStore) {
      toast.dismiss();
      toast.success(`Switched to ${activeStore.storeName}`);
    }
  }, [activeStoreId, stores]);

  const value: StoreContextType = {
    stores,
    activeStoreId,
    loading,
    error,
    fetchStores,
    createStore,
    updateStore,
    applyStoreCustomTheme,
    setActiveStoreId,
    clearStores,
    setStores,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use store context
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export default StoreContext;