import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type GiftCardProductStatus = 'active' | 'draft';
export type GiftCardRedemptionScope = 'all_currencies' | 'store_currency';

export interface GiftCardProduct {
  _id: string;
  storeId: string;
  title: string;
  description: string;
  imageUrls: string[];
  denominations: number[];
  storeCurrencyCode: string;
  redemptionScope: GiftCardRedemptionScope;
  status: GiftCardProductStatus;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  productType?: string | null;
  vendor?: string | null;
  tagIds: string[];
  themeTemplate: string;
  giftCardTemplate: string;
  linkedProductId?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGiftCardProductRequest {
  storeId: string;
  title: string;
  description?: string;
  imageUrls?: string[];
  denominations: number[];
  storeCurrencyCode?: string;
  redemptionScope?: GiftCardRedemptionScope | 'all' | 'store';
  status?: GiftCardProductStatus;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  productType?: string | null;
  vendor?: string | null;
  tagIds?: string[];
  themeTemplate?: string;
  giftCardTemplate?: string;
}

export type UpdateGiftCardProductRequest = Partial<Omit<CreateGiftCardProductRequest, 'storeId'>>;

interface GiftCardProductsContextType {
  giftCardProducts: GiftCardProduct[];
  loading: boolean;
  error: string | null;
  fetchGiftCardProductsByStoreId: (storeId: string) => Promise<void>;
  createGiftCardProduct: (payload: CreateGiftCardProductRequest) => Promise<GiftCardProduct>;
  updateGiftCardProduct: (
    giftCardProductId: string,
    payload: UpdateGiftCardProductRequest
  ) => Promise<GiftCardProduct>;
  deleteGiftCardProduct: (giftCardProductId: string) => Promise<void>;
  clearError: () => void;
  clearGiftCardProducts: () => void;
}

const GiftCardProductsContext = createContext<GiftCardProductsContextType | undefined>(undefined);

export const GiftCardProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [giftCardProducts, setGiftCardProducts] = useState<GiftCardProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGiftCardProductsByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.get<{ success: boolean; data: GiftCardProduct[] }>(
        `/gift-card-products/store/${storeId}`
      );
      if (response.data.success) {
        setGiftCardProducts(response.data.data);
      } else {
        setError('Failed to fetch gift card products');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch gift card products';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createGiftCardProduct = useCallback(async (payload: CreateGiftCardProductRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.post<{ success: boolean; data: GiftCardProduct }>(
        '/gift-card-products',
        payload
      );
      if (!response.data.success) {
        throw new Error('Failed to create gift card product');
      }
      const created = response.data.data;
      setGiftCardProducts((prev) => [created, ...prev]);
      return created;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create gift card product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGiftCardProduct = useCallback(
    async (giftCardProductId: string, payload: UpdateGiftCardProductRequest) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.put<{ success: boolean; data: GiftCardProduct }>(
          `/gift-card-products/${giftCardProductId}`,
          payload
        );
        if (!response.data.success) {
          throw new Error('Failed to update gift card product');
        }
        const updated = response.data.data;
        setGiftCardProducts((prev) =>
          prev.map((item) => (item._id === giftCardProductId ? updated : item))
        );
        return updated;
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to update gift card product';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteGiftCardProduct = useCallback(async (giftCardProductId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.delete<{ success: boolean }>(
        `/gift-card-products/${giftCardProductId}`
      );
      if (!response.data.success) {
        throw new Error('Failed to delete gift card product');
      }
      setGiftCardProducts((prev) => prev.filter((item) => item._id !== giftCardProductId));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete gift card product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearGiftCardProducts = useCallback(() => {
    setGiftCardProducts([]);
    setError(null);
    setLoading(false);
  }, []);

  return (
    <GiftCardProductsContext.Provider
      value={{
        giftCardProducts,
        loading,
        error,
        fetchGiftCardProductsByStoreId,
        createGiftCardProduct,
        updateGiftCardProduct,
        deleteGiftCardProduct,
        clearError,
        clearGiftCardProducts,
      }}
    >
      {children}
    </GiftCardProductsContext.Provider>
  );
};

export const useGiftCardProducts = (): GiftCardProductsContextType => {
  const context = useContext(GiftCardProductsContext);
  if (!context) {
    throw new Error('useGiftCardProducts must be used within a GiftCardProductsProvider');
  }
  return context;
};

export default GiftCardProductsContext;
