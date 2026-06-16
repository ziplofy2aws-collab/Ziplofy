import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

export interface BlogTag {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogTagPayload {
  storeId: string;
  name: string;
}

export interface UpdateBlogTagPayload {
  storeId?: string;
  name: string;
}

interface BlogTagMutationResponse {
  success: boolean;
  message: string;
  data: BlogTag;
}

interface BlogTagsListResponse {
  success: boolean;
  message: string;
  data: BlogTag[];
  count: number;
}

interface DeleteBlogTagResponse {
  success: boolean;
  message: string;
  data: {
    deletedTag: {
      id: string;
      storeId: string;
      name: string;
    };
  };
}

interface BlogTagsContextType {
  blogTags: BlogTag[];
  searchResults: BlogTag[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  fetchBlogTagsByStoreId: (storeId: string) => Promise<BlogTag[]>;
  searchBlogTags: (storeId: string, query?: string, limit?: number) => Promise<BlogTag[]>;
  createBlogTag: (payload: CreateBlogTagPayload) => Promise<BlogTag>;
  updateBlogTag: (tagId: string, payload: UpdateBlogTagPayload) => Promise<BlogTag>;
  deleteBlogTag: (tagId: string, storeId?: string) => Promise<void>;
  upsertSearchResult: (tag: BlogTag) => void;
  clearError: () => void;
  clearBlogTags: () => void;
  clearSearchResults: () => void;
}

const BlogTagsContext = createContext<BlogTagsContextType | undefined>(undefined);

export const BlogTagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [blogTags, setBlogTags] = useState<BlogTag[]>([]);
  const [searchResults, setSearchResults] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchSeqRef = useRef(0);
  const searchSeqRef = useRef(0);

  const mergeTags = useCallback((incoming: BlogTag[]) => {
    setBlogTags((prev) => {
      const byId = new Map<string, BlogTag>();
      for (const tag of incoming) byId.set(tag._id, tag);
      for (const tag of prev) {
        if (!byId.has(tag._id)) byId.set(tag._id, tag);
      }
      return Array.from(byId.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, []);

  const upsertSearchResult = useCallback((tag: BlogTag) => {
    setSearchResults((prev) => [tag, ...prev.filter((row) => row._id !== tag._id)]);
    mergeTags([tag]);
  }, [mergeTags]);

  const fetchBlogTagsByStoreId = useCallback(async (storeId: string): Promise<BlogTag[]> => {
    const seq = ++fetchSeqRef.current;
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.get<BlogTagsListResponse>(`/blog-tags/store/${storeId}`);
      const list = response.data.data ?? [];
      if (seq === fetchSeqRef.current) {
        mergeTags(list);
      }
      return list;
    } catch (err: any) {
      if (seq === fetchSeqRef.current) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to fetch blog tags';
        setError(errorMessage);
      }
      throw err;
    } finally {
      if (seq === fetchSeqRef.current) {
        setLoading(false);
      }
    }
  }, [mergeTags]);

  const searchBlogTags = useCallback(
    async (storeId: string, query = '', limit = 10): Promise<BlogTag[]> => {
      const seq = ++searchSeqRef.current;
      try {
        setSearchLoading(true);
        setError(null);
        const response = await axiosi.get<BlogTagsListResponse>(`/blog-tags/search/${storeId}`, {
          params: {
            q: query.trim(),
            limit,
          },
        });
        const list = response.data.data ?? [];
        if (seq === searchSeqRef.current) {
          setSearchResults(list);
          mergeTags(list);
        }
        return list;
      } catch (err: any) {
        if (seq === searchSeqRef.current) {
          const errorMessage =
            err?.response?.data?.message || err?.message || 'Failed to search blog tags';
          setError(errorMessage);
        }
        throw err;
      } finally {
        if (seq === searchSeqRef.current) {
          setSearchLoading(false);
        }
      }
    },
    [mergeTags]
  );

  const createBlogTag = useCallback(async (payload: CreateBlogTagPayload): Promise<BlogTag> => {
    fetchSeqRef.current += 1;
    searchSeqRef.current += 1;
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.post<BlogTagMutationResponse>('/blog-tags', {
        storeId: payload.storeId,
        name: payload.name.trim(),
      });
      const tag = response.data.data;
      upsertSearchResult(tag);
      return tag;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to create blog tag';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [upsertSearchResult]);

  const updateBlogTag = useCallback(
    async (tagId: string, payload: UpdateBlogTagPayload): Promise<BlogTag> => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.patch<BlogTagMutationResponse>(`/blog-tags/${tagId}`, {
          storeId: payload.storeId,
          name: payload.name.trim(),
        });
        const tag = response.data.data;
        mergeTags([tag]);
        setSearchResults((prev) => prev.map((row) => (row._id === tagId ? tag : row)));
        return tag;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to update blog tag';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mergeTags]
  );

  const deleteBlogTag = useCallback(async (tagId: string, storeId?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axiosi.delete<DeleteBlogTagResponse>(`/blog-tags/${tagId}`, {
        params: storeId ? { storeId } : undefined,
      });
      setBlogTags((prev) => prev.filter((row) => row._id !== tagId));
      setSearchResults((prev) => prev.filter((row) => row._id !== tagId));
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to delete blog tag';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearBlogTags = useCallback(() => {
    setBlogTags([]);
    setError(null);
  }, []);

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  const value: BlogTagsContextType = {
    blogTags,
    searchResults,
    loading,
    searchLoading,
    error,
    fetchBlogTagsByStoreId,
    searchBlogTags,
    createBlogTag,
    updateBlogTag,
    deleteBlogTag,
    upsertSearchResult,
    clearError,
    clearBlogTags,
    clearSearchResults,
  };

  return <BlogTagsContext.Provider value={value}>{children}</BlogTagsContext.Provider>;
};

export const useBlogTags = (): BlogTagsContextType => {
  const context = useContext(BlogTagsContext);
  if (!context) {
    throw new Error('useBlogTags must be used within a BlogTagsProvider');
  }
  return context;
};

export default BlogTagsContext;
