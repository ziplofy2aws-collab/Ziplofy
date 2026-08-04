import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';
import { encodeStorefrontPathHandle } from '../utils/storefront-path-handle.util';

export interface StorefrontPage {
  _id: string;
  storeId: string;
  title: string;
  content: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: 'visible' | 'hidden';
  /** Theme creator template: `default` or `pages.{slug}`. */
  themeTemplate?: string;
  createdAt: string;
  updatedAt: string;
}

interface FetchPageDetailsApiResponse {
  success: boolean;
  data: StorefrontPage;
}

interface FetchPagesListApiResponse {
  success: boolean;
  data: StorefrontPage[];
  count: number;
}

interface StorefrontPagesContextType {
  activePage: StorefrontPage | null;
  loading: boolean;
  error: string | null;
  listPagesByStoreId: (
    storeId: string,
    options?: { preview?: boolean }
  ) => Promise<StorefrontPage[]>;
  getPageByUrlHandle: (
    storeId: string,
    urlHandle: string,
    options?: { preview?: boolean }
  ) => Promise<StorefrontPage>;
  clearActivePage: () => void;
  clear: () => void;
}

const StorefrontPagesContext = createContext<StorefrontPagesContextType | undefined>(undefined);

export const StorefrontPagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<StorefrontPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listPagesByStoreId = useCallback(
    async (storeId: string, options?: { preview?: boolean }): Promise<StorefrontPage[]> => {
      try {
        setError(null);
        const res = await axiosi.get<FetchPagesListApiResponse>(
          `/storefront/pages/store/${storeId}`,
          options?.preview ? { params: { preview: '1' } } : undefined
        );
        return res.data?.data ?? [];
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string; error?: string } }; message?: string })
            ?.response?.data?.message ||
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          (err as { message?: string })?.message ||
          'Failed to fetch pages';
        setError(msg);
        throw err;
      }
    },
    []
  );

  const getPageByUrlHandle = useCallback(
    async (
      storeId: string,
      urlHandle: string,
      options?: { preview?: boolean }
    ): Promise<StorefrontPage> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.get<FetchPageDetailsApiResponse>(
          `/storefront/pages/store/${storeId}/url-handle/${encodeStorefrontPathHandle(urlHandle)}`,
          options?.preview ? { params: { preview: '1' } } : undefined
        );
        const page = res.data.data;
        setActivePage(page);
        return page;
      } catch (err: unknown) {
        setActivePage(null);
        const msg =
          (err as { response?: { data?: { message?: string; error?: string } }; message?: string })
            ?.response?.data?.message ||
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          (err as { message?: string })?.message ||
          'Failed to fetch page';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearActivePage = useCallback(() => {
    setActivePage(null);
    setError(null);
  }, []);

  const clear = useCallback(() => {
    setActivePage(null);
    setLoading(false);
    setError(null);
  }, []);

  return (
    <StorefrontPagesContext.Provider
      value={{
        activePage,
        loading,
        error,
        listPagesByStoreId,
        getPageByUrlHandle,
        clearActivePage,
        clear,
      }}
    >
      {children}
    </StorefrontPagesContext.Provider>
  );
};

export function useStorefrontPages(): StorefrontPagesContextType {
  const ctx = useContext(StorefrontPagesContext);
  if (!ctx) throw new Error('useStorefrontPages must be used within a StorefrontPagesProvider');
  return ctx;
}
