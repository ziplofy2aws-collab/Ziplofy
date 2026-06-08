import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Product tag interface
export interface ProductTag {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Create product tag API response interface
export interface CreateProductTagApiResponseType {
  success: boolean;
  message: string;
  data: ProductTag;
}

// Delete product tag API response interface
export interface DeleteProductTagApiResponseType {
  success: boolean;
  message: string;
  data: {
    deletedTag: {
      id: string;
      storeId: string;
      name: string;
    };
  };
}

// Fetch product tags API response interface
export interface FetchProductTagsApiResponseType {
  success: boolean;
  message: string;
  data: ProductTag[];
  count: number;
}

// Product tags context interface
interface ProductTagsContextType {
  productTags: ProductTag[];
  loading: boolean;
  error: string | null;
  fetchProductTags: (storeId: string) => Promise<void>;
  addProductTag: (storeId: string, name: string) => Promise<ProductTag>;
  deleteProductTag: (tagId: string) => Promise<void>;
  clearError: () => void;
  clearProductTags: () => void;
}

// Create context
const ProductTagsContext = createContext<ProductTagsContextType | undefined>(undefined);

// Product tags provider component
export const ProductTagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [productTags, setProductTags] = useState<ProductTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product tags for a store
  const fetchProductTags = useCallback(async (storeId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.get<FetchProductTagsApiResponseType>(`/product-tags/store/${storeId}`);
      setProductTags(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch product tags';
      setError(errorMessage);
      console.error('Error fetching product tags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new product tag
  const addProductTag = useCallback(async (storeId: string, name: string): Promise<ProductTag> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.post<CreateProductTagApiResponseType>('/product-tags', { storeId, name: name.trim() });
      const newTag = response.data.data;
      setProductTags(prevTags => [newTag, ...prevTags]);
      return newTag;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create product tag';
      setError(errorMessage);
      console.error('Error creating product tag:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a product tag
  const deleteProductTag = useCallback(async (tagId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axiosi.delete<DeleteProductTagApiResponseType>(`/product-tags/${tagId}`);
      setProductTags(prevTags => prevTags.filter(tag => tag._id !== tagId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete product tag';
      setError(errorMessage);
      console.error('Error deleting product tag:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear product tags
  const clearProductTags = useCallback(() => {
    setProductTags([]);
  }, []);

  const value: ProductTagsContextType = {
    productTags,
    loading,
    error,
    fetchProductTags,
    addProductTag,
    deleteProductTag,
    clearError,
    clearProductTags,
  };

  return (
    <ProductTagsContext.Provider value={value}>
      {children}
    </ProductTagsContext.Provider>
  );
};

// Custom hook to use product tags context
export const useProductTags = (): ProductTagsContextType => {
  const context = useContext(ProductTagsContext);
  if (context === undefined) {
    throw new Error('useProductTags must be used within a ProductTagsProvider');
  }
  return context;
};

export default ProductTagsContext;


