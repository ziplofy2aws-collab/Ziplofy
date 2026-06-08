import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';
import { toast } from 'react-hot-toast';

export type TriggerKey = 'add_to_cart';

export interface AutomationFlow {
  _id: string;
  storeId: string;
  name: string;
  description?: string;
  triggerId: string;
  triggerKey: TriggerKey;
  isActive: boolean;
  flowData: any;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateAutomationFlowPayload {
  storeId: string;
  name: string;
  description?: string;
  triggerId: string;
  triggerKey: TriggerKey;
  isActive?: boolean;
  flowData: any;
}

interface AutomationFlowContextType {
  flows: AutomationFlow[];
  loading: boolean;
  error: string | null;
  getByStoreId: (storeId: string) => Promise<AutomationFlow[]>;
  create: (payload: CreateAutomationFlowPayload) => Promise<AutomationFlow>;
  update: (automationFlowId: string, payload: Partial<CreateAutomationFlowPayload & { isActive: boolean }>) => Promise<AutomationFlow>;
}

const AutomationFlowContext = createContext<AutomationFlowContextType | undefined>(undefined);

export const AutomationFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<AutomationFlow[]>>(`/automation-flows/${encodeURIComponent(storeId)}`);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch automation flows');
      setFlows(data || []);
      return data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch automation flows';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateAutomationFlowPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<AutomationFlow>>('/automation-flows', payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to create automation flow');
      setFlows((prev) => [data, ...prev]);
      toast.success('Automation flow created successfully');
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create automation flow';
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (automationFlowId: string, payload: Partial<CreateAutomationFlowPayload & { isActive: boolean }>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<ApiResponse<AutomationFlow>>(`/automation-flows/${encodeURIComponent(automationFlowId)}`, payload);
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to update automation flow');
      setFlows((prev) => prev.map((f) => (f._id === data._id ? data : f)));
      toast.success('Automation flow updated successfully');
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update automation flow';
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AutomationFlowContextType = {
    flows,
    loading,
    error,
    getByStoreId,
    create,
    update,
  };

  return <AutomationFlowContext.Provider value={value}>{children}</AutomationFlowContext.Provider>;
};

export const useAutomationFlows = (): AutomationFlowContextType => {
  const ctx = useContext(AutomationFlowContext);
  if (!ctx) throw new Error('useAutomationFlows must be used within an AutomationFlowProvider');
  return ctx;
};

export default AutomationFlowContext;


