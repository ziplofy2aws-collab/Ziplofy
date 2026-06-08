import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type StoreRole = {
  _id: string;
  storeId: string;
  name: string;
  description?: string;
  permissions: string[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

interface StoreRolesContextType {
  roles: StoreRole[];
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<StoreRole[]>;
  create: (payload: Partial<StoreRole> & { storeId: string; name: string; permissions?: string[] }) => Promise<StoreRole>;
  update: (roleId: string, payload: Partial<StoreRole>) => Promise<StoreRole>;
  remove: (roleId: string) => Promise<StoreRole>;
  clear: () => void;
  clearError: () => void;
}

const StoreRolesContext = createContext<StoreRolesContextType | undefined>(undefined);

export const StoreRolesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<StoreRole[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreRole[]>>('/store-roles', { params: { storeId } });
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch roles');
      const list = Array.isArray(data) ? data : [];
      setRoles(list);
      return list;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch roles';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Partial<StoreRole> & { storeId: string; name: string; permissions?: string[] }) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<StoreRole>>('/store-roles', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create role');
      setRoles((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create role';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (roleId: string, payload: Partial<StoreRole>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.patch<ApiResponse<StoreRole>>(`/store-roles/${roleId}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update role');
      setRoles((prev) => prev.map((r) => (r._id === roleId ? data : r)));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update role';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (roleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<StoreRole>>(`/store-roles/${roleId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete role');
      setRoles((prev) => prev.filter((r) => r._id !== roleId));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete role';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setRoles([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<StoreRolesContextType>(() => ({
    roles,
    loading,
    error,
    fetchByStoreId,
    create,
    update,
    remove,
    clear,
    clearError,
  }), [roles, loading, error, fetchByStoreId, create, update, remove, clear, clearError]);

  return (
    <StoreRolesContext.Provider value={value}>
      {children}
    </StoreRolesContext.Provider>
  );
};

export const useStoreRoles = (): StoreRolesContextType => {
  const ctx = useContext(StoreRolesContext);
  if (!ctx) throw new Error('useStoreRoles must be used within a StoreRolesProvider');
  return ctx;
};

export default StoreRolesContext;


