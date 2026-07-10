import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';
import { toast } from 'react-hot-toast';

export interface ProductVariantPackage {
  _id: string;
  storeId: string;
  packageName: string;
  packageType: 'box' | 'envelope' | 'soft_package';
  length: number;
  width: number;
  height: number;
  dimensionsUnit: 'cm' | 'in';
  weight: number;
  weightUnit: 'g' | 'kg' | 'oz' | 'lb';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id: string;
  productId: string;
  optionValues: Record<string, string>;
  sku: string;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  profit?: number;
  marginPercent?: number;
  unitPriceTotalAmount?: number;
  unitPriceTotalAmountMetric?: string;
  unitPriceBaseMeasure?: number;
  unitPriceBaseMeasureMetric?: string;
  chargeTax?: boolean;
  weightValue: number;
  weightUnit: string;
  package?: ProductVariantPackage; // populated Packaging
  countryOfOrigin?: string | null;
  hsCode?: string;
  images?: string[]; // API returns array, not single image
  outOfStockContinueSelling: boolean;
  isPhysicalProduct?: boolean;
  isInventoryTrackingEnabled?: boolean;
  isSynthetic?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetVariantsResponse {
  success: boolean;
  data: ProductVariant[];
  count: number;
}

// Explicit response type matching backend shape for getVariantsByProductId
export interface GetProductVariantByProductIdApiResponseType {
  success: boolean;
  data: ProductVariant[];
  count: number;
}

interface ProductVariantContextType {
  variants: ProductVariant[];
  activeVariant: ProductVariant | null;
  loading: boolean;
  activeVariantLoading: boolean;
  error: string | null;
  fetchVariantsByProductId: (productId: string) => Promise<void>;
  fetchProductVariantDetailsById: (variantId: string, productId?: string) => Promise<ProductVariant | null>;
  updateVariant: (variantId: string, update: Partial<ProductVariant>) => Promise<ProductVariant>;
  clearActiveVariant: () => void;
  clearVariants: () => void;
}

const ProductVariantContext = createContext<ProductVariantContextType | undefined>(undefined);

export const ProductVariantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);
  const [activeVariantLoading, setActiveVariantLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVariantsByProductId = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetVariantsResponse>(`/product-variants/product/${productId}`);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to fetch variants');
      setVariants(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch variants';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductVariantDetailsById = useCallback(async (variantId: string, productId?: string) => {
    try {
      setActiveVariantLoading(true);
      setError(null);
      const res = await axiosi.get<{ success: boolean; data: ProductVariant }>(
        `/product-variants/${variantId}`,
        { params: productId ? { productId } : undefined }
      );
      const { success, data } = res.data;
      if (!success || !data) throw new Error('Failed to fetch variant details');
      setActiveVariant(data);
      setVariants((prev) => {
        const exists = prev.some((variant) => variant._id === data._id);
        if (exists) return prev.map((variant) => (variant._id === data._id ? data : variant));
        return [data, ...prev];
      });
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch variant details';
      setError(msg);
      setActiveVariant(null);
      return null;
    } finally {
      setActiveVariantLoading(false);
    }
  }, []);

  const updateVariant = useCallback(async (variantId: string, update: Partial<ProductVariant>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.patch<{ success: boolean; data: ProductVariant; message?: string }>(
        `/product-variants/${variantId}`,
        update,
      );
      const { success, data } = res.data;
      if (!success || !data) throw new Error('Failed to update variant');

      setVariants(prevVariants => 
        prevVariants.map(variant => 
          variant._id === variantId ? data : variant
        )
      );
      setActiveVariant((prev) => (prev && prev._id === variantId ? data : prev));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update variant';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearActiveVariant = useCallback(() => {
    setActiveVariant(null);
    setActiveVariantLoading(false);
  }, []);

  const clearVariants = useCallback(() => {
    setVariants([]);
    setActiveVariant(null);
    setError(null);
    setLoading(false);
    setActiveVariantLoading(false);
  }, []);

  const value: ProductVariantContextType = {
    variants,
    activeVariant,
    loading,
    activeVariantLoading,
    error,
    fetchVariantsByProductId,
    fetchProductVariantDetailsById,
    updateVariant,
    clearActiveVariant,
    clearVariants,
  };

  return (
    <ProductVariantContext.Provider value={value}>{children}</ProductVariantContext.Provider>
  );
};

export const useProductVariants = (): ProductVariantContextType => {
  const ctx = useContext(ProductVariantContext);
  if (!ctx) throw new Error('useProductVariants must be used within a ProductVariantProvider');
  return ctx;
};

export default ProductVariantContext;


