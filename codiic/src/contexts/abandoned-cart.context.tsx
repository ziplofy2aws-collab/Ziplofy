import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Product Variant interface
export interface ProductVariant {
  _id: string;
  productId: string;
  optionValues: {
    [key: string]: string;
  };
  sku: string;
  barcode: string;
  price: number;
  compareAtPrice: number;
  chargeTax: boolean;
  weightValue: number;
  weightUnit: string;
  package: string;
  countryOfOrigin: string;
  images: string[];
  outOfStockContinueSelling: boolean;
  isSynthetic: boolean;
  isPhysicalProduct: boolean;
  depricated: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Cart Item interface
export interface CartItem {
  _id: string;
  productVariant: ProductVariant;
  quantity: number;
  addedAt: string;
  updatedAt: string;
}

// Customer interface
export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

// Abandoned Cart interface
export interface AbandonedCart {
  customer: Customer;
  cartItems: CartItem[];
  totalItems: number;
  lastUpdated: string;
}

// API Response interface
export interface FetchAbandonedCartsResponse {
  success: boolean;
  data: AbandonedCart[];
  count: number;
  storeId: string;
}

// Context interface
interface AbandonedCartContextType {
  abandonedCarts: AbandonedCart[];
  loading: boolean;
  error: string | null;
  fetchAbandonedCartsByStoreId: (storeId: string) => Promise<void>;
  clearError: () => void;
  clearAbandonedCarts: () => void;
}

// Create context
const AbandonedCartContext = createContext<AbandonedCartContextType | undefined>(undefined);

// Provider component
export const AbandonedCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch abandoned carts by store ID
  const fetchAbandonedCartsByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.get<FetchAbandonedCartsResponse>(`/storefront/cart/store/${storeId}`);
      const { success, data } = response.data;
      
      if (success) {
        setAbandonedCarts(data);
      } else {
        setError('Failed to fetch abandoned carts');
      }
    } catch (err: any) {
      console.error('Error fetching abandoned carts:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to fetch abandoned carts';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear abandoned carts
  const clearAbandonedCarts = useCallback(() => {
    setAbandonedCarts([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: AbandonedCartContextType = {
    abandonedCarts,
    loading,
    error,
    fetchAbandonedCartsByStoreId,
    clearError,
    clearAbandonedCarts,
  };

  return (
    <AbandonedCartContext.Provider value={value}>
      {children}
    </AbandonedCartContext.Provider>
  );
};

// Custom hook to use abandoned cart context
export const useAbandonedCarts = (): AbandonedCartContextType => {
  const context = useContext(AbandonedCartContext);
  if (context === undefined) {
    throw new Error('useAbandonedCarts must be used within an AbandonedCartProvider');
  }
  return context;
};

export default AbandonedCartContext;
