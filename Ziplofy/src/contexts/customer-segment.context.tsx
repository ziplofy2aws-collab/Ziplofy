import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface CustomerSegment {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface SearchCustomerSegmentsResponse {
  success: boolean;
  data: CustomerSegment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface CustomerSegmentContextValue {
  segments: CustomerSegment[];
  loading: boolean;
  error: string | null;
  createCustomerSegment: (storeId: string, name: string) => Promise<CustomerSegment>;
  fetchSegmentsByStoreId: (storeId: string) => Promise<CustomerSegment[]>;
  searchCustomerSegments: (storeId: string, query: string, page?: number, limit?: number) => Promise<SearchCustomerSegmentsResponse>;
  updateCustomerSegmentName: (id: string, name: string) => Promise<CustomerSegment>;
}

const CustomerSegmentContext = createContext<CustomerSegmentContextValue | undefined>(undefined);

export const CustomerSegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSegmentsByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosi.get<{ success: boolean; data: CustomerSegment[] }>(`/customer-segments/store/${storeId}`);
      const list = res.data?.data ?? [];
      setSegments(list);
      return list;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to fetch customer segments';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomerSegment = useCallback(async (storeId: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosi.post<{ success: boolean; data: CustomerSegment }>(`/customer-segments`, { storeId, name });
      const created = res.data.data;
      setSegments(prev => [created, ...prev]);
      return created;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to create customer segment';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCustomerSegments = useCallback(async (storeId: string, query: string, page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosi.get<SearchCustomerSegmentsResponse>(`/customer-segments/search/${storeId}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const { success, data, pagination } = res.data;
      if (!success) throw new Error('Failed to search customer segments');
      setSegments(data);
      return { success, data, pagination };
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to search customer segments';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomerSegmentName = useCallback(async (id: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosi.patch<{ success: boolean; data: CustomerSegment }>(`/customer-segments/${id}`, { name });
      const updated = res.data.data;
      setSegments(prev => prev.map(s => (s._id === updated._id ? updated : s)));
      return updated;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to update customer segment';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<CustomerSegmentContextValue>(() => ({
    segments,
    loading,
    error,
    createCustomerSegment,
    fetchSegmentsByStoreId,
    searchCustomerSegments,
    updateCustomerSegmentName,
  }), [segments, loading, error, createCustomerSegment, fetchSegmentsByStoreId, searchCustomerSegments, updateCustomerSegmentName]);

  return (
    <CustomerSegmentContext.Provider value={value}>
      {children}
    </CustomerSegmentContext.Provider>
  );
};

export const useCustomerSegments = (): CustomerSegmentContextValue => {
  const ctx = useContext(CustomerSegmentContext);
  if (!ctx) throw new Error('useCustomerSegments must be used within a CustomerSegmentProvider');
  return ctx;
};


