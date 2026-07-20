import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface TransferTimelineEntry {
  _id: string;
  transferId: string;
  type: 'comment' | 'event';
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> { success: boolean; data: T; message?: string }

interface TransferTimelineContextType {
  entries: TransferTimelineEntry[];
  loading: boolean;
  error: string | null;
  fetchByTransferId: (transferId: string) => Promise<TransferTimelineEntry[]>;
  createEntry: (payload: { transferId: string; comment: string }) => Promise<TransferTimelineEntry>;
  updateEntry: (id: string, payload: { comment: string }) => Promise<TransferTimelineEntry>;
  deleteEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

const TransferTimelineContext = createContext<TransferTimelineContextType | undefined>(undefined);

export const TransferTimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<TransferTimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchByTransferId = useCallback(async (transferId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.get<ApiResponse<TransferTimelineEntry[]>>(`/transfer-timelines/transfer/${transferId}`);
      if (!data.success) throw new Error(data.message || 'Failed to fetch transfer timeline');
      setEntries(data.data || []);
      return data.data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch transfer timeline';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (payload: { transferId: string; comment: string }) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.post<ApiResponse<TransferTimelineEntry>>('/transfer-timelines', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create transfer timeline');
      setEntries(prev => [data.data, ...prev]);
      return data.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create transfer timeline';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEntry = useCallback(async (id: string, payload: { comment: string }) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.put<ApiResponse<TransferTimelineEntry>>(`/transfer-timelines/${id}`, payload);
      if (!data.success) throw new Error(data.message || 'Failed to update transfer timeline');
      setEntries(prev => prev.map(e => (e._id === id ? data.data : e)));
      return data.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update transfer timeline';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.delete<{ success: boolean; message?: string }>(`/transfer-timelines/${id}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete transfer timeline');
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete transfer timeline';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: TransferTimelineContextType = {
    entries,
    loading,
    error,
    fetchByTransferId,
    createEntry,
    updateEntry,
    deleteEntry,
    clearError,
  };

  return (
    <TransferTimelineContext.Provider value={value}>{children}</TransferTimelineContext.Provider>
  );
};

export const useTransferTimeline = (): TransferTimelineContextType => {
  const ctx = useContext(TransferTimelineContext);
  if (!ctx) throw new Error('useTransferTimeline must be used within a TransferTimelineProvider');
  return ctx;
};


