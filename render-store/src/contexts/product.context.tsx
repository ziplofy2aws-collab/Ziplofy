import { createContext, useCallback, useContext, useState } from "react";
import { axiosi } from "../config/axios.config";

export interface StorefrontProductVariant {
  _id: string;
  price: number;
  compareAtPrice?: number | null;
  optionValues?: Record<string, string>;
  sku: string;
  images?: string[];
}

// Product-specific discount (Amount Off Products)
export interface ProductDiscount {
  valueType: 'percentage' | 'fixed-amount';
  percentage?: number;
  fixedAmount?: number;
  title?: string;
  method: 'automatic' | 'discount-code';
  discountCode?: string;
}

// Store-wide order discount (Amount Off Order)
export interface OrderDiscount {
  valueType: 'percentage' | 'fixed-amount';
  percentage?: number;
  fixedAmount?: number;
  title?: string;
  minimumPurchase?: 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
  minimumAmount?: number;
  minimumQuantity?: number;
}

export interface StorefrontProductItem {
  _id: string;
  title: string;
  description: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  category: { _id: string; name: string } | null;
  price: number;
  compareAtPrice?: number;
  sku: string;
  status: "active" | "draft";
  vendor: { _id: string; name: string } | null;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
  productDiscount?: ProductDiscount | null;
}

export interface StorefrontProductDetailItem extends StorefrontProductItem {
  storeId: string;
  variants?: { optionName: string; values: string[] }[];
  variantDetails?: StorefrontProductVariant[];
}

export interface StorefrontProductsResponse {
  success: boolean;
  data: StorefrontProductItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  orderDiscount?: OrderDiscount | null;
}

export interface StorefrontProductDetailResponse {
  success: boolean;
  data: StorefrontProductDetailItem;
}

interface StorefrontProductContextType {
  products: StorefrontProductItem[];
  productDetail: StorefrontProductDetailItem | null;
  loading: boolean;
  productDetailLoading: boolean;
  error: string | null;
  productDetailError: string | null;
  pagination: StorefrontProductsResponse["pagination"] | null;
  orderDiscount: OrderDiscount | null;
  fetchProductsByStoreId: (args: { storeId: string; page?: number; limit?: number }) => Promise<void>;
  fetchProductById: (productId: string) => Promise<StorefrontProductDetailItem | null>;
  clear: () => void;
  clearProductDetail: () => void;
}

const StorefrontProductContext = createContext<StorefrontProductContextType | undefined>(undefined);

export const StorefrontProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<StorefrontProductItem[]>([]);
  const [productDetail, setProductDetail] = useState<StorefrontProductDetailItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [productDetailLoading, setProductDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [productDetailError, setProductDetailError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<StorefrontProductsResponse["pagination"] | null>(null);
  const [orderDiscount, setOrderDiscount] = useState<OrderDiscount | null>(null);

  const fetchProductsByStoreId = useCallback(async (args: { storeId: string; page?: number; limit?: number }) => {
    const { storeId, page = 1, limit = 10 } = args;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<StorefrontProductsResponse>(`/products/public/store/${storeId}`, {
        params: { page, limit },
      });
      if (!res.data.success) throw new Error("Failed to fetch products");
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || null);
      setOrderDiscount(res.data.orderDiscount || null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string }; message?: string }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message ?? "Failed to fetch products";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (productId: string): Promise<StorefrontProductDetailItem | null> => {
    try {
      setProductDetailLoading(true);
      setProductDetailError(null);
      const res = await axiosi.get<StorefrontProductDetailResponse>(`/products/public/${productId}`);
      if (!res.data.success || !res.data.data) return null;
      const data = res.data.data as StorefrontProductDetailItem & { variants?: StorefrontProductVariant[] };
      const detail: StorefrontProductDetailItem = {
        ...data,
        variantDetails: data.variants ?? data.variantDetails,
      };
      setProductDetail(detail);
      return detail;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string }; message?: string }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message ?? "Failed to fetch product";
      setProductDetailError(msg);
      setProductDetail(null);
      return null;
    } finally {
      setProductDetailLoading(false);
    }
  }, []);

  const clearProductDetail = useCallback(() => {
    setProductDetail(null);
    setProductDetailError(null);
  }, []);

  const clear = useCallback(() => {
    setProducts([]);
    setProductDetail(null);
    setPagination(null);
    setError(null);
    setProductDetailError(null);
    setLoading(false);
    setProductDetailLoading(false);
    setOrderDiscount(null);
  }, []);

  const value: StorefrontProductContextType = {
    products,
    productDetail,
    loading,
    productDetailLoading,
    error,
    productDetailError,
    pagination,
    orderDiscount,
    fetchProductsByStoreId,
    fetchProductById,
    clear,
    clearProductDetail,
  };

  return <StorefrontProductContext.Provider value={value}>{children}</StorefrontProductContext.Provider>;
};

export const useStorefrontProducts = (): StorefrontProductContextType => {
  const ctx = useContext(StorefrontProductContext);
  if (!ctx) throw new Error("useStorefrontProducts must be used within a StorefrontProductProvider");
  return ctx;
};

export default StorefrontProductContext;
