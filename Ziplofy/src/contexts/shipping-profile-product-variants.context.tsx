import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: Record<string, unknown>;
}

interface PopulatedProductVariant {
  _id: string;
  sku?: string;
  optionValues?: Record<string, string>;
  productId?: {
    _id: string;
    title?: string;
    imageUrls?: string[];
  };
  [key: string]: any;
}

export interface ShippingProfileProductVariantEntry {
  _id: string;
  shippingProfileId: string;
  productVariantId: PopulatedProductVariant | string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingProfileProductVariantEntryPayload {
  productVariantId: string;
}

interface ShippingProfileProductVariantsContextValue {
  entriesByProfileId: Record<string, ShippingProfileProductVariantEntry[]>;
  loading: boolean;
  error: string | null;
  fetchByProfileId: (profileId: string) => Promise<ShippingProfileProductVariantEntry[]>;
  addEntry: (profileId: string, payload: CreateShippingProfileProductVariantEntryPayload) => Promise<ShippingProfileProductVariantEntry>;
  deleteEntry: (entryId: string, profileId?: string) => Promise<void>;
  clear: () => void;
}

const ShippingProfileProductVariantsContext = createContext<ShippingProfileProductVariantsContextValue | undefined>(undefined);

export const ShippingProfileProductVariantsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entriesByProfileId, setEntriesByProfileId] = useState<Record<string, ShippingProfileProductVariantEntry[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByProfileId = useCallback(async (profileId: string): Promise<ShippingProfileProductVariantEntry[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosi.get<ApiResponse<ShippingProfileProductVariantEntry[]>>(
        `/shipping-profile-product-variants/${profileId}`
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch product variants');
      }
      const data = response.data.data || [];
      setEntriesByProfileId((prev) => ({
        ...prev,
        [profileId]: data,
      }));
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch product variants';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEntry = useCallback(
    async (profileId: string, payload: CreateShippingProfileProductVariantEntryPayload): Promise<ShippingProfileProductVariantEntry> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosi.post<ApiResponse<ShippingProfileProductVariantEntry>>(
          `/shipping-profile-product-variants/${profileId}`,
          payload
        );
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to add product variant');
        }
        const entry = response.data.data;
        setEntriesByProfileId((prev) => ({
          ...prev,
          [profileId]: [...(prev[profileId] || []), entry],
        }));
        return entry;
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to add product variant';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteEntry = useCallback(async (entryId: string, profileId?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosi.delete<ApiResponse<{ deletedId: string }>>(`/shipping-profile-product-variants/${entryId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove product variant');
      }
      const affectedProfileId = profileId || (response.data.meta?.shippingProfileId as string);
      if (affectedProfileId) {
        setEntriesByProfileId((prev) => ({
          ...prev,
          [affectedProfileId]: (prev[affectedProfileId] || []).filter((entry) => entry._id !== entryId),
        }));
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to remove product variant';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setEntriesByProfileId({});
    setError(null);
  }, []);

  const value = useMemo<ShippingProfileProductVariantsContextValue>(
    () => ({
      entriesByProfileId,
      loading,
      error,
      fetchByProfileId,
      addEntry,
      deleteEntry,
      clear,
    }),
    [entriesByProfileId, loading, error, fetchByProfileId, addEntry, deleteEntry, clear]
  );

  return (
    <ShippingProfileProductVariantsContext.Provider value={value}>
      {children}
    </ShippingProfileProductVariantsContext.Provider>
  );
};

export const useShippingProfileProductVariants = (): ShippingProfileProductVariantsContextValue => {
  const context = useContext(ShippingProfileProductVariantsContext);
  if (context === undefined) {
    throw new Error('useShippingProfileProductVariants must be used within a ShippingProfileProductVariantsProvider');
  }
  return context;
};

