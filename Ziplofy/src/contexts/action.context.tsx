import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type ActionType =
  | 'send_email'
  | 'send_sms'
  | 'send_push_notification'
  | 'send_whatsapp_message';

export interface ActionItem {
  _id: string;
  actionType: ActionType;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface ActionContextType {
  actions: ActionItem[];
  loading: boolean;
  error: string | null;
  getAll: () => Promise<ActionItem[]>;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const ActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<ActionItem[]>>('/actions');
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch actions');
      setActions(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch actions';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: ActionContextType = {
    actions,
    loading,
    error,
    getAll,
  };

  return <ActionContext.Provider value={value}>{children}</ActionContext.Provider>;
};

export const useActions = (): ActionContextType => {
  const ctx = useContext(ActionContext);
  if (!ctx) throw new Error('useActions must be used within an ActionProvider');
  return ctx;
};

export default ActionContext;


