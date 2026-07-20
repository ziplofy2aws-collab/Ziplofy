import React, { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

// Types
export interface FreeShippingDiscount {
  id: string;
  method: 'automatic' | 'discount-code';
  discountCode?: string;
  title?: string;
  message: string;
  countrySelection: 'all-countries' | 'selected-countries';
  selectedCountryCodes?: string[];
  excludeShippingRates: boolean;
  shippingRateLimit?: number;
  combinations: {
    productDiscounts: boolean;
    orderDiscounts: boolean;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  country?: string;
  countryId?: string;
  state?: string;
  city?: string;
}

export interface CheckEligibleFreeShippingRequest {
  storeId: string;
  customerId: string;
  cartItems: CartItem[];
  shippingAddress?: ShippingAddress;
  currentShippingRate?: number;
}

export interface ValidateFreeShippingCodeRequest {
  storeId: string;
  customerId: string;
  cartItems: CartItem[];
  discountCode: string;
  shippingAddress?: ShippingAddress;
  currentShippingRate?: number;
}

export interface FreeShippingContextType {
  // State
  eligibleDiscounts: FreeShippingDiscount[];
  discountCodeResult: FreeShippingDiscount | null;
  appliedAutomaticDiscount: FreeShippingDiscount | null;
  loading: boolean;
  error: string | null;
  discountCodeLoading: boolean;
  discountCodeError: string | null;

  // Functions
  checkEligibleFreeShippingDiscounts: (request: CheckEligibleFreeShippingRequest) => Promise<void>;
  applyAutomaticDiscount: (discount: FreeShippingDiscount) => void;
  clearAppliedAutomaticDiscount: () => void;
}

const FreeShippingContext = createContext<FreeShippingContextType | undefined>(undefined);

export const useFreeShipping = () => {
  const context = useContext(FreeShippingContext);
  if (context === undefined) {
    throw new Error('useFreeShipping must be used within a FreeShippingProvider');
  }
  return context;
};

interface FreeShippingProviderProps {
  children: ReactNode;
}

export const FreeShippingProvider: React.FC<FreeShippingProviderProps> = ({ children }) => {
  // State
  const [eligibleDiscounts, setEligibleDiscounts] = useState<FreeShippingDiscount[]>([]);
  const [discountCodeResult, setDiscountCodeResult] = useState<FreeShippingDiscount | null>(null);
  const [appliedAutomaticDiscount, setAppliedAutomaticDiscount] = useState<FreeShippingDiscount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCodeLoading] = useState(false);
  const [discountCodeError, setDiscountCodeError] = useState<string | null>(null);

  // Check eligible free shipping discounts (automatic)
  const checkEligibleFreeShippingDiscounts = useCallback(async (request: CheckEligibleFreeShippingRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosi.post('/storefront/discounts/free-shipping/check', request);

      if (response.data.success) {
        setEligibleDiscounts(response.data.data.eligibleDiscounts || []);
      } else {
        setError(response.data.message || 'Failed to fetch eligible discounts');
        setEligibleDiscounts([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch eligible discounts';
      setError(errorMessage);
      setEligibleDiscounts([]);
      console.error('Error checking eligible free shipping discounts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply an automatic discount (user clicked Apply on eligible discount)
  const applyAutomaticDiscount = useCallback((discount: FreeShippingDiscount) => {
    setAppliedAutomaticDiscount(discount);
    setDiscountCodeResult(null);
    setDiscountCodeError(null);
  }, []);

  // Clear applied automatic discount
  const clearAppliedAutomaticDiscount = useCallback(() => {
    setAppliedAutomaticDiscount(null);
  }, []);

  const value: FreeShippingContextType = {
    // State
    eligibleDiscounts,
    discountCodeResult,
    appliedAutomaticDiscount,
    loading,
    error,
    discountCodeLoading,
    discountCodeError,

    // Functions
    checkEligibleFreeShippingDiscounts,
    applyAutomaticDiscount,
    clearAppliedAutomaticDiscount,
  };

  return (
    <FreeShippingContext.Provider value={value}>
      {children}
    </FreeShippingContext.Provider>
  );
};
