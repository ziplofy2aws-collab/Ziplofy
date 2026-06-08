import { createContext, useCallback, useContext, useState } from "react";
import { axiosi } from "../config/axios.config";

export interface StorefrontProductVariant {
  _id: string;
  productId: string;
  optionValues: Record<string, string> | Record<string, never>;
  sku: string;
  barcode: string | null;
  price: number;
  compareAtPrice?: number | null;
  chargeTax: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
  package?: string | null;
  countryOfOrigin?: string | null;
  images: string[];
  outOfStockContinueSelling?: boolean;
  isSynthetic?: boolean;
  isPhysicalProduct?: boolean;
  depricated?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VariantsResponse {
  success: boolean;
  data: StorefrontProductVariant[];
  count: number;
}

interface VariantByIdResponse {
  success: boolean;
  data: StorefrontProductVariant;
}

interface StorefrontProductVariantContextType {
  variants: StorefrontProductVariant[];
  activeVariant: StorefrontProductVariant | null;
  count: number;
  loading: boolean;
  activeVariantLoading: boolean;
  error: string | null;
  fetchVariantsByProductId: (productId: string) => Promise<StorefrontProductVariant[]>;
  fetchProductVariantDetailsById: (variantId: string, productId?: string) => Promise<StorefrontProductVariant | null>;
  clearActiveVariant: () => void;
  clear: () => void;
}

const StorefrontProductVariantContext = createContext<StorefrontProductVariantContextType | undefined>(undefined);

export const StorefrontProductVariantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [variants, setVariants] = useState<StorefrontProductVariant[]>([]);
  const [activeVariant, setActiveVariant] = useState<StorefrontProductVariant | null>(null);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeVariantLoading, setActiveVariantLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVariantsByProductId = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<VariantsResponse>(`/product-variants/public/product/${productId}`);
      if (!res.data.success) throw new Error("Failed to fetch product variants");
      setVariants(res.data.data || []);
      setCount(res.data.count || 0);
      return res.data.data || [];
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string }; message?: string }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message ?? "Failed to fetch product variants";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductVariantDetailsById = useCallback(async (variantId: string, productId?: string) => {
    try {
      setActiveVariantLoading(true);
      setError(null);
      const res = await axiosi.get<VariantByIdResponse>(`/product-variants/public/${variantId}`, {
        params: productId ? { productId } : undefined,
      });
      if (!res.data.success) throw new Error("Failed to fetch product variant details");
      const variant = res.data.data || null;
      setActiveVariant(variant);
      return variant;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string }; message?: string }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message ?? "Failed to fetch product variant details";
      setError(msg);
      setActiveVariant(null);
      return null;
    } finally {
      setActiveVariantLoading(false);
    }
  }, []);

  const clearActiveVariant = useCallback(() => {
    setActiveVariant(null);
    setActiveVariantLoading(false);
  }, []);

  const clear = useCallback(() => {
    setVariants([]);
    setActiveVariant(null);
    setCount(0);
    setError(null);
    setLoading(false);
    setActiveVariantLoading(false);
  }, []);

  const value: StorefrontProductVariantContextType = {
    variants,
    activeVariant,
    count,
    loading,
    activeVariantLoading,
    error,
    fetchVariantsByProductId,
    fetchProductVariantDetailsById,
    clearActiveVariant,
    clear,
  };

  return <StorefrontProductVariantContext.Provider value={value}>{children}</StorefrontProductVariantContext.Provider>;
};

export const useStorefrontProductVariants = (): StorefrontProductVariantContextType => {
  const ctx = useContext(StorefrontProductVariantContext);
  if (!ctx) throw new Error("useStorefrontProductVariants must be used within a StorefrontProductVariantProvider");
  return ctx;
};

export default StorefrontProductVariantContext;
