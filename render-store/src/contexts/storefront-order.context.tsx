import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { axiosi } from '../config/axios.config';
import type { StorefrontProductVariant } from './product-variant.context';
import toast from 'react-hot-toast';
import { useStorefrontAuth } from './storefront-auth.context';

export interface CustomerAddress {
  _id: string;
  customerId: string;
  country: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  phoneNumber: string;
  addressType: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  storeId: string;
  firstName: string;
  lastName: string;
  language: string;
  email: string;
  phoneNumber?: string;
  isVerified?: boolean;
  agreedToMarketingEmails: boolean;
  agreedToSmsMarketing: boolean;
  collectTax: 'collect' | 'dont_collect' | 'collect_unless_exempt';
  tagIds: string[];
  defaultAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  orderId: string;
  productVariantId: StorefrontProductVariant;
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontOrder {
  _id: string;
  storeId: string;
  customerId: Customer;
  shippingAddressId: CustomerAddress;
  billingAddressId?: CustomerAddress;
  orderDate: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: 'credit_card' | 'paypal' | 'cod' | 'other';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  storeId: string;
  shippingAddressId: string;
  billingAddressId?: string;
  items: Array<{
    productVariantId: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  paymentMethod?: 'credit_card' | 'paypal' | 'cod' | 'other';
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  total: number;
  notes?: string;
  freeShippingDiscountId?: string;
  amountOffOrderDiscountId?: string;
  amountOffProductDiscountId?: string;
  buyXGetYDiscountId?: string;
}

interface CreateOrderResponse {
  success: boolean;
  data: StorefrontOrder;
  message: string;
}

interface GetOrdersResponse {
  success: boolean;
  data: StorefrontOrder[];
  count: number;
}

interface StorefrontOrderContextType {
  orders: StorefrontOrder[];
  loading: boolean;
  error: string | null;
  createOrder: (payload: CreateOrderPayload) => Promise<StorefrontOrder>;
  getOrdersByCustomerId: (customerId: string) => Promise<StorefrontOrder[]>;
  clearOrders: () => void;
  clearError: () => void;
}

const StorefrontOrderContext = createContext<StorefrontOrderContextType | undefined>(undefined);

export const StorefrontOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<StorefrontOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { registerLogoutCallback } = useStorefrontAuth();

  const clearOrders = useCallback(() => {
    setOrders([]);
    setError(null);
  }, []);

  // Register clear function to be called on logout
  useEffect(() => {
    const unregister = registerLogoutCallback(clearOrders);
    return unregister;
  }, [registerLogoutCallback, clearOrders]);

  const createOrder = useCallback(async (payload: CreateOrderPayload): Promise<StorefrontOrder> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateOrderResponse>('/storefront/orders', payload);
      if (!res.data.success) throw new Error('Create order failed');
      const created = res.data.data;
      setOrders(prev => [created, ...prev]);
      toast.success('Order placed successfully');
      return created;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Create order failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrdersByCustomerId = useCallback(async (customerId: string): Promise<StorefrontOrder[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetOrdersResponse>(`/storefront/orders/customer/${customerId}`);
      if (!res.data.success) throw new Error('Fetch orders failed');
      setOrders(res.data.data || []);
      return res.data.data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Fetch orders failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: StorefrontOrderContextType = {
    orders,
    loading,
    error,
    createOrder,
    getOrdersByCustomerId,
    clearOrders,
    clearError,
  };

  return (
    <StorefrontOrderContext.Provider value={value}>{children}</StorefrontOrderContext.Provider>
  );
};

export const useStorefrontOrder = (): StorefrontOrderContextType => {
  const ctx = useContext(StorefrontOrderContext);
  if (!ctx) throw new Error('useStorefrontOrder must be used within a StorefrontOrderProvider');
  return ctx;
};

export default StorefrontOrderContext;
