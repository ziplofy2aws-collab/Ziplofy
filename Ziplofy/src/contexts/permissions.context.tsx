import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type PermissionDefinition = {
  _id: string;
  key: string;
  name: string;
  resource?: string;
  parentKey?: string | null;
  implies?: string[];
  isLeaf: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

interface PermissionsContextType {
  permissions: PermissionDefinition[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<PermissionDefinition[]>;
  clear: () => void;
  clearError: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<PermissionDefinition[]>>('/permissions');
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch permissions');
      const list = Array.isArray(data) ? data : [];
      setPermissions(list);
      return list;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch permissions';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPermissions([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<PermissionsContextType>(() => ({
    permissions,
    loading,
    error,
    fetchAll,
    clear,
    clearError,
  }), [permissions, loading, error, fetchAll, clear, clearError]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissions must be used within a PermissionsProvider');
  return ctx;
};

export default PermissionsContext;


