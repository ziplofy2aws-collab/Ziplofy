import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface CollectionEntryProductCategory {
  _id: string;
  name: string;
  parent: string | null;
  hasChildren: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionEntryProductVendor {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionEntryProductTag {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionEntryProduct {
  _id: string;
  title: string;
  storeId: string;
  description: string;
  category: CollectionEntryProductCategory;
  price: number;
  chargeTax: boolean;
  compareAtPrice?: number;
  cost: number;
  inventoryTrackingEnabled: boolean;
  sku: string;
  barcode: string;
  continueSellingWhenOutOfStock: boolean;
  isPhysicalProduct: boolean;
  package: {
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
  };
  productWeight: number;
  productWeightUnit: string;
  countryOfOrigin: string;
  harmonizedSystemCode: string;
  variants: Array<{ optionName: string; values: string[]; _id: string }>;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  profit: number;
  marginPercent: number;
  unitPriceTotalAmount?: number;
  unitPriceTotalAmountMetric?: string;
  unitPriceBaseMeasure?: number;
  unitPriceBaseMeasureMetric?: string;
  status: 'active' | 'draft';
  onlineStorePublishing: boolean;
  pointOfSalePublishing: boolean;
  productType: string;
  vendor: CollectionEntryProductVendor;
  tagIds: CollectionEntryProductTag[];
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CollectionEntry {
  _id: string;
  collectionId: string;
  productId: CollectionEntryProduct;
  position?: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateCollectionEntryPayload {
  collectionId: string;
  productId: string;
  position?: number;
}

interface CreateCollectionEntryResponse {
  success: boolean;
  data: CollectionEntry;
  message: string;
}

interface FetchCollectionEntriesResponse {
  success: boolean;
  data: CollectionEntry[];
  count: number;
  message: string;
}

interface DeleteCollectionEntryResponse {
  success: boolean;
  data: CollectionEntry;
  message: string;
}

interface CollectionEntriesContextValue {
  collectionEntries: CollectionEntry[];
  loading: boolean;
  error: string | null;
  createCollectionEntry: (payload: CreateCollectionEntryPayload) => Promise<CollectionEntry>;
  fetchCollectionEntriesByCollectionId: (collectionId: string) => Promise<CollectionEntry[]>;
  deleteCollectionEntry: (entryId: string) => Promise<void>;
}

const CollectionEntriesContext = createContext<CollectionEntriesContextValue | undefined>(undefined);

export const CollectionEntriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collectionEntries, setCollectionEntries] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCollectionEntry = useCallback(async (payload: CreateCollectionEntryPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosi.post<CreateCollectionEntryResponse>(`/collection-entries`, payload);
      const created = res.data.data;
      setCollectionEntries(prev => [created, ...prev]);
      return created;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to create collection entry';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCollectionEntriesByCollectionId = useCallback(async (collectionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosi.get<FetchCollectionEntriesResponse>(`/collection-entries/collection/${collectionId}`);
      const list = res.data?.data ?? [];
      setCollectionEntries(list);
      return list;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to fetch collection entries';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCollectionEntry = useCallback(async (entryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosi.delete<DeleteCollectionEntryResponse>(`/collection-entries/${entryId}`);
      setCollectionEntries(prev => prev.filter(e => e._id !== entryId));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to delete collection entry';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<CollectionEntriesContextValue>(() => ({
    collectionEntries,
    loading,
    error,
    createCollectionEntry,
    fetchCollectionEntriesByCollectionId,
    deleteCollectionEntry,
  }), [collectionEntries, loading, error, createCollectionEntry, fetchCollectionEntriesByCollectionId, deleteCollectionEntry]);

  return (
    <CollectionEntriesContext.Provider value={value}>
      {children}
    </CollectionEntriesContext.Provider>
  );
};

export const useCollectionEntries = (): CollectionEntriesContextValue => {
  const ctx = useContext(CollectionEntriesContext);
  if (!ctx) throw new Error('useCollectionEntries must be used within a CollectionEntriesProvider');
  return ctx;
};


