import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface DnsInstruction {
  type: 'CNAME' | 'A' | 'TXT';
  host: string;
  value: string;
  purpose: string;
}

export type DomainListStatus = 'pending' | 'verifying' | 'active' | 'failed' | 'connected';

export interface StoreDomainItem {
  id: string;
  hostname: string;
  type: 'platform' | 'connected';
  status: DomainListStatus;
  isPrimary: boolean;
  url: string;
  dnsInstructions: DnsInstruction[];
  verificationToken: string | null;
  lastError: string | null;
  verifiedAt: string | null;
}

interface ListResponse {
  success: boolean;
  data: StoreDomainItem[];
  message?: string;
}

interface DomainMutationResponse {
  success: boolean;
  data: StoreDomainItem | { domain: StoreDomainItem; dns?: unknown };
  message?: string;
}

interface DomainsContextType {
  domains: StoreDomainItem[];
  loading: boolean;
  error: string | null;
  pendingConnect: StoreDomainItem | null;
  listByStoreId: (storeId: string) => Promise<StoreDomainItem[]>;
  connect: (storeId: string, hostname: string) => Promise<StoreDomainItem>;
  verify: (storeId: string, domainId: string) => Promise<StoreDomainItem>;
  disconnect: (storeId: string, domainId: string) => Promise<void>;
  clearPendingConnect: () => void;
  clearError: () => void;
}

const DomainsContext = createContext<DomainsContextType | undefined>(undefined);

function asDomainItem(raw: any): StoreDomainItem {
  return {
    id: String(raw._id || raw.id),
    hostname: raw.hostname,
    type: raw.type || 'connected',
    status: raw.status,
    isPrimary: Boolean(raw.isPrimary),
    url: raw.url || `https://${raw.hostname}`,
    dnsInstructions: raw.dnsInstructions || [],
    verificationToken: raw.verificationToken ?? null,
    lastError: raw.lastError ?? null,
    verifiedAt: raw.verifiedAt ?? null,
  };
}

export const DomainsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [domains, setDomains] = useState<StoreDomainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConnect, setPendingConnect] = useState<StoreDomainItem | null>(null);

  const listByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.get<ListResponse>(`/domains/store/${storeId}`);
      const list = data.data || [];
      setDomains(list);
      return list;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to load domains';
      setError(message);
      setDomains([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async (storeId: string, hostname: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.post<DomainMutationResponse>('/domains/connect', {
        storeId,
        hostname,
      });
      const item = asDomainItem((data.data as any)?._id ? data.data : (data.data as any));
      setPendingConnect(item);
      await listByStoreId(storeId);
      return item;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to connect domain';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [listByStoreId]);

  const verify = useCallback(async (storeId: string, domainId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.post<DomainMutationResponse>('/domains/verify', {
        storeId,
        domainId,
      });
      const raw = (data.data as any)?.domain || data.data;
      const item = asDomainItem(raw);
      setPendingConnect(null);
      await listByStoreId(storeId);
      return item;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'DNS verification failed';
      setError(message);
      await listByStoreId(storeId).catch(() => undefined);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [listByStoreId]);

  const disconnect = useCallback(async (storeId: string, domainId: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosi.delete(`/domains/${domainId}`, { params: { storeId } });
      if (pendingConnect?.id === domainId) setPendingConnect(null);
      await listByStoreId(storeId);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to disconnect domain';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [listByStoreId, pendingConnect?.id]);

  const clearPendingConnect = useCallback(() => setPendingConnect(null), []);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      domains,
      loading,
      error,
      pendingConnect,
      listByStoreId,
      connect,
      verify,
      disconnect,
      clearPendingConnect,
      clearError,
    }),
    [
      domains,
      loading,
      error,
      pendingConnect,
      listByStoreId,
      connect,
      verify,
      disconnect,
      clearPendingConnect,
      clearError,
    ]
  );

  return <DomainsContext.Provider value={value}>{children}</DomainsContext.Provider>;
};

export const useDomains = (): DomainsContextType => {
  const ctx = useContext(DomainsContext);
  if (!ctx) throw new Error('useDomains must be used within DomainsProvider');
  return ctx;
};
