import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Types
export interface CustomerTimelineEntry {
  _id: string;
  customerId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerTimelineRequest {
  customerId: string;
  comment: string;
}

export interface UpdateCustomerTimelineRequest {
  comment: string;
}

export interface CreateCustomerTimelineApiResponseType {
  success: boolean;
  message: string;
  data: CustomerTimelineEntry;
}

export interface UpdateCustomerTimelineApiResponseType {
  success: boolean;
  message: string;
  data: CustomerTimelineEntry;
}

export interface DeleteCustomerTimelineApiResponseType {
  success: boolean;
  message: string;
  data: {
    deletedTimelineEntry: {
      id: string;
      customerId: string;
      comment: string;
    };
  };
}

export interface FetchCustomerTimelineByCustomerIdApiResponseType {
  success: boolean;
  message: string;
  data: CustomerTimelineEntry[];
  count: number;
}

// Context
interface CustomerTimelineContextType {
  timeline: CustomerTimelineEntry[];
  loading: boolean;
  error: string | null;
  fetchCustomerTimelineByCustomerId: (customerId: string) => Promise<void>;
  createCustomerTimeline: (payload: CreateCustomerTimelineRequest) => Promise<CustomerTimelineEntry>;
  updateCustomerTimeline: (id: string, payload: UpdateCustomerTimelineRequest) => Promise<CustomerTimelineEntry>;
  deleteCustomerTimeline: (id: string) => Promise<void>;
  clearError: () => void;
  clearTimeline: () => void;
}

const CustomerTimelineContext = createContext<CustomerTimelineContextType | undefined>(undefined);

export const CustomerTimelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeline, setTimeline] = useState<CustomerTimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerTimelineByCustomerId = useCallback(async (customerId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<FetchCustomerTimelineByCustomerIdApiResponseType>(`/customer-timeline/customer/${customerId}`);
      setTimeline(res.data.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch timeline';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomerTimeline = useCallback(async (payload: CreateCustomerTimelineRequest): Promise<CustomerTimelineEntry> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateCustomerTimelineApiResponseType>('/customer-timeline', payload);
      const created = res.data.data;
      setTimeline(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create timeline entry';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomerTimelineFn = useCallback(async (id: string, payload: UpdateCustomerTimelineRequest): Promise<CustomerTimelineEntry> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.patch<UpdateCustomerTimelineApiResponseType>(`/customer-timeline/${id}`, payload);
      const updated = res.data.data;
      setTimeline(prev => prev.map(e => (e._id === id ? updated : e)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update timeline entry';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomerTimelineFn = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axiosi.delete<DeleteCustomerTimelineApiResponseType>(`/customer-timeline/${id}`);
      setTimeline(prev => prev.filter(e => e._id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete timeline entry';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearTimeline = useCallback(() => setTimeline([]), []);

  const value: CustomerTimelineContextType = {
    timeline,
    loading,
    error,
    fetchCustomerTimelineByCustomerId,
    createCustomerTimeline,
    updateCustomerTimeline: updateCustomerTimelineFn,
    deleteCustomerTimeline: deleteCustomerTimelineFn,
    clearError,
    clearTimeline,
  };

  return (
    <CustomerTimelineContext.Provider value={value}>
      {children}
    </CustomerTimelineContext.Provider>
  );
};

export const useCustomerTimeline = (): CustomerTimelineContextType => {
  const ctx = useContext(CustomerTimelineContext);
  if (!ctx) throw new Error('useCustomerTimeline must be used within a CustomerTimelineProvider');
  return ctx;
};

export default CustomerTimelineContext;


