import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface FinalSaleItemProductVariant {
  _id: string;
  productId?: {
    _id: string;
    title: string;
    imageUrls?: string[];
  } | null;
  sku?: string;
  optionValues?: Record<string, string>;
  images?: string[];
}

export interface FinalSaleItemCollection {
  _id: string;
  title: string;
  image?: string;
}

export interface FinalSaleItem {
  _id: string;
  returnRulesId: string;
  storeId: string;
  productVariantId?: string | FinalSaleItemProductVariant | null;
  collectionId?: string | FinalSaleItemCollection | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateFinalSaleItemPayload {
  returnRulesId: string;
  storeId: string;
  productVariantId?: string | null;
  collectionId?: string | null;
}

interface FinalSaleItemContextType {
  items: FinalSaleItem[];
  loading: boolean;
  error: string | null;
  getByReturnRulesId: (returnRulesId: string) => Promise<FinalSaleItem[]>;
  createItem: (payload: CreateFinalSaleItemPayload) => Promise<FinalSaleItem>;
  deleteItem: (id: string) => Promise<string>;
}

const FinalSaleItemContext = createContext<FinalSaleItemContextType | undefined>(undefined);

export const FinalSaleItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<FinalSaleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByReturnRulesId = useCallback(async (returnRulesId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<FinalSaleItem[]>>(`/final-sale-items/return-rules/${returnRulesId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch final sale items');
      setItems(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch final sale items';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (payload: CreateFinalSaleItemPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<FinalSaleItem>>('/final-sale-items', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create final sale item');
      setItems(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create final sale item';
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
      const res = await axiosi.delete<ApiResponse<{ deletedId: string }>>(`/final-sale-items/${id}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete final sale item');
      setItems(prev => prev.filter(i => i._id !== data.deletedId));
      return data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete final sale item';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: FinalSaleItemContextType = {
    items,
    loading,
    error,
    getByReturnRulesId,
    createItem,
    deleteItem,
  };

  return (
    <FinalSaleItemContext.Provider value={value}>{children}</FinalSaleItemContext.Provider>
  );
};

export const useFinalSaleItems = (): FinalSaleItemContextType => {
  const ctx = useContext(FinalSaleItemContext);
  if (!ctx) throw new Error('useFinalSaleItems must be used within a FinalSaleItemProvider');
  return ctx;
};

export default FinalSaleItemContext;


