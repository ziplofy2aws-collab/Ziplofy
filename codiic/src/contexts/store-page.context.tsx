import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type StorePageVisibility = 'visible' | 'hidden';

export interface StorePage {
  _id: string;
  storeId: string;
  title: string;
  content: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: StorePageVisibility;
  themeTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStorePagePayload {
  storeId: string;
  title: string;
  content?: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  visibility?: StorePageVisibility;
  themeTemplate?: string;
}

export type UpdateStorePagePayload = Partial<Omit<CreateStorePagePayload, 'storeId'>> & {
  storeId?: string;
};

interface StorePagesListResponse {
  success: boolean;
  data: StorePage[];
  count: number;
}

interface StorePageDetailResponse {
  success: boolean;
  data: StorePage;
}

interface StorePageMutationResponse extends StorePageDetailResponse {
  message: string;
}

interface DeleteStorePageResponse {
  success: boolean;
  data: { deletedId: string };
  message: string;
}

interface StorePageContextType {
  pages: StorePage[];
  activePage: StorePage | null;
  loading: boolean;
  error: string | null;
  fetchPagesByStoreId: (storeId: string) => Promise<StorePage[]>;
  fetchPageById: (pageId: string, storeId?: string) => Promise<StorePage>;
  createPage: (payload: CreateStorePagePayload) => Promise<StorePage>;
  updatePage: (pageId: string, payload: UpdateStorePagePayload) => Promise<StorePage>;
  deletePage: (pageId: string, storeId?: string) => Promise<string>;
  clearPages: () => void;
  clearActivePage: () => void;
}

const StorePageContext = createContext<StorePageContextType | undefined>(undefined);

function errorMessage(error: unknown, fallback: string): string {
  const candidate = error as { response?: { data?: { message?: string } }; message?: string };
  return candidate?.response?.data?.message || candidate?.message || fallback;
}

export const StorePageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<StorePage[]>([]);
  const [activePage, setActivePage] = useState<StorePage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPagesByStoreId = useCallback(async (storeId: string): Promise<StorePage[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.get<StorePagesListResponse>(`/store-pages/store/${storeId}`);
      const list = response.data?.data ?? [];
      setPages(list);
      return list;
    } catch (requestError) {
      setError(errorMessage(requestError, 'Failed to fetch pages'));
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPageById = useCallback(
    async (pageId: string, storeId?: string): Promise<StorePage> => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.get<StorePageDetailResponse>(`/store-pages/${pageId}`, {
          params: storeId ? { storeId } : undefined,
        });
        setActivePage(response.data.data);
        return response.data.data;
      } catch (requestError) {
        setError(errorMessage(requestError, 'Failed to fetch page'));
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createPage = useCallback(async (payload: CreateStorePagePayload): Promise<StorePage> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.post<StorePageMutationResponse>('/store-pages', payload);
      const page = response.data.data;
      setPages((current) => [page, ...current]);
      setActivePage(page);
      return page;
    } catch (requestError) {
      setError(errorMessage(requestError, 'Failed to create page'));
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePage = useCallback(
    async (pageId: string, payload: UpdateStorePagePayload): Promise<StorePage> => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.patch<StorePageMutationResponse>(
          `/store-pages/${pageId}`,
          payload
        );
        const page = response.data.data;
        setPages((current) => current.map((row) => (row._id === pageId ? page : row)));
        setActivePage((current) => (current?._id === pageId ? page : current));
        return page;
      } catch (requestError) {
        setError(errorMessage(requestError, 'Failed to update page'));
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deletePage = useCallback(async (pageId: string, storeId?: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.delete<DeleteStorePageResponse>(`/store-pages/${pageId}`, {
        params: storeId ? { storeId } : undefined,
      });
      setPages((current) => current.filter((row) => row._id !== pageId));
      setActivePage((current) => (current?._id === pageId ? null : current));
      return response.data.data.deletedId;
    } catch (requestError) {
      setError(errorMessage(requestError, 'Failed to delete page'));
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPages = useCallback(() => {
    setPages([]);
    setError(null);
    setLoading(false);
  }, []);

  const clearActivePage = useCallback(() => setActivePage(null), []);

  return (
    <StorePageContext.Provider
      value={{
        pages,
        activePage,
        loading,
        error,
        fetchPagesByStoreId,
        fetchPageById,
        createPage,
        updatePage,
        deletePage,
        clearPages,
        clearActivePage,
      }}
    >
      {children}
    </StorePageContext.Provider>
  );
};

export const useStorePages = (): StorePageContextType => {
  const context = useContext(StorePageContext);
  if (!context) throw new Error('useStorePages must be used within a StorePageProvider');
  return context;
};
