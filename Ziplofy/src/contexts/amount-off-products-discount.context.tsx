import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Types
export interface AmountOffProductsDiscount {
  _id: string;
  storeId: string;
  method: 'discount-code' | 'automatic';
  discountCode?: string;
  title?: string;
  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;
  valueType: 'percentage' | 'fixed-amount';
  percentage?: number;
  fixedAmount?: number;
  appliesTo: 'specific-collections' | 'specific-products';
  oncePerOrder?: boolean;
  eligibility: 'all-customers' | 'specific-customer-segments' | 'specific-customers';
  applyOnPOSPro?: boolean;
  minimumPurchase?: 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
  minimumAmount?: number;
  minimumQuantity?: number;
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  status?: 'active' | 'draft';
  createdAt: string;
  updatedAt: string;
  targetProductIds?: string[];
  targetCollectionIds?: string[];
  targetCustomerSegmentIds?: string[];
  targetCustomerIds?: string[];
  // Optional populated details (if available from API)
  targetProductDetails?: { _id: string; title?: string; price?: number; imageUrl?: string; }[];
  targetCollectionDetails?: { _id: string; title?: string; description?: string; }[];
  targetCustomerSegmentDetails?: { _id: string; name: string; }[];
  targetCustomerDetails?: { _id: string; firstName?: string; lastName?: string; email?: string; }[];
}

export interface CreateDiscountRequest {
  storeId: string;
  method: 'discount-code' | 'automatic';
  discountCode?: string;
  title?: string;
  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;
  valueType: 'percentage' | 'fixed-amount';
  percentage?: number;
  fixedAmount?: number;
  appliesTo: 'specific-collections' | 'specific-products';
  oncePerOrder?: boolean;
  eligibility: 'all-customers' | 'specific-customer-segments' | 'specific-customers';
  applyOnPOSPro?: boolean;
  minimumPurchase?: 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
  minimumAmount?: number;
  minimumQuantity?: number;
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  status?: 'active' | 'draft';
  targetProductIds?: string[];
  targetCollectionIds?: string[];
  targetCustomerSegmentIds?: string[];
  targetCustomerIds?: string[];
}

export interface DiscountsResponse {
  success: boolean;
  data: AmountOffProductsDiscount[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Populated target lite types for API responses
interface ProductLite { _id: string; title?: string; price?: number; imageUrl?: string; }
interface CollectionLite { _id: string; title?: string; description?: string; }
interface CustomerSegmentLite { _id: string; name: string; }
interface CustomerLite { _id: string; firstName?: string; lastName?: string; email?: string; }

// Populated discount as returned by the API
export interface PopulatedAmountOffProductsDiscount {
  _id: string;
  storeId: string;
  method: 'discount-code' | 'automatic';
  discountCode?: string;
  title?: string;
  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;
  valueType: 'percentage' | 'fixed-amount';
  percentage?: number;
  fixedAmount?: number;
  appliesTo: 'specific-collections' | 'specific-products';
  oncePerOrder?: boolean;
  eligibility: 'all-customers' | 'specific-customer-segments' | 'specific-customers';
  applyOnPOSPro?: boolean;
  minimumPurchase?: 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
  minimumAmount?: number;
  minimumQuantity?: number;
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  status?: 'active' | 'draft';
  createdAt: string;
  updatedAt: string;
  targetProductIds: (string | ProductLite)[];
  targetCollectionIds: (string | CollectionLite)[];
  targetCustomerSegmentIds: (string | CustomerSegmentLite)[];
  targetCustomerIds: (string | CustomerLite)[];
}

export interface FetchDiscountsByStoreIdResponse {
  success: boolean;
  data: PopulatedAmountOffProductsDiscount[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateDiscountResponse {
  success: boolean;
  message: string;
  data: AmountOffProductsDiscount;
}

export type UpdateDiscountRequest = CreateDiscountRequest;

export interface UpdateDiscountResponse {
  success: boolean;
  message: string;
  data: AmountOffProductsDiscount;
}

export interface AmountOffProductsDiscountUsageOrder {
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

export interface GetOrdersByAmountOffProductsDiscountResponse {
  success: boolean;
  data: AmountOffProductsDiscountUsageOrder[];
  discount: { _id: string; title?: string; discountCode?: string; method: string };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetDiscountByIdResponse {
  success: boolean;
  data: PopulatedAmountOffProductsDiscount;
}

// Context State Interface
interface AmountOffProductsDiscountContextType {
  // State
  discounts: AmountOffProductsDiscount[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;

  // Actions
  createDiscount: (discountData: CreateDiscountRequest) => Promise<CreateDiscountResponse>;
  updateDiscount: (discountId: string, discountData: UpdateDiscountRequest) => Promise<UpdateDiscountResponse>;
  fetchDiscountsByStoreId: (storeId: string, params?: { page?: number; limit?: number; status?: 'active' | 'draft'; method?: 'discount-code' | 'automatic'; }) => Promise<FetchDiscountsByStoreIdResponse>;
  fetchDiscountById: (discountId: string) => Promise<GetDiscountByIdResponse>;
  fetchOrdersByDiscountId: (discountId: string, opts?: { page?: number; limit?: number }) => Promise<GetOrdersByAmountOffProductsDiscountResponse>;
  deleteDiscount: (discountId: string) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
  setDiscounts: (discounts: AmountOffProductsDiscount[]) => void;
}

// Create Context
const AmountOffProductsDiscountContext = createContext<AmountOffProductsDiscountContextType | undefined>(undefined);

// Provider Props
interface AmountOffProductsDiscountProviderProps {
  children: ReactNode;
}

// Provider Component
export const AmountOffProductsDiscountProvider: React.FC<AmountOffProductsDiscountProviderProps> = ({ children }) => {
  // State
  const [discounts, setDiscounts] = useState<AmountOffProductsDiscount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Create discount function
  const createDiscount = useCallback(async (discountData: CreateDiscountRequest): Promise<CreateDiscountResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosi.post<CreateDiscountResponse>('/amount-off-products-discounts', discountData);
      
      if (response.data.success) {
        // Add the new discount to the current list (merge target IDs from request; API returns main doc only)
        const created = {
          ...response.data.data,
          targetProductIds: discountData.targetProductIds ?? [],
          targetCollectionIds: discountData.targetCollectionIds ?? [],
          targetCustomerSegmentIds: discountData.targetCustomerSegmentIds ?? [],
          targetCustomerIds: discountData.targetCustomerIds ?? [],
        };
        setDiscounts(prev => [created, ...prev]);
      }

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create discount';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDiscount = useCallback(async (discountId: string, discountData: UpdateDiscountRequest): Promise<UpdateDiscountResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.put<UpdateDiscountResponse>(`/amount-off-products-discounts/${discountId}`, discountData);
      if (response.data.success && response.data.data) {
        setDiscounts(prev => prev.map(d => d._id === discountId ? {
          ...d,
          ...response.data.data,
          targetProductIds: discountData.targetProductIds ?? d.targetProductIds,
          targetCollectionIds: discountData.targetCollectionIds ?? d.targetCollectionIds,
          targetCustomerSegmentIds: discountData.targetCustomerSegmentIds ?? d.targetCustomerSegmentIds,
          targetCustomerIds: discountData.targetCustomerIds ?? d.targetCustomerIds,
        } : d));
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update discount';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiscountById = useCallback(async (discountId: string): Promise<GetDiscountByIdResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.get<GetDiscountByIdResponse>(`/amount-off-products-discounts/${discountId}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch discount';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDiscount = useCallback(async (discountId: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.delete<{ success: boolean; message: string }>(`/amount-off-products-discounts/${discountId}`);
      if (response.data.success) {
        setDiscounts(prev => prev.filter(d => d._id !== discountId));
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete discount';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiscountsByStoreId = useCallback(async (
    storeId: string,
    params?: { page?: number; limit?: number; status?: 'active' | 'draft'; method?: 'discount-code' | 'automatic'; }
  ): Promise<FetchDiscountsByStoreIdResponse> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.status) queryParams.append('status', params.status);
      if (params?.method) queryParams.append('method', params.method);

      const url = `/amount-off-products-discounts/store/${storeId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axiosi.get<FetchDiscountsByStoreIdResponse>(url);

      const apiData = response.data;

      // Normalize populated targets to id arrays for internal state typing
      const mappedData: AmountOffProductsDiscount[] = (apiData.data || []).map((d) => ({
        _id: d._id,
        storeId: d.storeId,
        method: d.method,
        discountCode: d.discountCode,
        title: d.title,
        allowDiscountOnChannels: d.allowDiscountOnChannels,
        limitTotalUses: d.limitTotalUses,
        totalUsesLimit: d.totalUsesLimit,
        limitOneUsePerCustomer: d.limitOneUsePerCustomer,
        valueType: d.valueType,
        percentage: d.percentage,
        fixedAmount: d.fixedAmount,
        appliesTo: d.appliesTo,
        oncePerOrder: d.oncePerOrder,
        eligibility: d.eligibility,
        applyOnPOSPro: d.applyOnPOSPro,
        minimumPurchase: d.minimumPurchase,
        minimumAmount: d.minimumAmount,
        minimumQuantity: d.minimumQuantity,
        productDiscounts: d.productDiscounts,
        orderDiscounts: d.orderDiscounts,
        shippingDiscounts: d.shippingDiscounts,
        startDate: d.startDate,
        startTime: d.startTime,
        setEndDate: d.setEndDate,
        endDate: d.endDate,
        endTime: d.endTime,
        status: d.status,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        targetProductIds: Array.isArray(d.targetProductIds) ? d.targetProductIds.map((p) => (typeof p === 'string' ? p : p?._id)).filter(Boolean) as string[] : [],
        targetCollectionIds: Array.isArray(d.targetCollectionIds) ? d.targetCollectionIds.map((c) => (typeof c === 'string' ? c : c?._id)).filter(Boolean) as string[] : [],
        targetCustomerSegmentIds: Array.isArray(d.targetCustomerSegmentIds) ? d.targetCustomerSegmentIds.map((s) => (typeof s === 'string' ? s : s?._id)).filter(Boolean) as string[] : [],
        targetCustomerIds: Array.isArray(d.targetCustomerIds) ? d.targetCustomerIds.map((c) => (typeof c === 'string' ? c : c?._id)).filter(Boolean) as string[] : [],
        targetProductDetails: Array.isArray(d.targetProductIds) ? d.targetProductIds.filter((p): p is { _id: string; title?: string; price?: number; imageUrl?: string; } => typeof p !== 'string') : [],
        targetCollectionDetails: Array.isArray(d.targetCollectionIds) ? d.targetCollectionIds.filter((c): c is { _id: string; title?: string; description?: string; } => typeof c !== 'string') : [],
        targetCustomerSegmentDetails: Array.isArray(d.targetCustomerSegmentIds) ? d.targetCustomerSegmentIds.filter((s): s is { _id: string; name: string; } => typeof s !== 'string') : [],
        targetCustomerDetails: Array.isArray(d.targetCustomerIds) ? d.targetCustomerIds.filter((c): c is { _id: string; firstName?: string; lastName?: string; email?: string; } => typeof c !== 'string') : [],
      }));

      setDiscounts(mappedData);
      setPagination(apiData.pagination || null);

      return apiData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch discounts';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrdersByDiscountId = useCallback(async (
    discountId: string,
    opts?: { page?: number; limit?: number }
  ): Promise<GetOrdersByAmountOffProductsDiscountResponse> => {
    try {
      setLoading(true);
      setError(null);
      const q = new URLSearchParams();
      if (opts?.page) q.append('page', String(opts.page));
      if (opts?.limit) q.append('limit', String(opts.limit));
      const res = await axiosi.get<GetOrdersByAmountOffProductsDiscountResponse>(
        `/amount-off-products-discounts/${discountId}/orders${q.toString() ? `?${q.toString()}` : ''}`
      );
      return res.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch orders for this discount';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Context value
  const contextValue: AmountOffProductsDiscountContextType = {
    // State
    discounts,
    loading,
    error,
    pagination,

    // Actions
    createDiscount,
    updateDiscount,
    fetchDiscountsByStoreId,
    fetchDiscountById,
    fetchOrdersByDiscountId,
    deleteDiscount,
    clearError,
    setDiscounts,
  };

  return (
    <AmountOffProductsDiscountContext.Provider value={contextValue}>
      {children}
    </AmountOffProductsDiscountContext.Provider>
  );
};

// Custom hook to use the context
export const useAmountOffProductsDiscount = (): AmountOffProductsDiscountContextType => {
  const context = useContext(AmountOffProductsDiscountContext);
  
  if (context === undefined) {
    throw new Error('useAmountOffProductsDiscount must be used within an AmountOffProductsDiscountProvider');
  }
  
  return context;
};

export default AmountOffProductsDiscountContext;
