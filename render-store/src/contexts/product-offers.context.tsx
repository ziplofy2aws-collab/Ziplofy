/**
 * Storefront: Product-level offers (starting with free shipping offers).
 * Calls /product-offers/free-shipping/product/:id to fetch free-shipping offers
 * applicable to a given product + customer.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

// Types must stay in sync with backend controller: product-offers.controller.ts

export type FreeShippingOfferMethod = 'discount-code' | 'automatic';
export type FreeShippingOfferEligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';
export type FreeShippingOfferMinimumPurchase = 'no-requirements' | 'minimum-amount' | 'minimum-quantity';

export interface FreeShippingProductOffer {
  id: string;
  method: FreeShippingOfferMethod;
  title?: string;
  discountCode?: string;
  eligibility: FreeShippingOfferEligibility;
  minimumPurchase: FreeShippingOfferMinimumPurchase;
  minimumAmount?: number;
  minimumQuantity?: number;
  minimumRequirementMessage: string | null;
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  hasEndDate: boolean;
  endsAt?: string;
  endsInMs?: number;
  endsInText?: string;
  combinations: {
    productDiscounts: boolean;
    orderDiscounts: boolean;
  };
}

export type AmountOffOrderOfferMethod = 'discount-code' | 'automatic';
export type AmountOffOrderOfferValueType = 'percentage' | 'fixed-amount';
export type AmountOffOrderOfferEligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';
export type AmountOffOrderOfferMinimumPurchase = 'no-requirements' | 'minimum-amount' | 'minimum-quantity';

export interface AmountOffOrderProductOffer {
  id: string;
  method: AmountOffOrderOfferMethod;
  discountCode?: string;
  title?: string;
  valueType: AmountOffOrderOfferValueType;
  percentage?: number;
  fixedAmount?: number;
  valueDescription: string;
  eligibility: AmountOffOrderOfferEligibility;
  minimumPurchase: AmountOffOrderOfferMinimumPurchase;
  minimumAmount?: number;
  minimumQuantity?: number;
  minimumRequirementMessage: string | null;
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  hasEndDate: boolean;
  endsAt?: string;
  endsInMs?: number;
  endsInText?: string;
  combinations: {
    productDiscounts: boolean;
    orderDiscounts: boolean;
    shippingDiscounts: boolean;
  };
}

export type AmountOffProductsOfferMethod = 'discount-code' | 'automatic';
export type AmountOffProductsOfferValueType = 'percentage' | 'fixed-amount';
export type AmountOffProductsOfferEligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';
export type AmountOffProductsOfferMinimumPurchase = 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
export type AmountOffProductsAppliesTo = 'specific-products' | 'specific-collections';

export interface AmountOffProductsProductOffer {
  id: string;
  method: AmountOffProductsOfferMethod;
  discountCode?: string;
  title?: string;
  valueType: AmountOffProductsOfferValueType;
  percentage?: number;
  fixedAmount?: number;
  valueDescription: string;
  appliesTo: AmountOffProductsAppliesTo;
  eligibility: AmountOffProductsOfferEligibility;
  minimumPurchase: AmountOffProductsOfferMinimumPurchase;
  minimumAmount?: number;
  minimumQuantity?: number;
  minimumRequirementMessage: string | null;
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  hasEndDate: boolean;
  endsAt?: string;
  endsInMs?: number;
  endsInText?: string;
  combinations: {
    productDiscounts: boolean;
    orderDiscounts: boolean;
    shippingDiscounts: boolean;
  };
}

export type BuyXGetYOfferMethod = 'discount-code' | 'automatic';
export type BuyXGetYCustomerBuys = 'minimum-quantity' | 'minimum-amount';
export type BuyXGetYAnyItemsFrom = 'specific-products' | 'specific-collections';
export type BuyXGetYCustomerGetsFrom = 'specific-products' | 'specific-collections';
export type BuyXGetYDiscountedValue = 'free' | 'amount' | 'percentage';
export type BuyXGetYOfferEligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';

export interface BuyXGetYProductOffer {
  id: string;
  method: BuyXGetYOfferMethod;
  discountCode?: string;
  title?: string;
  customerBuys: BuyXGetYCustomerBuys;
  quantity?: number;
  amount?: number;
  anyItemsFrom: BuyXGetYAnyItemsFrom;
  customerGetsQuantity: number;
  customerGetsAnyItemsFrom: BuyXGetYCustomerGetsFrom;
  discountedValue: BuyXGetYDiscountedValue;
  discountedAmount?: number;
  discountedPercentage?: number;
  eligibility: BuyXGetYOfferEligibility;
  buysRequirementMessage: string | null;
  getsMessage: string;
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  hasEndDate: boolean;
  endsAt?: string;
  endsInMs?: number;
  endsInText?: string;
  combinations: {
    productDiscounts: boolean;
    orderDiscounts: boolean;
    shippingDiscounts: boolean;
  };
}

interface FreeShippingOffersApiResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    freeShippingOffers: FreeShippingProductOffer[];
  };
}

interface AmountOffOrderOffersApiResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    amountOffOrderOffers: AmountOffOrderProductOffer[];
  };
}

interface AmountOffProductsOffersApiResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    amountOffProductsOffers: AmountOffProductsProductOffer[];
  };
}

interface BuyXGetYOffersApiResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    buyXGetYOffers: BuyXGetYProductOffer[];
  };
}

interface ProductOffersContextType {
  freeShippingOffers: FreeShippingProductOffer[];
  amountOffOrderOffers: AmountOffOrderProductOffer[];
  amountOffProductsOffers: AmountOffProductsProductOffer[];
  buyXGetYOffers: BuyXGetYProductOffer[];
  freeShippingLoading: boolean;
  amountOffOrderLoading: boolean;
  amountOffProductsLoading: boolean;
  buyXGetYLoading: boolean;
  loading: boolean;
  error: string | null;

  fetchFreeShippingOffersForProduct: (productId: string, customerId?: string | null) => Promise<void>;
  fetchAmountOffOrderOffersForProduct: (productId: string, customerId?: string | null) => Promise<void>;
  fetchAmountOffProductsOffersForProduct: (productId: string, customerId?: string | null) => Promise<void>;
  fetchBuyXGetYOffersForProduct: (productId: string, customerId?: string | null) => Promise<void>;
  clear: () => void;
}

const ProductOffersContext = createContext<ProductOffersContextType | undefined>(undefined);

interface ProductOffersProviderProps {
  children: ReactNode;
}

export const ProductOffersProvider: React.FC<ProductOffersProviderProps> = ({ children }) => {
  const [freeShippingOffers, setFreeShippingOffers] = useState<FreeShippingProductOffer[]>([]);
  const [amountOffOrderOffers, setAmountOffOrderOffers] = useState<AmountOffOrderProductOffer[]>([]);
  const [amountOffProductsOffers, setAmountOffProductsOffers] = useState<AmountOffProductsProductOffer[]>([]);
  const [buyXGetYOffers, setBuyXGetYOffers] = useState<BuyXGetYProductOffer[]>([]);
  const [freeShippingLoading, setFreeShippingLoading] = useState(false);
  const [amountOffOrderLoading, setAmountOffOrderLoading] = useState(false);
  const [amountOffProductsLoading, setAmountOffProductsLoading] = useState(false);
  const [buyXGetYLoading, setBuyXGetYLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = freeShippingLoading || amountOffOrderLoading || amountOffProductsLoading || buyXGetYLoading;

  const fetchFreeShippingOffersForProduct = useCallback(
    async (productId: string, customerId?: string | null): Promise<void> => {
      if (!productId) return;

      try {
        setFreeShippingLoading(true);
        setError(null);

        const response = await axiosi.get<FreeShippingOffersApiResponse>(
          `/product-offers/free-shipping/product/${productId}`,
          {
            params: {
              ...(customerId && { customerId }),
            },
          }
        );

        if (response.data.success) {
          setFreeShippingOffers(response.data.data.freeShippingOffers || []);
        } else {
          setFreeShippingOffers([]);
          setError(response.data.message || 'Failed to fetch product offers');
        }
      } catch (err: any) {
        console.error('Error fetching free-shipping offers for product:', err);
        setFreeShippingOffers([]);
        setError(err.response?.data?.message || 'Failed to fetch product offers');
      } finally {
        setFreeShippingLoading(false);
      }
    },
    []
  );

  const fetchAmountOffOrderOffersForProduct = useCallback(
    async (productId: string, customerId?: string | null): Promise<void> => {
      if (!productId) return;

      try {
        setAmountOffOrderLoading(true);
        setError(null);

        const response = await axiosi.get<AmountOffOrderOffersApiResponse>(
          `/product-offers/amount-off-order/product/${productId}`,
          {
            params: {
              ...(customerId && { customerId }),
            },
          }
        );

        if (response.data.success) {
          setAmountOffOrderOffers(response.data.data.amountOffOrderOffers || []);
        } else {
          setAmountOffOrderOffers([]);
          setError(response.data.message || 'Failed to fetch product offers');
        }
      } catch (err: any) {
        console.error('Error fetching amount-off-order offers for product:', err);
        setAmountOffOrderOffers([]);
        setError(err.response?.data?.message || 'Failed to fetch product offers');
      } finally {
        setAmountOffOrderLoading(false);
      }
    },
    []
  );

  const fetchAmountOffProductsOffersForProduct = useCallback(
    async (productId: string, customerId?: string | null): Promise<void> => {
      if (!productId) return;

      try {
        setAmountOffProductsLoading(true);
        setError(null);

        const response = await axiosi.get<AmountOffProductsOffersApiResponse>(
          `/product-offers/amount-off-products/product/${productId}`,
          {
            params: {
              ...(customerId && { customerId }),
            },
          }
        );

        if (response.data.success) {
          setAmountOffProductsOffers(response.data.data.amountOffProductsOffers || []);
        } else {
          setAmountOffProductsOffers([]);
          setError(response.data.message || 'Failed to fetch product offers');
        }
      } catch (err: any) {
        console.error('Error fetching amount-off-products offers for product:', err);
        setAmountOffProductsOffers([]);
        setError(err.response?.data?.message || 'Failed to fetch product offers');
      } finally {
        setAmountOffProductsLoading(false);
      }
    },
    []
  );

  const fetchBuyXGetYOffersForProduct = useCallback(
    async (productId: string, customerId?: string | null): Promise<void> => {
      if (!productId) return;

      try {
        setBuyXGetYLoading(true);
        setError(null);

        const response = await axiosi.get<BuyXGetYOffersApiResponse>(
          `/product-offers/buy-x-get-y/product/${productId}`,
          {
            params: {
              ...(customerId && { customerId }),
            },
          }
        );

        if (response.data.success) {
          setBuyXGetYOffers(response.data.data.buyXGetYOffers || []);
        } else {
          setBuyXGetYOffers([]);
          setError(response.data.message || 'Failed to fetch product offers');
        }
      } catch (err: any) {
        console.error('Error fetching buy-x-get-y offers for product:', err);
        setBuyXGetYOffers([]);
        setError(err.response?.data?.message || 'Failed to fetch product offers');
      } finally {
        setBuyXGetYLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setFreeShippingOffers([]);
    setAmountOffOrderOffers([]);
    setAmountOffProductsOffers([]);
    setBuyXGetYOffers([]);
    setFreeShippingLoading(false);
    setAmountOffOrderLoading(false);
    setAmountOffProductsLoading(false);
    setBuyXGetYLoading(false);
    setError(null);
  }, []);

  const value: ProductOffersContextType = {
    freeShippingOffers,
    amountOffOrderOffers,
    amountOffProductsOffers,
    buyXGetYOffers,
    freeShippingLoading,
    amountOffOrderLoading,
    amountOffProductsLoading,
    buyXGetYLoading,
    loading,
    error,
    fetchFreeShippingOffersForProduct,
    fetchAmountOffOrderOffersForProduct,
    fetchAmountOffProductsOffersForProduct,
    fetchBuyXGetYOffersForProduct,
    clear,
  };

  return <ProductOffersContext.Provider value={value}>{children}</ProductOffersContext.Provider>;
};

export const useProductOffers = (): ProductOffersContextType => {
  const ctx = useContext(ProductOffersContext);
  if (!ctx) {
    throw new Error('useProductOffers must be used within a ProductOffersProvider');
  }
  return ctx;
};

