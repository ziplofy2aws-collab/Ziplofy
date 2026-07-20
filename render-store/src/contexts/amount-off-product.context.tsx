/**
 * Storefront: Amount off product discounts (checkout).
 * Calls /storefront/discounts/amount-off-product/check and /validate-code.
 * Use in checkout to get eligible automatic discounts and validate discount codes.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

// Types (aligned with storefront controller)
export interface AmountOffProductCartItem {
  productId?: string;
  collectionIds?: string[];
  quantity: number;
  price: number;
}

export interface AmountOffProductDiscount {
  id: string;
  method: string;
  discountCode?: string;
  title?: string;
  valueType: 'percentage' | 'fixed-amount';
  percentage?: number;
  fixedAmount?: number;
  discountAmount: number;
  message: string;
  combinations: {
    productDiscounts: boolean;
    orderDiscounts: boolean;
    shippingDiscounts: boolean;
  };
}

interface AmountOffProductCheckResponse {
  success: boolean;
  data: {
    eligibleDiscounts: AmountOffProductDiscount[];
    cartTotal: number;
    totalQuantity: number;
  };
  message: string;
}

interface AmountOffProductContextType {
  // State
  eligibleDiscounts: AmountOffProductDiscount[];
  cartTotal: number;
  totalQuantity: number;
  loading: boolean;
  error: string | null;
  discountCodeResult: AmountOffProductDiscount | null;
  appliedAutomaticDiscount: AmountOffProductDiscount | null;
  discountCodeLoading: boolean;
  discountCodeError: string | null;

  // Actions (customerId optional for guest checkout)
  fetchEligibleDiscounts: (storeId: string, customerId: string | null, cartItems: AmountOffProductCartItem[]) => Promise<void>;
  applyAutomaticDiscount: (discount: AmountOffProductDiscount) => void;
  clearAppliedAutomaticDiscount: () => void;
}

// Create Context
const AmountOffProductContext = createContext<AmountOffProductContextType | undefined>(undefined);

// Provider Props
interface AmountOffProductProviderProps {
  children: ReactNode;
}

// Provider Component
export const AmountOffProductProvider: React.FC<AmountOffProductProviderProps> = ({ children }) => {
  // State
  const [eligibleDiscounts, setEligibleDiscounts] = useState<AmountOffProductDiscount[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCodeResult, setDiscountCodeResult] = useState<AmountOffProductDiscount | null>(null);
  const [discountCodeLoading] = useState<boolean>(false);
  const [discountCodeError, setDiscountCodeError] = useState<string | null>(null);

  const [appliedAutomaticDiscount, setAppliedAutomaticDiscount] = useState<AmountOffProductDiscount | null>(null);

  const applyAutomaticDiscount = useCallback((discount: AmountOffProductDiscount) => {
    setAppliedAutomaticDiscount(discount);
    setDiscountCodeResult(null);
    setDiscountCodeError(null);
  }, []);

  const clearAppliedAutomaticDiscount = useCallback(() => {
    setAppliedAutomaticDiscount(null);
  }, []);

  // Fetch eligible discounts (customerId optional for guest checkout)
  const fetchEligibleDiscounts = useCallback(async (
    storeId: string,
    customerId: string | null,
    cartItems: AmountOffProductCartItem[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosi.post<AmountOffProductCheckResponse>(
        '/storefront/discounts/amount-off-product/check',
        {
          storeId,
          ...(customerId && { customerId }),
          cartItems,
        }
      );

      if (response.data.success) {
        setEligibleDiscounts(response.data.data.eligibleDiscounts);
        setCartTotal(response.data.data.cartTotal);
        setTotalQuantity(response.data.data.totalQuantity);
      } else {
        setError('Failed to fetch discounts');
      }
    } catch (err: any) {
      console.error('Error fetching amount off product discounts:', err);
      setError(err.response?.data?.message || 'Failed to fetch discounts');
      setEligibleDiscounts([]);
      setCartTotal(0);
      setTotalQuantity(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Context value
  const value: AmountOffProductContextType = {
    eligibleDiscounts,
    cartTotal,
    totalQuantity,
    loading,
    error,
    discountCodeResult,
    appliedAutomaticDiscount,
    discountCodeLoading,
    discountCodeError,
    fetchEligibleDiscounts,
    applyAutomaticDiscount,
    clearAppliedAutomaticDiscount,
  };

  return (
    <AmountOffProductContext.Provider value={value}>
      {children}
    </AmountOffProductContext.Provider>
  );
};

// Custom Hook
export const useAmountOffProduct = (): AmountOffProductContextType => {
  const context = useContext(AmountOffProductContext);

  if (context === undefined) {
    throw new Error('useAmountOffProduct must be used within an AmountOffProductProvider');
  }

  return context;
};
