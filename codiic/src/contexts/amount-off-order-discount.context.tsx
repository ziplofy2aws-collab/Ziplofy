import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type AOO_Method = 'discount-code' | 'automatic';
export type AOO_ValueType = 'percentage' | 'fixed-amount';
export type AOO_Eligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';
export type AOO_MinimumPurchase = 'no-requirements' | 'minimum-amount' | 'minimum-quantity';

// Lite populated types from server for eligibility
interface CustomerSegmentLite { _id: string; name: string; }
interface CustomerLite { _id: string; firstName?: string; lastName?: string; email?: string; }

export interface AmountOffOrderDiscount {
  _id: string;
  storeId: string;

  method: AOO_Method;
  discountCode?: string;
  title?: string;

  valueType: AOO_ValueType;
  percentage?: number;
  fixedAmount?: number;

  eligibility: AOO_Eligibility;
  applyOnPOSPro?: boolean;

  minimumPurchase?: AOO_MinimumPurchase;
  minimumAmount?: number;
  minimumQuantity?: number;

  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;

  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;

  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;

  status?: 'active' | 'draft';
  createdAt?: string;
  updatedAt?: string;

  // Populated eligibility targets (or ids)
  targetCustomerSegmentIds?: (string | CustomerSegmentLite)[];
  targetCustomerIds?: (string | CustomerLite)[];
}

export interface CreateAmountOffOrderRequest {
  storeId: string;

  method: AOO_Method;
  discountCode?: string;
  title?: string;

  valueType: AOO_ValueType;
  percentage?: number;
  fixedAmount?: number;

  eligibility: AOO_Eligibility;
  applyOnPOSPro?: boolean;

  minimumPurchase?: AOO_MinimumPurchase;
  minimumAmount?: number;
  minimumQuantity?: number;

  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;

  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;

  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;

  status?: 'active' | 'draft';

  // Eligibility targets
  targetCustomerSegmentIds?: string[];
  targetCustomerIds?: string[];
}

export interface CreateAmountOffOrderResponse {
  success: boolean;
  message: string;
  data: AmountOffOrderDiscount;
}

export interface FetchAmountOffOrderResponse {
  success: boolean;
  data: AmountOffOrderDiscount[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetAmountOffOrderByIdResponse {
  success: boolean;
  data: AmountOffOrderDiscount;
}

export interface UpdateAmountOffOrderResponse {
  success: boolean;
  message?: string;
  data: AmountOffOrderDiscount;
}

export interface AmountOffOrderDiscountUsageOrder {
  usage: { usedAt: string };
  customer: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  order: {
    _id: string;
    orderDate: string;
    status: string;
    subtotal: number;
    shippingCost: number;
    total: number;
    shippingAddress?: unknown;
  } | null;
}

export interface GetOrdersByAmountOffOrderDiscountResponse {
  success: boolean;
  data: AmountOffOrderDiscountUsageOrder[];
  discount: { _id: string; title?: string; discountCode?: string; method: string };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface AmountOffOrderContextType {
  discounts: AmountOffOrderDiscount[];
  loading: boolean;
  error: string | null;
  pagination: FetchAmountOffOrderResponse['pagination'] | null;

  createDiscount: (payload: CreateAmountOffOrderRequest) => Promise<CreateAmountOffOrderResponse>;
  updateDiscount: (discountId: string, payload: CreateAmountOffOrderRequest) => Promise<UpdateAmountOffOrderResponse>;
  deleteDiscount: (discountId: string) => Promise<{ success: boolean; message?: string }>;
  fetchDiscountById: (discountId: string) => Promise<GetAmountOffOrderByIdResponse>;
  fetchDiscountsByStoreId: (storeId: string, opts?: { page?: number; limit?: number; status?: 'active' | 'draft'; method?: AOO_Method; }) => Promise<FetchAmountOffOrderResponse>;
  fetchOrdersByDiscountId: (discountId: string, opts?: { page?: number; limit?: number }) => Promise<GetOrdersByAmountOffOrderDiscountResponse>;
  clearError: () => void;
  setDiscounts: (items: AmountOffOrderDiscount[]) => void;
}

const AmountOffOrderContext = createContext<AmountOffOrderContextType | undefined>(undefined);

export const AmountOffOrderDiscountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [discounts, setDiscounts] = useState<AmountOffOrderDiscount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<FetchAmountOffOrderResponse['pagination'] | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const createDiscount = useCallback(async (payload: CreateAmountOffOrderRequest): Promise<CreateAmountOffOrderResponse> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateAmountOffOrderResponse>('/amount-off-order-discounts', payload);
      if (res.data?.success && res.data?.data) {
        // Refetch full discount (with targetCustomerSegmentIds/targetCustomerIds) to keep list in sync
        try {
          const byIdRes = await axiosi.get<GetAmountOffOrderByIdResponse>(`/amount-off-order-discounts/${res.data.data._id}`);
          if (byIdRes.data?.success && byIdRes.data?.data) {
            setDiscounts(prev => [byIdRes.data!.data, ...prev]);
            return { ...res.data, data: byIdRes.data.data };
          }
        } catch (_) {}
        setDiscounts(prev => [res.data!.data, ...prev]);
      }
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to create Amount Off Order discount';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiscountById = useCallback(async (discountId: string): Promise<GetAmountOffOrderByIdResponse> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetAmountOffOrderByIdResponse>(`/amount-off-order-discounts/${discountId}`);
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to fetch Amount Off Order discount';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDiscount = useCallback(async (discountId: string, payload: CreateAmountOffOrderRequest): Promise<UpdateAmountOffOrderResponse> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<UpdateAmountOffOrderResponse>(`/amount-off-order-discounts/${discountId}`, payload);
      if (res.data?.success) {
        // Refetch by ID to get populated targetCustomerSegmentIds/targetCustomerIds
        try {
          const byIdRes = await axiosi.get<GetAmountOffOrderByIdResponse>(`/amount-off-order-discounts/${discountId}`);
          if (byIdRes.data?.success && byIdRes.data?.data) {
            const fullData = byIdRes.data.data;
            setDiscounts(prev => {
              const next = prev.map(d => d._id === discountId ? fullData : d);
              if (!next.some(d => d._id === discountId)) return [fullData, ...next];
              return next;
            });
            return { ...res.data, data: fullData };
          }
        } catch (_) {}
        setDiscounts(prev => {
          const next = prev.map(d => d._id === discountId ? res.data!.data : d);
          if (!next.some(d => d._id === discountId)) return [res.data!.data, ...next];
          return next;
        });
      }
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update Amount Off Order discount';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDiscount = useCallback(async (discountId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<{ success: boolean; message?: string }>(`/amount-off-order-discounts/${discountId}`);
      if (res.data?.success) {
        setDiscounts(prev => prev.filter(d => d._id !== discountId));
      }
      return res.data ?? { success: false };
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to delete Amount Off Order discount';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiscountsByStoreId = useCallback(async (storeId: string, opts?: { page?: number; limit?: number; status?: 'active' | 'draft'; method?: AOO_Method; }): Promise<FetchAmountOffOrderResponse> => {
    try {
      setLoading(true);
      setError(null);
      const q = new URLSearchParams();
      if (opts?.page) q.append('page', String(opts.page));
      if (opts?.limit) q.append('limit', String(opts.limit));
      if (opts?.status) q.append('status', opts.status);
      if (opts?.method) q.append('method', opts.method);
      const res = await axiosi.get<FetchAmountOffOrderResponse>(`/amount-off-order-discounts/store/${storeId}${q.toString() ? `?${q.toString()}` : ''}`);
      if (res.data?.success) {
        setDiscounts(res.data.data || []);
        setPagination(res.data.pagination || null);
      }
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to fetch Amount Off Order discounts';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrdersByDiscountId = useCallback(async (discountId: string, opts?: { page?: number; limit?: number }): Promise<GetOrdersByAmountOffOrderDiscountResponse> => {
    try {
      setLoading(true);
      setError(null);
      const q = new URLSearchParams();
      if (opts?.page) q.append('page', String(opts.page));
      if (opts?.limit) q.append('limit', String(opts.limit));
      const res = await axiosi.get<GetOrdersByAmountOffOrderDiscountResponse>(`/amount-off-order-discounts/${discountId}/orders${q.toString() ? `?${q.toString()}` : ''}`);
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to fetch orders for this discount';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AmountOffOrderContextType>(() => ({
    discounts,
    loading,
    error,
    pagination,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    fetchDiscountById,
    fetchDiscountsByStoreId,
    fetchOrdersByDiscountId,
    clearError,
    setDiscounts,
  }), [discounts, loading, error, pagination, createDiscount, updateDiscount, deleteDiscount, fetchDiscountById, fetchDiscountsByStoreId, fetchOrdersByDiscountId, clearError]);

  return (
    <AmountOffOrderContext.Provider value={value}>{children}</AmountOffOrderContext.Provider>
  );
};

export const useAmountOffOrderDiscount = (): AmountOffOrderContextType => {
  const ctx = useContext(AmountOffOrderContext);
  if (!ctx) throw new Error('useAmountOffOrderDiscount must be used within an AmountOffOrderDiscountProvider');
  return ctx;
};

export default AmountOffOrderContext;
