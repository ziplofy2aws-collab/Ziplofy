import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';
import { toast } from 'react-hot-toast';

export interface TransferTag {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTransferTagResponse {
  success: boolean;
  data: TransferTag;
}

interface GetTransferTagsResponse {
  success: boolean;
  data: TransferTag[];
  count: number;
}

interface DeleteTransferTagResponse {
  success: boolean;
  message: string;
  data?: { deletedTag: TransferTag };
}

interface TransferTagsContextType {
  tags: TransferTag[];
  loading: boolean;
  error: string | null;
  fetchByStore: (storeId: string) => Promise<void>;
  createTag: (storeId: string, name: string) => Promise<TransferTag>;
  deleteTag: (id: string) => Promise<void>;
  clearError: () => void;
}

const TransferTagsContext = createContext<TransferTagsContextType | undefined>(undefined);

export const TransferTagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tags, setTags] = useState<TransferTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchByStore = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetTransferTagsResponse>(`/transfer-tags/store/${storeId}`);
      if (!res.data.success) throw new Error('Failed to fetch transfer tags');
      setTags(res.data.data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch transfer tags';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(async (storeId: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateTransferTagResponse>(`/transfer-tags`, { storeId, name });
      if (!res.data.success) throw new Error('Failed to create transfer tag');
      const tag = res.data.data;
      setTags(prev => {
        // dedupe by id
        const exists = prev.some(t => t._id === tag._id);
        return exists ? prev : [tag, ...prev];
      });
      return tag;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create transfer tag';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<DeleteTransferTagResponse>(`/transfer-tags/${id}`);
      if (!res.data.success) throw new Error('Failed to delete transfer tag');
      setTags(prev => prev.filter(t => t._id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete transfer tag';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: TransferTagsContextType = {
    tags,
    loading,
    error,
    fetchByStore,
    createTag,
    deleteTag,
    clearError,
  };

  return (
    <TransferTagsContext.Provider value={value}>{children}</TransferTagsContext.Provider>
  );
};

export const useTransferTags = (): TransferTagsContextType => {
  const ctx = useContext(TransferTagsContext);
  if (!ctx) throw new Error('useTransferTags must be used within a TransferTagsProvider');
  return ctx;
};


