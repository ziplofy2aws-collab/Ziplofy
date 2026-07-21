import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface StoreSubdomainDoc {
  _id: string;
  storeId: string;
  subdomain: string;
  customDomain: string | null;
  createdAt: string;
  updatedAt: string;
  url?: string;
}

interface FetchResponse {
  success: boolean;
  data: StoreSubdomainDoc;
}

export interface ValidSubdomainData {
  storeId: string;
  name: string;
  description: string;
}

interface CheckSubdomainResponse {
  success: boolean;
  data: ValidSubdomainData;
}

interface StoreSubdomainContextType {
  storeSubdomain: StoreSubdomainDoc | null;
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<void>;
  validateSubdomain: (subdomain: string) => Promise<ValidSubdomainData | null>;
}

const StoreSubdomainContext = createContext<StoreSubdomainContextType | undefined>(undefined);

export const StoreSubdomainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeSubdomain, setStoreSubdomain] = useState<StoreSubdomainDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.get<FetchResponse>(`/store-subdomain/store/${storeId}`);
      setStoreSubdomain(data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch store subdomain');
      setStoreSubdomain(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateSubdomain = useCallback(async (subdomain: string): Promise<ValidSubdomainData | null> => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.get<CheckSubdomainResponse>(`/store-subdomain/check`, { params: { subdomain } });
      return data.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or unknown subdomain');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: StoreSubdomainContextType = useMemo(() => ({
    storeSubdomain,
    loading,
    error,
    getByStoreId,
    validateSubdomain,
  }), [storeSubdomain, loading, error, getByStoreId, validateSubdomain]);

  return (
    <StoreSubdomainContext.Provider value={value}>
      {children}
    </StoreSubdomainContext.Provider>
  );
};

export const useStoreSubdomain = (): StoreSubdomainContextType => {
  const ctx = useContext(StoreSubdomainContext);
  if (!ctx) throw new Error('useStoreSubdomain must be used within StoreSubdomainProvider');
  return ctx;
};


