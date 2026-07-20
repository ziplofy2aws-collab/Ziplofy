import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface StateCountryRef {
  _id: string;
  name: string;
  iso2: string;
  iso3?: string;
}

export interface StateItem {
  _id: string;
  name: string;
  code: string;
  countryId: string | StateCountryRef;
  countryIso2: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: any;
}

export interface GetStatesParams {
  countryId?: string;
  countryIso2?: string;
  q?: string;
  page?: number;
  limit?: number;
}

interface StateContextValue {
  states: StateItem[];
  statesByCountry: Record<string, StateItem[]>;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  getStates: (params?: GetStatesParams) => Promise<StateItem[]>;
  getStatesByCountryId: (countryId: string, forceRefresh?: boolean) => Promise<StateItem[]>;
  clearStatesByCountry: (countryId?: string) => void;
}

const StateContext = createContext<StateContextValue | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [states, setStates] = useState<StateItem[]>([]);
  const [statesByCountry, setStatesByCountry] = useState<Record<string, StateItem[]>>({});
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getStates = useCallback(async (params: GetStatesParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (params.countryId) query.set('countryId', params.countryId);
      if (params.countryIso2) query.set('countryIso2', params.countryIso2);
      if (params.q) query.set('q', params.q);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));

      const queryString = query.toString();
      const url = queryString ? `/states?${queryString}` : '/states';

      const res = await axiosi.get<ApiResponse<StateItem[]>>(url);
      const { success, data, message, meta } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch states');

      const items = data || [];
      setStates(items);

      if (params.countryId && items.length) {
        setStatesByCountry((prev) => ({
          ...prev,
          [params.countryId as string]: items,
        }));
      }

      if (meta) {
        setTotal(meta.total ?? items.length);
        setPage(meta.page ?? 1);
        setLimit((meta.limit ?? items.length) || 50);
      } else {
        setTotal(items.length);
      }

      return items;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch states';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatesByCountryId = useCallback(
    async (countryId: string, forceRefresh = false) => {
      if (!countryId) {
        throw new Error('countryId is required');
      }

      if (!forceRefresh && statesByCountry[countryId]) {
        return statesByCountry[countryId];
      }

      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.get<ApiResponse<StateItem[]>>(`/states/country/${countryId}`);
        const { success, data, message, meta } = res.data;
        if (!success) throw new Error(message || 'Failed to fetch states');

        const items = data || [];
        setStates(items);
        setStatesByCountry((prev) => ({
          ...prev,
          [countryId]: items,
        }));

        if (meta?.total != null) {
          setTotal(meta.total);
        } else {
          setTotal(items.length);
        }

        setPage(1);
        setLimit(items.length || 50);

        return items;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to fetch states';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [statesByCountry]
  );

  const clearStatesByCountry = useCallback((countryId?: string) => {
    if (!countryId) {
      setStatesByCountry({});
      return;
    }
    setStatesByCountry((prev) => {
      const { [countryId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const value = useMemo<StateContextValue>(
    () => ({
      states,
      statesByCountry,
      loading,
      error,
      total,
      page,
      limit,
      getStates,
      getStatesByCountryId,
      clearStatesByCountry,
    }),
    [
      states,
      statesByCountry,
      loading,
      error,
      total,
      page,
      limit,
      getStates,
      getStatesByCountryId,
      clearStatesByCountry,
    ]
  );

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
};

export const useStates = (): StateContextValue => {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useStates must be used within a StateProvider');
  return ctx;
};

export default StateContext;

