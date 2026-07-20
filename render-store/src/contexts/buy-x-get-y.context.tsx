/**
 * Storefront: Buy X Get Y discounts (checkout).
 * Calls /storefront/discounts/buy-x-get-y/check and /validate-code.
 * Use in checkout to get eligible automatic Buy X Get Y discounts and validate discount codes.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

// Types (aligned with storefront controller)
export interface BuyXGetYCartItem {
  productId?: string;
  collectionIds?: string[];
  quantity: number;
  price: number;
}

// Populated gets item with rich product info
export interface BuyXGetYGetsItem {
  productId: string;
  productVariantId: string;
  productTitle: string;
  productImage: string | null;
  originalPrice: number;
  discountedPrice: number;
  discountPerItem: number;
  quantity: number;
  discountType: 'free' | 'amount' | 'percentage';
  discountTypeLabel: string;
  discountValue: number | null;
  savings: number;
}

export interface BuyXGetYDiscount {
  id: string;
  method: string;
  discountCode?: string;
  title?: string;
  discountedValue: 'free' | 'amount' | 'percentage';
  discountedAmount?: number;
  discountedPercentage?: number;
  customerGetsAnyItemsFrom?: string;
  customerGetsQuantity: number;
  maxUsesPerOrder: number | null;
  totalDiscountAmount: number;
  getsItems: BuyXGetYGetsItem[];
  discountSummary: string;
  message: string;
  combinations: {
    productDiscounts: boolean;
    orderDiscounts: boolean;
    shippingDiscounts: boolean;
  };
  /** For "gets from specific collections": IDs to load products in choose-items modal */
  getsCollectionIds?: string[];
  getsCollectionNames?: string[];
}

interface BuyXGetYCheckResponse {
  success: boolean;
  data: {
    eligibleDiscounts: Array<BuyXGetYDiscount & { getsCollectionIds?: string[]; getsCollectionNames?: string[] }>;
    cartTotal: number;
    totalQuantity: number;
  };
  message: string;
}

interface BuyXGetYContextType {
  // State
  eligibleDiscounts: BuyXGetYDiscount[];
  cartTotal: number;
  totalQuantity: number;
  loading: boolean;
  error: string | null;
  discountCodeResult: BuyXGetYDiscount | null;
  appliedAutomaticDiscount: BuyXGetYDiscount | null;
  /** User-selected "gets" items when discount is "gets from specific collections" (from choose-items modal) */
  selectedGetsItems: BuyXGetYGetsItem[] | null;
  discountCodeLoading: boolean;
  discountCodeError: string | null;

  // Actions (customerId optional for guest checkout)
  fetchEligibleDiscounts: (storeId: string, customerId: string | null, cartItems: BuyXGetYCartItem[]) => Promise<void>;
  applyAutomaticDiscount: (discount: BuyXGetYDiscount) => void;
  setSelectedGetsItems: (items: BuyXGetYGetsItem[] | null) => void;
  clearAppliedAutomaticDiscount: () => void;
}

// Create Context
const BuyXGetYContext = createContext<BuyXGetYContextType | undefined>(undefined);

// Provider Props
interface BuyXGetYProviderProps {
  children: ReactNode;
}

// Provider Component
export const BuyXGetYProvider: React.FC<BuyXGetYProviderProps> = ({ children }) => {
  // State
  const [eligibleDiscounts, setEligibleDiscounts] = useState<BuyXGetYDiscount[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCodeResult, setDiscountCodeResult] = useState<BuyXGetYDiscount | null>(null);
  const [appliedAutomaticDiscount, setAppliedAutomaticDiscount] = useState<BuyXGetYDiscount | null>(null);
  const [selectedGetsItems, setSelectedGetsItemsState] = useState<BuyXGetYGetsItem[] | null>(null);
  const [discountCodeLoading] = useState<boolean>(false);
  const [discountCodeError, setDiscountCodeError] = useState<string | null>(null);

  const setSelectedGetsItems = useCallback((items: BuyXGetYGetsItem[] | null) => {
    setSelectedGetsItemsState(items);
  }, []);

  // Fetch eligible automatic discounts (customerId optional for guest checkout)
  const fetchEligibleDiscounts = useCallback(async (
    storeId: string,
    customerId: string | null,
    cartItems: BuyXGetYCartItem[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosi.post<BuyXGetYCheckResponse>(
        '/storefront/discounts/buy-x-get-y/check',
        {
          storeId,
          ...(customerId && { customerId }),
          cartItems,
        }
      );

      if (response.data.success) {
        const { eligibleDiscounts: rawDiscounts, cartTotal, totalQuantity } = response.data.data;
        const mappedDiscounts: BuyXGetYDiscount[] = rawDiscounts.map((d) => ({
          ...d,
          customerGetsAnyItemsFrom: d.customerGetsAnyItemsFrom,
          getsCollectionIds: d.getsCollectionIds,
          getsCollectionNames: d.getsCollectionNames,
        }));
        setEligibleDiscounts(mappedDiscounts);
        setCartTotal(cartTotal);
        setTotalQuantity(totalQuantity);
      } else {
        setError(response.data.message || 'Failed to fetch Buy X Get Y discounts');
        setEligibleDiscounts([]);
      }
    } catch (err: any) {
      console.error('Error fetching Buy X Get Y discounts:', err);
      setError(err.response?.data?.message || 'Failed to fetch Buy X Get Y discounts');
      setEligibleDiscounts([]);
      setCartTotal(0);
      setTotalQuantity(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyAutomaticDiscount = useCallback((discount: BuyXGetYDiscount) => {
    setAppliedAutomaticDiscount(discount);
    setDiscountCodeResult(null);
    setDiscountCodeError(null);
    setSelectedGetsItemsState(null);
  }, []);

  const clearAppliedAutomaticDiscount = useCallback(() => {
    setAppliedAutomaticDiscount(null);
    setSelectedGetsItemsState(null);
  }, []);

  // Context value
  const value: BuyXGetYContextType = {
    eligibleDiscounts,
    cartTotal,
    totalQuantity,
    loading,
    error,
    discountCodeResult,
    appliedAutomaticDiscount,
    selectedGetsItems,
    discountCodeLoading,
    discountCodeError,
    fetchEligibleDiscounts,
    applyAutomaticDiscount,
    setSelectedGetsItems,
    clearAppliedAutomaticDiscount,
  };

  return (
    <BuyXGetYContext.Provider value={value}>
      {children}
    </BuyXGetYContext.Provider>
  );
};

// Custom Hook
export const useBuyXGetY = (): BuyXGetYContextType => {
  const context = useContext(BuyXGetYContext);

  if (context === undefined) {
    throw new Error('useBuyXGetY must be used within a BuyXGetYProvider');
  }

  return context;
};
