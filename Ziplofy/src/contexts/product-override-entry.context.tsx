import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Product Override Entry interface matching backend model
export interface ProductOverrideEntry {
  _id: string;
  productOverrideId: string | {
    _id: string;
    storeId: string | {
      _id: string;
      storeName: string;
    };
    countryId: string | {
      _id: string;
      name: string;
      iso2: string;
    };
    collectionId: string | {
      _id: string;
      title: string;
    };
  };
  stateId?: string | {
    _id: string;
    name: string;
    code: string;
  } | null;
  taxRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

interface CreateProductOverrideEntryPayload {
  productOverrideId: string;
  stateId?: string | null;
  taxRate: number;
  isActive?: boolean;
}

interface ProductOverrideEntryContextType {
  productOverrideEntries: ProductOverrideEntry[];
  loading: boolean;
  error: string | null;
  createProductOverrideEntry: (payload: CreateProductOverrideEntryPayload) => Promise<ProductOverrideEntry>;
  getProductOverrideEntriesByProductOverrideId: (productOverrideId: string) => Promise<ProductOverrideEntry[]>;
  deleteProductOverrideEntry: (id: string) => Promise<void>;
  clearProductOverrideEntries: () => void;
}

const ProductOverrideEntryContext = createContext<ProductOverrideEntryContextType | undefined>(undefined);

export const ProductOverrideEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productOverrideEntries, setProductOverrideEntries] = useState<ProductOverrideEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new product override entry
  const createProductOverrideEntry = useCallback(async (payload: CreateProductOverrideEntryPayload): Promise<ProductOverrideEntry> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<ProductOverrideEntry>>('/product-override-entries', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create product override entry');
      setProductOverrideEntries((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to create product override entry';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get product override entries by product override ID
  const getProductOverrideEntriesByProductOverrideId = useCallback(async (
    productOverrideId: string
  ): Promise<ProductOverrideEntry[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<ProductOverrideEntry[]>>(
        `/product-override-entries/product-override/${productOverrideId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch product override entries');
      setProductOverrideEntries(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to fetch product override entries';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a product override entry
  const deleteProductOverrideEntry = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{}>>(`/product-override-entries/${id}`);
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete product override entry');
      setProductOverrideEntries((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to delete product override entry';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear product override entries
  const clearProductOverrideEntries = useCallback(() => {
    setProductOverrideEntries([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: ProductOverrideEntryContextType = {
    productOverrideEntries,
    loading,
    error,
    createProductOverrideEntry,
    getProductOverrideEntriesByProductOverrideId,
    deleteProductOverrideEntry,
    clearProductOverrideEntries,
  };

  return <ProductOverrideEntryContext.Provider value={value}>{children}</ProductOverrideEntryContext.Provider>;
};

export const useProductOverrideEntries = (): ProductOverrideEntryContextType => {
  const ctx = useContext(ProductOverrideEntryContext);
  if (!ctx) throw new Error('useProductOverrideEntries must be used within a ProductOverrideEntryProvider');
  return ctx;
};

export default ProductOverrideEntryContext;

