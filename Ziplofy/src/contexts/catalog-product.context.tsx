import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface CatalogProductVariant {
  _id: string;
  sku: string;
  imageUrl: string | null;
  optionValues: Record<string, string>;
  price?: number | null;
  compareAtPrice?: number | null;
}

export interface CatalogProduct {
  _id: string;
  catalogId: string;
  productId: string;
  isManuallyAdded: boolean;
  createdAt: string;
  updatedAt: string;
  product: { _id: string; title: string; imageUrl: string | null; price?: number | null; compareAtPrice?: number | null } | null;
  variants: CatalogProductVariant[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateCatalogProductPayload {
  catalogId: string;
  productId: string;
  isManuallyAdded?: boolean;
}

interface CatalogProductContextType {
  items: CatalogProduct[];
  loading: boolean;
  error: string | null;
  getByCatalogId: (catalogId: string) => Promise<CatalogProduct[]>;
  createItem: (payload: CreateCatalogProductPayload) => Promise<CatalogProduct>;
  deleteItem: (id: string) => Promise<string>;
  updateVariantPrices: (cpvId: string, variantId: string, payload: { price?: number | null; compareAtPrice?: number | null }) => Promise<{ price: number | null; compareAtPrice: number | null }>;
}

const CatalogProductContext = createContext<CatalogProductContextType | undefined>(undefined);

export const CatalogProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByCatalogId = useCallback(async (catalogId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<CatalogProduct[]>>(`/catalog-products/catalog/${catalogId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch catalog products');
      setItems(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch catalog products';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (payload: CreateCatalogProductPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<CatalogProduct>>('/catalog-products', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to add product to catalog');
      setItems(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add product to catalog';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<{ deletedId: string }>>(`/catalog-products/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete catalog product');
      setItems(prev => prev.filter(i => i._id !== data.deletedId));
      return data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete catalog product';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVariantPrices = useCallback(async (cpvId: string, variantId: string, payload: { price?: number | null; compareAtPrice?: number | null }) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<{ price: number | null; compareAtPrice: number | null }>>(`/catalog-products/${cpvId}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update variant prices');
      // update local state
      setItems(prev => prev.map(cp => ({
        ...cp,
        variants: cp.variants.map(v => v._id === variantId ? { ...v, price: data.price, compareAtPrice: data.compareAtPrice } : v)
      })));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update variant prices';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: CatalogProductContextType = {
    items,
    loading,
    error,
    getByCatalogId,
    createItem,
    deleteItem,
    updateVariantPrices,
  };

  return (
    <CatalogProductContext.Provider value={value}>{children}</CatalogProductContext.Provider>
  );
};

export const useCatalogProducts = (): CatalogProductContextType => {
  const ctx = useContext(CatalogProductContext);
  if (!ctx) throw new Error('useCatalogProducts must be used within a CatalogProductProvider');
  return ctx;
};

export default CatalogProductContext;


