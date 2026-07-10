import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Product interface (matches API shape at creation and list)
export interface Product {
  _id: string;
  storeId: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
    parent: string | null;
    hasChildren: boolean;
    createdAt: string;
    updatedAt: string;
  };
  price: number;
  chargeTax: boolean;
  compareAtPrice?: number;
  cost: number;
  inventoryTrackingEnabled: boolean;
  quantity?: number;
  sku: string;
  barcode: string;
  continueSellingWhenOutOfStock: boolean;
  isPhysicalProduct: boolean;
  package: {
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
  };
  productWeight: number;
  productWeightUnit: string;
  countryOfOrigin: string;
  harmonizedSystemCode: string;
  variants: {
    optionName: string;
    values: string[];
    _id: string;
  }[];
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  profit: number;
  marginPercent: number;
  unitPriceTotalAmount?: number;
  unitPriceTotalAmountMetric?: string;
  unitPriceBaseMeasure?: number;
  unitPriceBaseMeasureMetric?: string;
  status: 'active' | 'draft';
  onlineStorePublishing: boolean;
  pointOfSalePublishing: boolean;
  productType: {
    _id: string;
    storeId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  vendor: {
    _id: string;
    storeId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  tagIds: {
    _id: string;
    storeId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }[];
  imageUrls?: string[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// API responses
interface CreateProductResponse {
  success: boolean;
  data: Product;
  message?: string;
  error?: string;
  details?: { message?: string };
}

interface GetProductsByStoreResponse {
  success: boolean;
  data: Product[];
  count: number;
  message?: string;
  error?: string;
  details?: { message?: string };
}

// Search products + variants availability (matches server response)
// Search responses from various controllers
export interface ProductSearchVariantAvailability {
  origin: number;
  destination: number;
}

export interface ProductSearchVariant {
  _id: string;
  sku: string;
  optionValues: Record<string, string>;
  price: number;
  images: string[];
  availability?: ProductSearchVariantAvailability;
  compareAtPrice?: number;
}

export interface ProductSearchProductSummary {
  _id: string;
  title: string;
  sku: string;
  imageUrl: string | null;
  productType?: string;
  vendor?: string;
  status?: string;
}

export interface ProductSearchWithVariantsItem {
  product: ProductSearchProductSummary;
  variants: ProductSearchVariant[];
}

export interface ProductSearchPagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface ProductSearchResponse {
  success: boolean;
  data: ProductSearchWithVariantsItem[];
  pagination: ProductSearchPagination;
}

export interface ProductSearchBasicItem {
  _id: string;
  title: string;
  imageUrl: string | null;
}

// Create payload interface matching API expectations
export interface CreateProductPayload {
  title: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  chargeTax: boolean;
  cost: number;
  profit: number;
  marginPercent: number;
  storeId: string;
  unitPriceTotalAmount?: number;
  unitPriceTotalAmountMetric?: string;
  unitPriceBaseMeasure?: number;
  unitPriceBaseMeasureMetric?: string;
  inventoryTrackingEnabled: boolean;
  quantity?: number;
  continueSellingWhenOutOfStock: boolean;
  sku: string;
  barcode: string;
  isPhysicalProduct: boolean;
  package?: string;
  productWeight?: number;
  productWeightUnit?: string;
  countryOfOrigin?: string;
  harmonizedSystemCode?: string;
  variants: Array<{
    optionName: string;
    values: string[];
  }>;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  status: 'active' | 'draft';
  onlineStorePublishing: boolean;
  pointOfSalePublishing: boolean;
  imageUrls?: string[];
  isDeleted?: boolean;
  productType: string;
  vendor: string;
  tagIds: string[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface SearchProductsWithVariantsArgs {
  storeId: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface SearchProductsForTransferArgs extends SearchProductsWithVariantsArgs {
  originLocationId?: string;
  destinationLocationId?: string;
}

export interface SearchProductsWithDestinationArgs extends SearchProductsWithVariantsArgs {
  destinationLocationId: string;
}

interface ProductContextType {
  products: Product[];
  activeProduct: Product | null;
  loading: boolean;
  activeProductLoading: boolean;
  error: string | null;
  transferProductSearchResult: ProductSearchWithVariantsItem[];
  transferProductSearchPagination: ProductSearchPagination | null;
  createProduct: (payload: CreateProductPayload) => Promise<Product>;
  updateProduct: (productId: string, payload: UpdateProductPayload) => Promise<Product>;
  fetchProductsByStoreId: (storeId: string) => Promise<void>;
  fetchProductById: (productId: string) => Promise<Product>;
  clearProducts: () => void;
  clearActiveProduct: () => void;
  addVariantsToProduct: (productId: string, variants: Array<{ optionName: string; values: string[] }>) => Promise<{ _id: string }[]>;
  deleteVariantFromProduct: (productId: string, dimensionName: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addOptionToProduct: (productId: string, optionName: string, values: string[]) => Promise<{ _id: string }[]>;
  searchProductForTransfer: (args: SearchProductsForTransferArgs) => Promise<ProductSearchResponse>;
  searchProductsWithVariants: (args: SearchProductsWithVariantsArgs) => Promise<ProductSearchResponse>;
  searchBasic: (args: { q: string; storeId?: string }) => Promise<ProductSearchBasicItem[]>;
  searchProductWithVariantAndDestination: (args: SearchProductsWithDestinationArgs) => Promise<ProductSearchResponse>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeProductLoading, setActiveProductLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transferProductSearchResult, setTransferProductSearchResult] = useState<ProductSearchWithVariantsItem[]>([]);
  const [transferProductSearchPagination, setTransferProductSearchPagination] = useState<ProductSearchPagination | null>(null);

  const extractApiErrorMessage = useCallback((err: any, fallback: string) => {
    const apiMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data?.details?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
    if (typeof err?.message === 'string' && err.message.trim()) return err.message;
    return fallback;
  }, []);

  const createProduct = useCallback(async (payload: CreateProductPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateProductResponse>('/products', payload);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to create product');
      // prepend to list
      setProducts(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to create product');
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const updateProduct = useCallback(async (productId: string, payload: UpdateProductPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.patch<CreateProductResponse>(`/products/${productId}`, payload);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to update product');
      setProducts((prev) => prev.map((product) => (product._id === productId ? data : product)));
      setActiveProduct((prev) => (prev && prev._id === productId ? data : prev));
      return data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to update product');
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const fetchProductsByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetProductsByStoreResponse>(`/products/store/${storeId}`);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to fetch products');
      setProducts(data);
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to fetch products');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const fetchProductById = useCallback(async (productId: string): Promise<Product> => {
    try {
      setActiveProductLoading(true);
      setError(null);
      const res = await axiosi.get<CreateProductResponse>(`/products/${productId}`);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to fetch product details');
      setActiveProduct(data);
      setProducts((prev) => {
        const exists = prev.some((product) => product._id === data._id);
        if (exists) {
          return prev.map((product) => (product._id === data._id ? data : product));
        }
        return [data, ...prev];
      });
      return data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to fetch product details');
      setError(msg);
      setActiveProduct(null);
      throw new Error(msg);
    } finally {
      setActiveProductLoading(false);
    }
  }, [extractApiErrorMessage]);

  const clearProducts = useCallback(() => {
    setProducts([]);
    setError(null);
    setLoading(false);
  }, []);

  const clearActiveProduct = useCallback(() => {
    setActiveProduct(null);
    setActiveProductLoading(false);
  }, []);

  const addVariantsToProduct = useCallback(async (
    productId: string,
    variants: Array<{ optionName: string; values: string[] }>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<{ success: boolean; data: any[]; count: number; message?: string }>(
        `/products/${productId}/variants`,
        { variants }
      );
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to add variants');
      return data as { _id: string }[];
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to add variants');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const deleteVariantFromProduct = useCallback(async (
    productId: string,
    dimensionName: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<{ success: boolean; data: any[]; count: number; message?: string }>(
        `/products/${productId}/variants`,
        { data: { dimensionName } }
      );
      const { success } = res.data;
      if (!success) throw new Error('Failed to delete variant dimension');
      // No return value - this function just performs the deletion
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to delete variant dimension');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<{ success: boolean; data?: { _id: string; isDeleted: boolean }; message?: string }>(
        `/products/${productId}`
      );
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to delete product');
      setProducts((prev) =>
        prev.map((product) =>
          product._id === productId ? { ...product, isDeleted: data?.isDeleted ?? true } : product
        )
      );
      setActiveProduct((prev) =>
        prev && prev._id === productId ? { ...prev, isDeleted: data?.isDeleted ?? true } : prev
      );
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to delete product');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const addOptionToProduct = useCallback(async (
    productId: string,
    optionName: string,
    values: string[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<{ success: boolean; data: any[]; count: number; message?: string }>(
        `/products/${productId}/variants/${optionName}/options`,
        { optionName, values }
      );
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to add option values');
      return data as { _id: string }[];
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to add option values');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const searchProductForTransfer = useCallback(async (args: SearchProductsForTransferArgs): Promise<ProductSearchResponse> => {
    const { storeId, q = '', originLocationId, destinationLocationId, page = 1, limit = 20 } = args;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ProductSearchResponse>(
        `/products/search`,
        {
          params: {
            storeId,
            q,
            originLocationId,
            destinationLocationId,
            page,
            limit,
          }
        }
      );
      // Persist results in context for transfer UI
      setTransferProductSearchResult(res.data.data || []);
      setTransferProductSearchPagination(res.data.pagination || null);
      return res.data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to search products');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const searchBasic = useCallback(async (args: { q: string; storeId?: string }) => {
    const { q, storeId } = args;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<{ success: boolean; data: ProductSearchBasicItem[] }>(
        `/products/search-basic`,
        { params: { q, storeId } }
      );
      return res.data.data || [];
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to search products');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const searchProductsWithVariants = useCallback(async (args: SearchProductsWithVariantsArgs): Promise<ProductSearchResponse> => {
    const { storeId, q = '', page = 1, limit = 20 } = args;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ProductSearchResponse>(`/products/search-with-variants`, {
        params: { storeId, q, page, limit },
      });
      return res.data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to search products with variants');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const searchProductWithVariantAndDestination = useCallback(async (args: SearchProductsWithDestinationArgs) => {
    const { storeId, q = '', destinationLocationId, page = 1, limit = 20 } = args;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ProductSearchResponse>(
        `/products/search-product-with-variant-and-destination`,
        { params: { storeId, q, destinationLocationId, page, limit } }
      );
      return res.data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to search products with destination availability');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractApiErrorMessage]);

  const value = useMemo<ProductContextType>(
    () => ({
      products,
      activeProduct,
      loading,
      activeProductLoading,
      error,
      transferProductSearchResult,
      transferProductSearchPagination,
      createProduct,
      updateProduct,
      fetchProductsByStoreId,
      fetchProductById,
      clearProducts,
      clearActiveProduct,
      addVariantsToProduct,
      deleteVariantFromProduct,
      deleteProduct,
      addOptionToProduct,
      searchProductForTransfer,
      searchProductsWithVariants,
      searchBasic,
      searchProductWithVariantAndDestination,
    }),
    [
      products,
      activeProduct,
      loading,
      activeProductLoading,
      error,
      transferProductSearchResult,
      transferProductSearchPagination,
      createProduct,
      updateProduct,
      fetchProductsByStoreId,
      fetchProductById,
      clearProducts,
      clearActiveProduct,
      addVariantsToProduct,
      deleteVariantFromProduct,
      deleteProduct,
      addOptionToProduct,
      searchProductForTransfer,
      searchProductsWithVariants,
      searchBasic,
      searchProductWithVariantAndDestination,
    ]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductProvider');
  return ctx;
};

export default ProductContext;


