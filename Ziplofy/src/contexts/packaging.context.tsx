import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Packaging interface
export interface Packaging {
  _id: string;
  storeId: string;
  packageName: string;
  packageType: 'box' | 'envelope' | 'soft_package';
  length: number;
  width: number;
  height: number;
  dimensionsUnit: 'cm' | 'in';
  weight: number;
  weightUnit: 'g' | 'kg' | 'oz' | 'lb';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Packaging context interface
interface PackagingContextType {
  packagings: Packaging[];
  defaultPackaging: Packaging | null;
  loading: boolean;
  error: string | null;
  fetchPackagingsByStoreId: (storeId: string) => Promise<void>;
  createPackaging: (packagingData: CreatePackagingData) => Promise<void>;
  updatePackaging: (id: string, packagingData: UpdatePackagingData) => Promise<void>;
  deletePackaging: (id: string) => Promise<void>;
  getDefaultPackaging: (storeId: string) => Promise<void>;
  clearPackagings: () => void;
}

// Create packaging data interface
export interface CreatePackagingData {
  storeId: string;
  packageName: string;
  packageType: 'box' | 'envelope' | 'soft_package';
  length: number;
  width: number;
  height: number;
  dimensionsUnit: 'cm' | 'in';
  weight: number;
  weightUnit: 'g' | 'kg' | 'oz' | 'lb';
  isDefault?: boolean;
}

// Update packaging data interface
export interface UpdatePackagingData {
  packageName?: string;
  packageType?: 'box' | 'envelope' | 'soft_package';
  length?: number;
  width?: number;
  height?: number;
  dimensionsUnit?: 'cm' | 'in';
  weight?: number;
  weightUnit?: 'g' | 'kg' | 'oz' | 'lb';
  isDefault?: boolean;
}

// API Response interfaces
export interface GetPackagingsByStoreIdApiResponseType {
  success: boolean;
  data: Packaging[];
  count: number;
}

export interface CreatePackagingApiResponseType {
  success: boolean;
  data: Packaging;
  message: string;
}

export interface UpdatePackagingApiResponseType {
  success: boolean;
  data: Packaging;
  message: string;
}

export interface DeletePackagingApiResponseType {
  success: boolean;
  data: {
    deletedId: string;
    deletedPackaging: Packaging;
  };
  message: string;
}

export interface GetDefaultPackagingApiResponseType {
  success: boolean;
  data: Packaging | null;
}

// Create context
const PackagingContext = createContext<PackagingContextType | undefined>(undefined);

// Packaging provider component
export const PackagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packagings, setPackagings] = useState<Packaging[]>([]);
  const [defaultPackaging, setDefaultPackaging] = useState<Packaging | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch packagings by store ID
  const fetchPackagingsByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.get<GetPackagingsByStoreIdApiResponseType>(`/packaging/store/${storeId}`);
      const { success, data } = response.data;
      
      if (success) {
        setPackagings(data);
      } else {
        setError('Failed to fetch packagings');
      }
    } catch (err: any) {
      console.error('Error fetching packagings:', err);
      setError(err.response?.data?.message || 'Failed to fetch packagings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new packaging
  const createPackaging = useCallback(async (packagingData: CreatePackagingData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.post<CreatePackagingApiResponseType>('/packaging/', packagingData);
      const { success, data } = response.data;
      
      if (success) {
        const newPackaging = data;
        // Add the new packaging to the existing packagings array
        setPackagings(prevPackagings => [newPackaging, ...prevPackagings]);
        
        // If this is set as default, update the default packaging
        if (newPackaging.isDefault) {
          setDefaultPackaging(newPackaging);
          // Remove default flag from other packagings
          setPackagings(prev => 
            prev.map(p => p._id !== newPackaging._id ? { ...p, isDefault: false } : p)
          );
        }
      } else {
        setError('Failed to create packaging');
      }
    } catch (err: any) {
      console.error('Error creating packaging:', err);
      setError(err.response?.data?.message || 'Failed to create packaging');
      throw err; // Re-throw to allow component to handle
    } finally {
      setLoading(false);
    }
  }, []);

  // Update packaging
  const updatePackaging = useCallback(async (id: string, packagingData: UpdatePackagingData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.put<UpdatePackagingApiResponseType>(`/packaging/${id}`, packagingData);
      const { success, data } = response.data;
      
      if (success) {
        const updatedPackaging = data;
        // Update the packaging in the array
        setPackagings(prevPackagings => 
          prevPackagings.map(p => p._id === id ? updatedPackaging : p)
        );
        
        // If this is set as default, update the default packaging
        if (updatedPackaging.isDefault) {
          setDefaultPackaging(updatedPackaging);
          // Remove default flag from other packagings
          setPackagings(prev => 
            prev.map(p => p._id !== id ? { ...p, isDefault: false } : p)
          );
        } else if (defaultPackaging?._id === id) {
          // If the current default packaging is being updated to not be default
          setDefaultPackaging(null);
        }
      } else {
        setError('Failed to update packaging');
      }
    } catch (err: any) {
      console.error('Error updating packaging:', err);
      setError(err.response?.data?.message || 'Failed to update packaging');
      throw err; // Re-throw to allow component to handle
    } finally {
      setLoading(false);
    }
  }, [defaultPackaging]);

  // Delete packaging
  const deletePackaging = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.delete<DeletePackagingApiResponseType>(`/packaging/${id}`);
      const { success, data } = response.data;
      
      if (success) {
        const deletedPackaging = data.deletedPackaging;
        // Remove the packaging from the array
        setPackagings(prevPackagings => 
          prevPackagings.filter(p => p._id !== id)
        );
        
        // If the deleted packaging was the default, clear default
        if (defaultPackaging?._id === id) {
          setDefaultPackaging(null);
        }
      } else {
        setError('Failed to delete packaging');
      }
    } catch (err: any) {
      console.error('Error deleting packaging:', err);
      setError(err.response?.data?.message || 'Failed to delete packaging');
      throw err; // Re-throw to allow component to handle
    } finally {
      setLoading(false);
    }
  }, [defaultPackaging]);

  // Get default packaging for a store
  const getDefaultPackaging = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.get<GetDefaultPackagingApiResponseType>(`/packaging/store/${storeId}/default`);
      const { success, data } = response.data;
      
      if (success) {
        setDefaultPackaging(data);
      } else {
        setError('Failed to fetch default packaging');
      }
    } catch (err: any) {
      console.error('Error fetching default packaging:', err);
      setError(err.response?.data?.message || 'Failed to fetch default packaging');
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear packagings data
  const clearPackagings = useCallback(() => {
    setPackagings([]);
    setDefaultPackaging(null);
    setError(null);
    setLoading(false);
  }, []);

  const value: PackagingContextType = {
    packagings,
    defaultPackaging,
    loading,
    error,
    fetchPackagingsByStoreId,
    createPackaging,
    updatePackaging,
    deletePackaging,
    getDefaultPackaging,
    clearPackagings,
  };

  return (
    <PackagingContext.Provider value={value}>
      {children}
    </PackagingContext.Provider>
  );
};

// Custom hook to use packaging context
export const usePackaging = (): PackagingContextType => {
  const context = useContext(PackagingContext);
  if (context === undefined) {
    throw new Error('usePackaging must be used within a PackagingProvider');
  }
  return context;
};

export default PackagingContext;
