import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

export interface OrderTimelineEntry {
  _id: string;
  orderId: string;
  type: 'comment' | 'event';
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderTimelineEntryRequest {
  orderId: string;
  comment: string;
  type?: 'comment' | 'event';
}

export interface UpdateOrderTimelineEntryRequest {
  comment: string;
}

interface CreateOrderTimelineEntryResponse {
  success: boolean;
  data: OrderTimelineEntry;
  message: string;
}

interface GetOrderTimelineByOrderIdResponse {
  success: boolean;
  data: OrderTimelineEntry[];
  count: number;
}

interface UpdateOrderTimelineEntryResponse {
  success: boolean;
  data: OrderTimelineEntry;
  message: string;
}

interface DeleteOrderTimelineEntryResponse {
  success: boolean;
  data: {
    deletedTimelineEntry: {
      id: string;
      orderId: string;
      type: string;
      comment: string;
    };
  };
  message: string;
}

interface OrderTimelineContextType {
  timelineEntries: OrderTimelineEntry[];
  loading: boolean;
  error: string | null;
  getTimelineByOrderId: (orderId: string) => Promise<void>;
  createTimelineEntry: (payload: CreateOrderTimelineEntryRequest) => Promise<OrderTimelineEntry>;
  updateTimelineEntry: (timelineId: string, payload: UpdateOrderTimelineEntryRequest) => Promise<OrderTimelineEntry>;
  deleteTimelineEntry: (timelineId: string) => Promise<void>;
  clearError: () => void;
  clearTimelineEntries: () => void;
}

const OrderTimelineContext = createContext<OrderTimelineContextType | undefined>(undefined);

export const OrderTimelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timelineEntries, setTimelineEntries] = useState<OrderTimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTimelineByOrderId = useCallback(async (orderId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.get<GetOrderTimelineByOrderIdResponse>(`/order-timeline/order/${orderId}`);
      const { success, data } = response.data;
      if (success) {
        setTimelineEntries(data);
      } else {
        setError('Failed to fetch timeline entries');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to fetch timeline entries';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTimelineEntry = useCallback(
    async (payload: CreateOrderTimelineEntryRequest): Promise<OrderTimelineEntry> => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.post<CreateOrderTimelineEntryResponse>('/order-timeline', payload);
        const { success, data } = response.data;
        if (success) {
          setTimelineEntries((prev) => [data, ...prev]);
          return data;
        }
        throw new Error('Failed to create timeline entry');
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to create timeline entry';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTimelineEntry = useCallback(
    async (timelineId: string, payload: UpdateOrderTimelineEntryRequest): Promise<OrderTimelineEntry> => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.put<UpdateOrderTimelineEntryResponse>(`/order-timeline/${timelineId}`, payload);
        const { success, data } = response.data;
        if (success) {
          setTimelineEntries((prev) => prev.map((entry) => (entry._id === timelineId ? data : entry)));
          return data;
        }
        throw new Error('Failed to update timeline entry');
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to update timeline entry';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTimelineEntry = useCallback(async (timelineId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.delete<DeleteOrderTimelineEntryResponse>(`/order-timeline/${timelineId}`);
      if (response.data.success) {
        setTimelineEntries((prev) => prev.filter((entry) => entry._id !== timelineId));
      } else {
        throw new Error('Failed to delete timeline entry');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to delete timeline entry';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const clearTimelineEntries = useCallback(() => {
    setTimelineEntries([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: OrderTimelineContextType = {
    timelineEntries,
    loading,
    error,
    getTimelineByOrderId,
    createTimelineEntry,
    updateTimelineEntry,
    deleteTimelineEntry,
    clearError,
    clearTimelineEntries,
  };

  return <OrderTimelineContext.Provider value={value}>{children}</OrderTimelineContext.Provider>;
};

export const useOrderTimeline = (): OrderTimelineContextType => {
  const context = useContext(OrderTimelineContext);
  if (!context) {
    throw new Error('useOrderTimeline must be used within an OrderTimelineProvider');
  }
  return context;
};

export default OrderTimelineContext;
