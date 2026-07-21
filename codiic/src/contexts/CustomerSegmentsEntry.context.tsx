import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface CustomerLite {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
}

export interface CustomerSegmentEntry {
  _id: string;
  segmentId: string;
  customerId: string | CustomerLite; // populated from API on create/fetch
  createdAt: string;
  updatedAt: string;
}

interface CustomerSegmentEntryContextValue {
  entries: CustomerSegmentEntry[];
  loading: boolean;
  error: string | null;
  createEntry: (segmentId: string, customerId: string) => Promise<CustomerSegmentEntry>;
  fetchEntriesBySegmentId: (segmentId: string) => Promise<CustomerSegmentEntry[]>;
  deleteEntry: (entryId: string) => Promise<void>;
}

const CustomerSegmentsEntryContext = createContext<CustomerSegmentEntryContextValue | undefined>(undefined);

export const CustomerSegmentsEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<CustomerSegmentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntriesBySegmentId = useCallback(async (segmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosi.get<{ success: boolean; data: CustomerSegmentEntry[] }>(`/customer-segment-entries/segment/${segmentId}`);
      const list = res.data?.data ?? [];
      setEntries(list);
      return list;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to fetch customer segment entries';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (segmentId: string, customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosi.post<{ success: boolean; data: CustomerSegmentEntry }>(`/customer-segment-entries`, { segmentId, customerId });
      const created = res.data.data;
      setEntries(prev => [created, ...prev]);
      return created;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to add customer to segment';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEntry = useCallback(async (entryId: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosi.delete<{ success: boolean; data: CustomerSegmentEntry }>(`/customer-segment-entries/${entryId}`);
      setEntries(prev => prev.filter(e => e._id !== entryId));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to remove customer from segment';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<CustomerSegmentEntryContextValue>(() => ({
    entries,
    loading,
    error,
    createEntry,
    fetchEntriesBySegmentId,
    deleteEntry,
  }), [entries, loading, error, createEntry, fetchEntriesBySegmentId, deleteEntry]);

  return (
    <CustomerSegmentsEntryContext.Provider value={value}>
      {children}
    </CustomerSegmentsEntryContext.Provider>
  );
};

export const useCustomerSegmentEntries = (): CustomerSegmentEntryContextValue => {
  const ctx = useContext(CustomerSegmentsEntryContext);
  if (!ctx) throw new Error('useCustomerSegmentEntries must be used within a CustomerSegmentsEntryProvider');
  return ctx;
};


