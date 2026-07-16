import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface Collection {
  _id: string;
  storeId: string;
  title: string;
  imageUrl?: string;
  imageAltText?: string;
  description: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  productSort: 'manual' | 'title-asc' | 'title-desc' | 'price-high' | 'price-low' | 'newest' | 'oldest';
  status: 'draft' | 'published';
  /** `default` or `collection.{slug}` — which collection template the storefront uses. */
  themeTemplate?: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface CreateCollectionPayload {
  storeId: string;
  title: string;
  imageUrl?: string;
  imageAltText?: string;
  description: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  productSort?: 'manual' | 'title-asc' | 'title-desc' | 'price-high' | 'price-low' | 'newest' | 'oldest';
  productIds?: string[];
  status?: 'draft' | 'published';
  themeTemplate?: string;
}

export interface UpdateCollectionPayload {
  title?: string;
  imageUrl?: string;
  imageAltText?: string;
  description?: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  productSort?: 'manual' | 'title-asc' | 'title-desc' | 'price-high' | 'price-low' | 'newest' | 'oldest';
  status?: 'draft' | 'published';
  themeTemplate?: string;
}

interface CreateCollectionResponse {
  success: boolean;
  data: Collection;
  message: string;
}

interface UpdateCollectionResponse {
  success: boolean;
  data: Collection;
  message: string;
}

interface DeleteCollectionResponse {
  success: boolean;
  data: { deletedId: string };
  message: string;
}

interface GetCollectionsByStoreResponse {
  success: boolean;
  data: Collection[];
  count: number;
}

interface GetCollectionByIdResponse {
  success: boolean;
  data: Collection;
}

interface SearchCollectionsResponse {
  success: boolean;
  data: Collection[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Product lite type for search-in-collection
interface ProductLiteInCollection {
  _id: string;
  title: string;
  sku: string;
  productType?: string;
  vendor?: string;
  imageUrls?: string[];
  createdAt: string;
}

export interface SearchProductsInCollectionResponse {
  success: boolean;
  data: ProductLiteInCollection[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface CollectionContextType {
  collections: Collection[];
  activeCollection: Collection | null;
  loading: boolean;
  activeCollectionLoading: boolean;
  error: string | null;
  fetchCollectionsByStoreId: (storeId: string) => Promise<void>;
  fetchCollectionById: (collectionId: string) => Promise<Collection>;
  searchCollections: (storeId: string, query: string, page?: number, limit?: number) => Promise<SearchCollectionsResponse>;
  searchProductsInCollection: (collectionId: string, query: string, page?: number, limit?: number) => Promise<SearchProductsInCollectionResponse>;
  createCollection: (payload: CreateCollectionPayload) => Promise<Collection>;
  updateCollection: (id: string, payload: UpdateCollectionPayload) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<string>;
  clearCollections: () => void;
  clearActiveCollection: () => void;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeCollectionLoading, setActiveCollectionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const activeCollectionFetchRef = useRef(0);

  const extractApiErrorMessage = useCallback((err: unknown, fallback: string) => {
    const apiErr = err as {
      response?: { data?: { message?: string; error?: string; details?: { message?: string } } };
      message?: string;
    };
    const apiMessage =
      apiErr?.response?.data?.message ||
      apiErr?.response?.data?.error ||
      apiErr?.response?.data?.details?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
    if (typeof apiErr?.message === 'string' && apiErr.message.trim()) return apiErr.message;
    return fallback;
  }, []);

  const fetchCollectionsByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetCollectionsByStoreResponse>(`/collections/store/${storeId}`);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to fetch collections');
      setCollections(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCollectionById = useCallback(async (collectionId: string): Promise<Collection> => {
    const fetchId = ++activeCollectionFetchRef.current;
    try {
      setActiveCollectionLoading(true);
      setError(null);
      const res = await axiosi.get<GetCollectionByIdResponse>(`/collections/${collectionId}`);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to fetch collection details');
      if (fetchId !== activeCollectionFetchRef.current) return data;
      setActiveCollection(data);
      setCollections((prev) => {
        const exists = prev.some((collection) => collection._id === data._id);
        if (exists) {
          return prev.map((collection) => (collection._id === data._id ? data : collection));
        }
        return [data, ...prev];
      });
      return data;
    } catch (err: unknown) {
      if (fetchId === activeCollectionFetchRef.current) {
        const msg = extractApiErrorMessage(err, 'Failed to fetch collection details');
        setError(msg);
        setActiveCollection(null);
      }
      throw new Error(extractApiErrorMessage(err, 'Failed to fetch collection details'));
    } finally {
      if (fetchId === activeCollectionFetchRef.current) {
        setActiveCollectionLoading(false);
      }
    }
  }, [extractApiErrorMessage]);

  const searchCollections = useCallback(async (storeId: string, query: string, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<SearchCollectionsResponse>(`/collections/search/${storeId}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const { success, data, pagination } = res.data;
      if (!success) throw new Error('Failed to search collections');
      setCollections(data);
      return { success, data, pagination };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to search collections';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProductsInCollection = useCallback(async (collectionId: string, query: string, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<SearchProductsInCollectionResponse>(`/collections/${collectionId}/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const { success, data, pagination } = res.data;
      if (!success) throw new Error('Failed to search products in collection');
      // Do not mutate collections state; return the results to caller
      return { success, data, pagination };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to search products in collection';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollection = useCallback(async (payload: CreateCollectionPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateCollectionResponse>('/collections', payload);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to create collection');
      setCollections(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create collection';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCollection = useCallback(async (id: string, payload: UpdateCollectionPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.patch<UpdateCollectionResponse>(`/collections/${id}`, payload);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to update collection');
      setCollections(prev => prev.map(c => (c._id === id ? data : c)));
      setActiveCollection(prev => (prev && prev._id === id ? data : prev));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update collection';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCollection = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<DeleteCollectionResponse>(`/collections/${id}`);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to delete collection');
      setCollections(prev => prev.filter(c => c._id !== id));
      setActiveCollection(prev => (prev && prev._id === id ? null : prev));
      return data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete collection';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCollections = useCallback(() => {
    setCollections([]);
    setError(null);
    setLoading(false);
  }, []);

  const clearActiveCollection = useCallback(() => {
    activeCollectionFetchRef.current += 1;
    setActiveCollection(null);
    setActiveCollectionLoading(false);
  }, []);

  const value: CollectionContextType = {
    collections,
    activeCollection,
    loading,
    activeCollectionLoading,
    error,
    fetchCollectionsByStoreId,
    fetchCollectionById,
    searchCollections,
    searchProductsInCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    clearCollections,
    clearActiveCollection,
  };

  return (
    <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>
  );
};

export const useCollections = (): CollectionContextType => {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollections must be used within a CollectionProvider');
  return ctx;
};

export const CollectionsContext = CollectionContext;


