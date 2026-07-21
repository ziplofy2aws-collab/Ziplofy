import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type StoreNotificationOverride = {
  _id: string;
  storeId: string;
  notificationOptionId: string;
  notificationKey: string;
  emailSubject?: string;
  emailBody?: string;
  smsData?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type OverrideSummary = {
  _id: string;
  storeId: string;
  notificationOptionId: string;
  notificationKey: string;
  emailSubject?: string;
  emailBody?: string;
  smsData?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type ExistsResponse = {
  exists: boolean;
  override?: OverrideSummary | null;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

interface NotificationOverridesContextType {
  cache: Record<string, ExistsResponse>;
  loading: boolean;
  error: string | null;
  checkExists: (storeId: string, optionId: string, forceRefresh?: boolean) => Promise<ExistsResponse>;
  create: (payload: {
    storeId: string;
    notificationOptionId: string;
    emailSubject?: string;
    emailBody?: string;
    smsData?: string;
    enabled?: boolean;
  }) => Promise<StoreNotificationOverride>;
  remove: (overrideId: string) => Promise<StoreNotificationOverride>;
  clear: () => void;
  clearError: () => void;
  clearCacheEntry: (storeId: string, optionId: string) => void;
}

const NotificationOverridesContext = createContext<NotificationOverridesContextType | undefined>(undefined);

export const NotificationOverridesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<Record<string, ExistsResponse>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkExists = useCallback(
    async (storeId: string, optionId: string, forceRefresh = false): Promise<ExistsResponse> => {
      const key = `${storeId}:${optionId}`;
      if (!forceRefresh && cache[key]) {
        return cache[key];
      }
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.get<ApiResponse<{ exists: boolean; override?: OverrideSummary }>>(
          '/notification-overrides/exists',
          { params: { storeId, optionId } }
        );
        const { success, data, message } = res.data;
        if (!success) throw new Error(message || 'Failed to check override existence');
        const payload: ExistsResponse = {
          exists: Boolean(data?.exists),
          override: data?.override ?? null,
        };
        setCache((prev) => ({ ...prev, [key]: payload }));
        return payload;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to check override existence';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [cache]
  );

  const clearCacheEntry = useCallback((storeId: string, optionId: string) => {
    const key = `${storeId}:${optionId}`;
    setCache((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setCache({});
    setError(null);
  }, []);

  const create = useCallback(
    async (payload: {
      storeId: string;
      notificationOptionId: string;
      emailSubject?: string;
      emailBody?: string;
      smsData?: string;
      enabled?: boolean;
    }): Promise<StoreNotificationOverride> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.post<ApiResponse<StoreNotificationOverride>>('/notification-overrides', payload);
        const { success, data, message } = res.data;
        if (!success) throw new Error(message || 'Failed to create notification override');

        // Update cache to reflect the new override
        const key = `${payload.storeId}:${payload.notificationOptionId}`;
        setCache((prev) => ({
          ...prev,
          [key]: {
            exists: true,
            override: {
              _id: data._id,
              storeId: data.storeId,
              notificationOptionId: data.notificationOptionId,
              notificationKey: data.notificationKey,
              emailSubject: data.emailSubject,
              emailBody: data.emailBody,
              smsData: data.smsData,
              enabled: data.enabled,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            },
          },
        }));

        return data;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to create notification override';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const remove = useCallback(async (overrideId: string): Promise<StoreNotificationOverride> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<ApiResponse<StoreNotificationOverride>>(`/notification-overrides/${overrideId}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to delete notification override');

      // Update cache to reflect the deleted override
      const key = `${data.storeId}:${data.notificationOptionId}`;
      setCache((prev) => ({
        ...prev,
        [key]: {
          exists: false,
          override: null,
        },
      }));

      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete notification override';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: NotificationOverridesContextType = useMemo(
    () => ({
      cache,
      loading,
      error,
      checkExists,
      create,
      remove,
      clear,
      clearError,
      clearCacheEntry,
    }),
    [cache, loading, error, checkExists, create, remove, clear, clearError, clearCacheEntry]
  );

  return (
    <NotificationOverridesContext.Provider value={value}>
      {children}
    </NotificationOverridesContext.Provider>
  );
};

export const useNotificationOverrides = (): NotificationOverridesContextType => {
  const ctx = useContext(NotificationOverridesContext);
  if (!ctx) throw new Error('useNotificationOverrides must be used within a NotificationOverridesProvider');
  return ctx;
};

export default NotificationOverridesContext;


