import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface AdminOrderItemVariant {
  _id: string;
  sku?: string;
  optionValues?: Record<string, string>;
  images?: string[];
  productId?: {
    _id: string;
    title?: string;
    imageUrls?: string[];
  };
}

export interface AdminOrderItem {
  _id: string;
  orderId: string;
  productVariantId: AdminOrderItemVariant; // populated
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderStoreRef {
  _id: string;
  storeName?: string;
}

export interface AdminOrderCustomerRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AdminOrderAddressRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  phoneNumber?: string;
}

export interface AdminOrderPaymentConfirmation {
  _id: string;
  utr: string;
  referenceId: string;
  verificationStatus: 'submitted' | 'verified';
  verifiedAt?: string | null;
  createdAt: string;
}

export interface AdminOrder {
  _id: string;
  storeId: AdminOrderStoreRef; // populated with name
  customerId: AdminOrderCustomerRef; // populated (no password)
  shippingAddressId: AdminOrderAddressRef;
  billingAddressId?: AdminOrderAddressRef;
  orderSequence?: number;
  displayOrderId?: string;
  orderDate?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: 'credit_card' | 'paypal' | 'cod' | 'bank_transfer' | 'upi_id' | 'other';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  paymentConfirmation?: AdminOrderPaymentConfirmation | null;
}

interface GetOrdersByStoreIdResponse {
  success: boolean;
  data: AdminOrder[];
  count: number;
}

interface GetOrderByIdResponse {
  success: boolean;
  data: AdminOrder;
}

interface AdminOrderContextValue {
  orders: AdminOrder[];
  loading: boolean;
  error: string | null;
  getOrdersByStoreId: (storeId: string) => Promise<AdminOrder[]>;
  getOrderById: (orderId: string) => Promise<AdminOrder | null>;
  verifyOrderPayment: (orderId: string) => Promise<AdminOrder>;
  clear: () => void;
}

const AdminOrderContext = createContext<AdminOrderContextValue | undefined>(undefined);

export const AdminOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setOrders([]);
    setError(null);
  }, []);

  const getOrderById = useCallback(async (orderId: string): Promise<AdminOrder | null> => {
    try {
      const res = await axiosi.get<GetOrderByIdResponse>(`/orders/${orderId}`);
      if (!res.data.success) throw new Error('Failed to fetch order');
      return res.data.data || null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch order';
      setError(msg);
      throw err;
    }
  }, []);

  const getOrdersByStoreId = useCallback(async (storeId: string): Promise<AdminOrder[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetOrdersByStoreIdResponse>(`/orders/store/${storeId}`);
      if (!res.data.success) throw new Error('Failed to fetch orders');
      setOrders(res.data.data || []);
      return res.data.data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch orders';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOrderPayment = useCallback(async (orderId: string): Promise<AdminOrder> => {
    try {
      setError(null);
      const res = await axiosi.patch<GetOrderByIdResponse>(`/orders/${orderId}/verify-payment`);
      if (!res.data.success) throw new Error('Failed to verify payment');
      const updatedOrder = res.data.data;
      setOrders((current) =>
        current.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );
      return updatedOrder;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to verify payment';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const value = useMemo<AdminOrderContextValue>(
    () => ({ orders, loading, error, getOrdersByStoreId, getOrderById, verifyOrderPayment, clear }),
    [orders, loading, error, getOrdersByStoreId, getOrderById, verifyOrderPayment, clear]
  );

  return (
    <AdminOrderContext.Provider value={value}>{children}</AdminOrderContext.Provider>
  );
};

export const useAdminOrders = (): AdminOrderContextValue => {
  const ctx = useContext(AdminOrderContext);
  if (!ctx) throw new Error('useAdminOrders must be used within an AdminOrderProvider');
  return ctx;
};


