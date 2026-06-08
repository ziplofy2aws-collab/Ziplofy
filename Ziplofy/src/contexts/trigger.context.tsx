import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface ExposedVariable {
  path: string;
  label: string;
  type: string; // 'string' | 'number' | 'boolean'
  description?: string;
}

export interface Trigger {
  _id: string;
  key: string;
  name: string;
  description?: string;
  hasConditions: boolean;
  exposedVariables: ExposedVariable[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface TriggerContextType {
  triggers: Trigger[];
  loading: boolean;
  error: string | null;
  getAll: () => Promise<Trigger[]>;
}

const TriggerContext = createContext<TriggerContextType | undefined>(undefined);

export const TriggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<Trigger[]>>('/triggers');
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch triggers');
      setTriggers(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch triggers';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: TriggerContextType = {
    triggers,
    loading,
    error,
    getAll,
  };

  return <TriggerContext.Provider value={value}>{children}</TriggerContext.Provider>;
};

export const useTriggers = (): TriggerContextType => {
  const ctx = useContext(TriggerContext);
  if (!ctx) throw new Error('useTriggers must be used within a TriggerProvider');
  return ctx;
};

export default TriggerContext;


