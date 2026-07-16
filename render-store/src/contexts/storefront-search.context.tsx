import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { axiosi } from '../config/axios.config';
import type { StorefrontProductItem } from './product.context';

export interface StorefrontSearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface SearchProductsApiResponse {
  success: boolean;
  data: StorefrontProductItem[];
  query?: string;
  pagination: StorefrontSearchPagination;
}

export type SearchStorefrontProductsArgs = {
  storeId: string;
  q?: string;
  page?: number;
  limit?: number;
};

interface StorefrontSearchContextType {
  /** Last submitted / requested search text (may differ from URL until synced by UI). */
  searchValue: string;
  setSearchValue: (value: string) => void;
  products: StorefrontProductItem[];
  loading: boolean;
  error: string | null;
  pagination: StorefrontSearchPagination | null;
  lastQuery: string;
  searchProducts: (args: SearchStorefrontProductsArgs) => Promise<StorefrontProductItem[]>;
  clear: () => void;
}

const StorefrontSearchContext = createContext<StorefrontSearchContextType | undefined>(undefined);

const emptyFallback: StorefrontSearchContextType = {
  searchValue: '',
  setSearchValue: () => {},
  products: [],
  loading: false,
  error: null,
  pagination: null,
  lastQuery: '',
  searchProducts: async () => [],
  clear: () => {},
};

export function StorefrontSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchValue, setSearchValueState] = useState('');
  const [products, setProducts] = useState<StorefrontProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<StorefrontSearchPagination | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const requestIdRef = useRef(0);

  const setSearchValue = useCallback((value: string) => {
    setSearchValueState(value);
  }, []);

  const searchProducts = useCallback(async (args: SearchStorefrontProductsArgs) => {
    const { storeId, q = '', page = 1, limit = 24 } = args;
    if (!storeId) return [];

    const query = q.trim();
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      setSearchValueState(query);
      const res = await axiosi.get<SearchProductsApiResponse>(
        `/storefront/products/store/${storeId}/search`,
        { params: { q: query, page, limit } }
      );
      if (requestId !== requestIdRef.current) return [];
      if (!res.data?.success) throw new Error('Failed to search products');
      const list = res.data.data ?? [];
      setProducts(list);
      setPagination(res.data.pagination ?? null);
      setLastQuery(res.data.query ?? query);
      return list;
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) return [];
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ??
        (err as { message?: string })?.message ??
        'Failed to search products';
      setError(msg);
      setProducts([]);
      setPagination(null);
      setLastQuery(query);
      return [];
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    requestIdRef.current += 1;
    setSearchValueState('');
    setProducts([]);
    setPagination(null);
    setError(null);
    setLastQuery('');
    setLoading(false);
  }, []);

  return (
    <StorefrontSearchContext.Provider
      value={{
        searchValue,
        setSearchValue,
        products,
        loading,
        error,
        pagination,
        lastQuery,
        searchProducts,
        clear,
      }}
    >
      {children}
    </StorefrontSearchContext.Provider>
  );
}

export function useStorefrontSearch(): StorefrontSearchContextType {
  const ctx = useContext(StorefrontSearchContext);
  return ctx ?? emptyFallback;
}
