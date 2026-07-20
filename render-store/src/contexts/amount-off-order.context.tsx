/**
 * Storefront: Amount off order discounts (checkout).
 * Calls /storefront/discounts/amount-off-order/check and /validate-code.
 * Use in checkout to get eligible automatic discounts and validate discount codes.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

// Types (aligned with storefront controller)
export interface AmountOffOrderCartItem {
  productId?: string;
  collectionIds?: string[];
  quantity: number;
  price: number;
}

export interface AmountOffOrderDiscount {
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

interface AmountOffOrderResponse {
  success: boolean;
  data: {
    eligibleDiscounts: AmountOffOrderDiscount[];
    cartTotal: number;
    totalQuantity: number;
  };
  message: string;
}

interface AmountOffOrderContextType {
  // State
  eligibleDiscounts: AmountOffOrderDiscount[];
  cartTotal: number;
  totalQuantity: number;
  loading: boolean;
  error: string | null;
  discountCodeResult: AmountOffOrderDiscount | null;
  appliedAutomaticDiscount: AmountOffOrderDiscount | null;
  discountCodeLoading: boolean;
  discountCodeError: string | null;

  // Actions (customerId optional for guest checkout)
  fetchEligibleDiscounts: (storeId: string, customerId: string | null, cartItems: AmountOffOrderCartItem[]) => Promise<void>;
  applyAutomaticDiscount: (discount: AmountOffOrderDiscount) => void;
  clearAppliedAutomaticDiscount: () => void;
}

// Create Context
const AmountOffOrderContext = createContext<AmountOffOrderContextType | undefined>(undefined);

// Provider Props
interface AmountOffOrderProviderProps {
  children: ReactNode;
}

// Provider Component
export const AmountOffOrderProvider: React.FC<AmountOffOrderProviderProps> = ({ children }) => {
  // State
  const [eligibleDiscounts, setEligibleDiscounts] = useState<AmountOffOrderDiscount[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCodeResult, setDiscountCodeResult] = useState<AmountOffOrderDiscount | null>(null);
  const [appliedAutomaticDiscount, setAppliedAutomaticDiscount] = useState<AmountOffOrderDiscount | null>(null);
  const [discountCodeLoading] = useState<boolean>(false);
  const [discountCodeError, setDiscountCodeError] = useState<string | null>(null);

  const applyAutomaticDiscount = useCallback((discount: AmountOffOrderDiscount) => {
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
    cartItems: AmountOffOrderCartItem[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosi.post<AmountOffOrderResponse>(
        '/storefront/discounts/amount-off-order/check',
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
      console.error('Error fetching amount off order discounts:', err);
      setError(err.response?.data?.message || 'Failed to fetch discounts');
      setEligibleDiscounts([]);
      setCartTotal(0);
      setTotalQuantity(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Context value
  const value: AmountOffOrderContextType = {
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
    <AmountOffOrderContext.Provider value={value}>
      {children}
    </AmountOffOrderContext.Provider>
  );
};

// Custom Hook
export const useAmountOffOrder = (): AmountOffOrderContextType => {
  const context = useContext(AmountOffOrderContext);

  if (context === undefined) {
    throw new Error('useAmountOffOrder must be used within an AmountOffOrderProvider');
  }

  return context;
};
