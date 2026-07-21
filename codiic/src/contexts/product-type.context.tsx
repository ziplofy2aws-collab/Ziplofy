import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Product type interface
export interface ProductType {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Create product type payload interface
export interface CreateProductTypePayload {
  storeId: string;
  name: string;
}

// API Response interfaces
export interface CreateProductTypeApiResponseType {
  success: boolean;
  data: ProductType;
  message: string;
}

export interface GetProductTypesByStoreIdApiResponseType {
  success: boolean;
  data: ProductType[];
  count: number;
  message: string;
}

export interface DeleteProductTypeApiResponseType {
  success: boolean;
  data: ProductType;
  message: string;
}

// Context interface
interface ProductTypeContextType {
  productTypes: ProductType[];
  loading: boolean;
  error: string | null;
  createProductType: (payload: CreateProductTypePayload) => Promise<ProductType>;
  getProductTypesByStoreId: (storeId: string) => Promise<void>;
  deleteProductType: (id: string) => Promise<string>;
  clearProductTypes: () => void;
}

// Create context
const ProductTypeContext = createContext<ProductTypeContextType | undefined>(undefined);

// Product type provider component
export const ProductTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create product type
  const createProductType = useCallback(async (payload: CreateProductTypePayload) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.post<CreateProductTypeApiResponseType>('/product-types/', payload);
      const { success, data } = response.data;
      
      if (success) {
        const newProductType = data;
        // Add the new product type to the existing array
        setProductTypes(prevProductTypes => [newProductType, ...prevProductTypes]);
        return newProductType;
      } else {
        setError('Failed to create product type');
        throw new Error('Failed to create product type');
      }
    } catch (err: any) {
      console.error('Error creating product type:', err);
      setError(err.response?.data?.message || 'Failed to create product type');
      throw err; // Re-throw to allow component to handle
    } finally {
      setLoading(false);
    }
  }, []);

  // Get product types by store ID
  const getProductTypesByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.get<GetProductTypesByStoreIdApiResponseType>(`/product-types/store/${storeId}`);
      const { success, data } = response.data;
      
      if (success) {
        setProductTypes(data);
      } else {
        setError('Failed to fetch product types');
      }
    } catch (err: any) {
      console.error('Error fetching product types:', err);
      setError(err.response?.data?.message || 'Failed to fetch product types');
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete product type
  const deleteProductType = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.delete<DeleteProductTypeApiResponseType>(`/product-types/${id}`);
      const { success, data } = response.data;
      
      if (success) {
        // Remove the product type from the array
        setProductTypes(prevProductTypes => 
          prevProductTypes.filter(pt => pt._id !== id)
        );
        return data._id;
      } else {
        setError('Failed to delete product type');
        throw new Error('Failed to delete product type');
      }
    } catch (err: any) {
      console.error('Error deleting product type:', err);
      setError(err.response?.data?.message || 'Failed to delete product type');
      throw err; // Re-throw to allow component to handle
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear product types data
  const clearProductTypes = useCallback(() => {
    setProductTypes([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: ProductTypeContextType = {
    productTypes,
    loading,
    error,
    createProductType,
    getProductTypesByStoreId,
    deleteProductType,
    clearProductTypes,
  };

  return (
    <ProductTypeContext.Provider value={value}>
      {children}
    </ProductTypeContext.Provider>
  );
};

// Custom hook to use product type context
export const useProductType = (): ProductTypeContextType => {
  const context = useContext(ProductTypeContext);
  if (context === undefined) {
    throw new Error('useProductType must be used within a ProductTypeProvider');
  }
  return context;
};

export default ProductTypeContext;
