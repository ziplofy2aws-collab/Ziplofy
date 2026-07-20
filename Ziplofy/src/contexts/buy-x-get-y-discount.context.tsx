import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type BXGYMethod = 'discount-code' | 'automatic';
export type BXGYCustomerBuys = 'minimum-quantity' | 'minimum-amount';
export type BXGYAnyItemsFrom = 'specific-products' | 'specific-collections';
export type BXGYGetsFrom = 'specific-products' | 'specific-collections';
export type BXGYDiscountedValue = 'free' | 'amount' | 'percentage';
export type BXGYEligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';

// Lite populated types from server
interface ProductLite { _id: string; title?: string; sku?: string; imageUrls?: string[]; }
interface CollectionLite { _id: string; title?: string; description?: string; }
interface CustomerSegmentLite { _id: string; name: string; }
interface CustomerLite { _id: string; firstName?: string; lastName?: string; email?: string; }

export interface BuyXGetYDiscount {
  _id: string;
  storeId: string;
  method: BXGYMethod;
  discountCode?: string;
  title?: string;
  allowDiscountOnChannels?: boolean;

  customerBuys: BXGYCustomerBuys;
  quantity?: number;
  amount?: number;
  anyItemsFrom: BXGYAnyItemsFrom;

  customerGetsQuantity: number;
  customerGetsAnyItemsFrom: BXGYGetsFrom;
  discountedValue: BXGYDiscountedValue;
  discountedAmount?: number;
  discountedPercentage?: number;

  setMaxUsersPerOrder?: boolean;
  maxUsersPerOrder?: number;

  eligibility: BXGYEligibility;
  applyOnPOSPro?: boolean;

  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;

  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;

  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;

  status?: 'active' | 'draft';
  createdAt?: string;
  updatedAt?: string;

  // Aggregated targets when fetching (populated objects or ids)
  buysProductIds?: (string | ProductLite)[];
  buysCollectionIds?: (string | CollectionLite)[];
  getsProductIds?: (string | ProductLite)[];
  getsCollectionIds?: (string | CollectionLite)[];
  targetCustomerSegmentIds?: (string | CustomerSegmentLite)[];
  targetCustomerIds?: (string | CustomerLite)[];
}

export interface CreateBuyXGetYRequest {
  storeId: string;

  method: BXGYMethod;
  discountCode?: string;
  title?: string;
  allowDiscountOnChannels?: boolean;

  customerBuys: BXGYCustomerBuys;
  quantity?: number;
  amount?: number;
  anyItemsFrom: BXGYAnyItemsFrom;

  customerGetsQuantity: number;
  customerGetsAnyItemsFrom: BXGYGetsFrom;
  discountedValue: BXGYDiscountedValue;
  discountedAmount?: number;
  discountedPercentage?: number;

  setMaxUsersPerOrder?: boolean;
  maxUsersPerOrder?: number;

  eligibility: BXGYEligibility;
  applyOnPOSPro?: boolean;

  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;

  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;

  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;

  status?: 'active' | 'draft';

  // Targets
  buysProductIds?: string[];
  buysCollectionIds?: string[];
  getsProductIds?: string[];
  getsCollectionIds?: string[];
  targetCustomerSegmentIds?: string[];
  targetCustomerIds?: string[];
}

export interface CreateBuyXGetYResponse {
  success: boolean;
  message: string;
  data: BuyXGetYDiscount;
}

export interface FetchBuyXGetYResponse {
  success: boolean;
  data: BuyXGetYDiscount[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetBuyXGetYDiscountByIdResponse {
  success: boolean;
  data: BuyXGetYDiscount;
}

export interface UpdateBuyXGetYResponse {
  success: boolean;
  message: string;
  data: BuyXGetYDiscount;
}

export interface BuyXGetYDiscountUsageOrder {
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

export interface GetOrdersByBuyXGetYDiscountResponse {
  success: boolean;
  data: BuyXGetYDiscountUsageOrder[];
  discount: { _id: string; title?: string; discountCode?: string; method: string };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface BuyXGetYContextType {
  discounts: BuyXGetYDiscount[];
  loading: boolean;
  error: string | null;
  pagination: FetchBuyXGetYResponse['pagination'] | null;

  createDiscount: (payload: CreateBuyXGetYRequest) => Promise<CreateBuyXGetYResponse>;
  updateDiscount: (discountId: string, payload: CreateBuyXGetYRequest) => Promise<UpdateBuyXGetYResponse>;
  deleteDiscount: (discountId: string) => Promise<{ success: boolean; message: string }>;
  fetchDiscountsByStoreId: (storeId: string, opts?: { page?: number; limit?: number; status?: 'active' | 'draft'; method?: BXGYMethod; }) => Promise<FetchBuyXGetYResponse>;
  fetchDiscountById: (discountId: string) => Promise<GetBuyXGetYDiscountByIdResponse>;
  fetchOrdersByDiscountId: (discountId: string, opts?: { page?: number; limit?: number }) => Promise<GetOrdersByBuyXGetYDiscountResponse>;
  clearError: () => void;
  setDiscounts: (items: BuyXGetYDiscount[]) => void;
}

const BuyXGetYContext = createContext<BuyXGetYContextType | undefined>(undefined);

export const BuyXGetYDiscountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [discounts, setDiscounts] = useState<BuyXGetYDiscount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<FetchBuyXGetYResponse['pagination'] | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const createDiscount = useCallback(async (payload: CreateBuyXGetYRequest): Promise<CreateBuyXGetYResponse> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateBuyXGetYResponse>('/buy-x-get-y-discounts', payload);
      if (res.data?.success && res.data?.data) {
        setDiscounts(prev => [res.data.data, ...prev]);
      }
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to create Buy X Get Y discount';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiscountsByStoreId = useCallback(async (storeId: string, opts?: { page?: number; limit?: number; status?: 'active' | 'draft'; method?: BXGYMethod; }): Promise<FetchBuyXGetYResponse> => {
    try {
      setLoading(true);
      setError(null);
      const q = new URLSearchParams();
      if (opts?.page) q.append('page', String(opts.page));
      if (opts?.limit) q.append('limit', String(opts.limit));
      if (opts?.status) q.append('status', opts.status);
      if (opts?.method) q.append('method', opts.method);
      const res = await axiosi.get<FetchBuyXGetYResponse>(`/buy-x-get-y-discounts/store/${storeId}${q.toString() ? `?${q.toString()}` : ''}`);
      if (res.data?.success) {
        setDiscounts(res.data.data || []);
        setPagination(res.data.pagination || null);
      }
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to fetch Buy X Get Y discounts';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiscountById = useCallback(async (discountId: string): Promise<GetBuyXGetYDiscountByIdResponse> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetBuyXGetYDiscountByIdResponse>(`/buy-x-get-y-discounts/${discountId}`);
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to fetch discount';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrdersByDiscountId = useCallback(
    async (discountId: string, opts?: { page?: number; limit?: number }): Promise<GetOrdersByBuyXGetYDiscountResponse> => {
      try {
        setLoading(true);
        setError(null);
        const q = new URLSearchParams();
        if (opts?.page) q.append('page', String(opts.page));
        if (opts?.limit) q.append('limit', String(opts.limit));
        const res = await axiosi.get<GetOrdersByBuyXGetYDiscountResponse>(
          `/buy-x-get-y-discounts/${discountId}/orders${q.toString() ? `?${q.toString()}` : ''}`
        );
        return res.data;
      } catch (e: any) {
        const msg = e?.response?.data?.error || e?.message || 'Failed to fetch orders for this discount';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateDiscount = useCallback(async (discountId: string, payload: CreateBuyXGetYRequest): Promise<UpdateBuyXGetYResponse> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<UpdateBuyXGetYResponse>(`/buy-x-get-y-discounts/${discountId}`, payload);
      if (res.data?.success && res.data?.data) {
        // Refetch full discount (with populated targets) so list stays in sync with getById/list shape
        try {
          const fullRes = await axiosi.get<GetBuyXGetYDiscountByIdResponse>(`/buy-x-get-y-discounts/${discountId}`);
          if (fullRes.data?.success && fullRes.data?.data) {
            setDiscounts(prev => prev.map(d => d._id === discountId ? fullRes.data!.data : d));
          } else {
            setDiscounts(prev => prev.map(d => d._id === discountId ? res.data!.data : d));
          }
        } catch {
          setDiscounts(prev => prev.map(d => d._id === discountId ? res.data!.data : d));
        }
      }
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update Buy X Get Y discount';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDiscount = useCallback(async (discountId: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<{ success: boolean; message: string }>(`/buy-x-get-y-discounts/${discountId}`);
      if (res.data?.success) {
        setDiscounts(prev => prev.filter(d => d._id !== discountId));
      }
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to delete Buy X Get Y discount';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<BuyXGetYContextType>(() => ({
    discounts,
    loading,
    error,
    pagination,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    fetchDiscountsByStoreId,
    fetchDiscountById,
    fetchOrdersByDiscountId,
    clearError,
    setDiscounts,
  }), [discounts, loading, error, pagination, createDiscount, updateDiscount, deleteDiscount, fetchDiscountsByStoreId, fetchDiscountById, fetchOrdersByDiscountId, clearError]);

  return (
    <BuyXGetYContext.Provider value={value}>{children}</BuyXGetYContext.Provider>
  );
};

export const useBuyXGetYDiscount = (): BuyXGetYContextType => {
  const ctx = useContext(BuyXGetYContext);
  if (!ctx) throw new Error('useBuyXGetYDiscount must be used within a BuyXGetYDiscountProvider');
  return ctx;
};

export default BuyXGetYContext;
