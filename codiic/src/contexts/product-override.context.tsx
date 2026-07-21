import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Product Override interface matching backend model
export interface ProductOverride {
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

interface CreateProductOverridePayload {
  storeId: string;
  countryId: string;
  collectionId: string;
}

interface UpdateProductOverridePayload {
  storeId?: string;
  countryId?: string;
  collectionId?: string;
}

interface ProductOverrideContextType {
  productOverrides: ProductOverride[];
  loading: boolean;
  error: string | null;
  createProductOverride: (payload: CreateProductOverridePayload) => Promise<ProductOverride>;
  getProductOverridesByStoreAndCountry: (storeId: string, countryId: string) => Promise<ProductOverride[]>;
  getProductOverrideById: (id: string) => Promise<ProductOverride>;
  updateProductOverride: (id: string, payload: UpdateProductOverridePayload) => Promise<ProductOverride>;
  deleteProductOverride: (id: string) => Promise<void>;
  clearProductOverrides: () => void;
}

const ProductOverrideContext = createContext<ProductOverrideContextType | undefined>(undefined);

export const ProductOverrideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productOverrides, setProductOverrides] = useState<ProductOverride[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new product override
  const createProductOverride = useCallback(async (payload: CreateProductOverridePayload): Promise<ProductOverride> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<ProductOverride>>('/product-overrides', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create product override');
      setProductOverrides((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create product override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get product overrides by store ID and country ID
  const getProductOverridesByStoreAndCountry = useCallback(async (
    storeId: string,
    countryId: string
  ): Promise<ProductOverride[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<ProductOverride[]>>(
        `/product-overrides/store/${storeId}/country/${countryId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch product overrides');
      setProductOverrides(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch product overrides';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get product override by ID
  const getProductOverrideById = useCallback(async (id: string): Promise<ProductOverride> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<ProductOverride>>(`/product-overrides/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch product override');
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch product override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a product override
  const updateProductOverride = useCallback(async (
    id: string,
    payload: UpdateProductOverridePayload
  ): Promise<ProductOverride> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<ProductOverride>>(`/product-overrides/${id}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update product override');
      setProductOverrides((prev) => prev.map((override) => (override._id === id ? data : override)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update product override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a product override
  const deleteProductOverride = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{}>>(`/product-overrides/${id}`);
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete product override');
      setProductOverrides((prev) => prev.filter((override) => override._id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete product override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear product overrides
  const clearProductOverrides = useCallback(() => {
    setProductOverrides([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: ProductOverrideContextType = {
    productOverrides,
    loading,
    error,
    createProductOverride,
    getProductOverridesByStoreAndCountry,
    getProductOverrideById,
    updateProductOverride,
    deleteProductOverride,
    clearProductOverrides,
  };

  return <ProductOverrideContext.Provider value={value}>{children}</ProductOverrideContext.Provider>;
};

export const useProductOverrides = (): ProductOverrideContextType => {
  const ctx = useContext(ProductOverrideContext);
  if (!ctx) throw new Error('useProductOverrides must be used within a ProductOverrideProvider');
  return ctx;
};

export default ProductOverrideContext;

