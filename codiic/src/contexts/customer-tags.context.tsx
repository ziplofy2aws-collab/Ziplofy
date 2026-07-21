import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Customer tag interface
export interface CustomerTag {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Create customer tag API response interface
export interface CreateCustomerTagApiResponseType {
  success: boolean;
  message: string;
  data: CustomerTag;
}

// Delete customer tag API response interface
export interface DeleteCustomerTagApiResponseType {
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

// Fetch customer tags API response interface
export interface FetchCustomerTagsApiResponseType {
  success: boolean;
  message: string;
  data: CustomerTag[];
  count: number;
}

// Customer tags context interface
interface CustomerTagsContextType {
  customerTags: CustomerTag[];
  loading: boolean;
  error: string | null;
  fetchCustomerTags: (storeId: string) => Promise<void>;
  addCustomerTag: (storeId: string, name: string) => Promise<CustomerTag>;
  deleteCustomerTag: (tagId: string) => Promise<void>;
  clearError: () => void;
  clearCustomerTags: () => void;
}

// Create context
const CustomerTagsContext = createContext<CustomerTagsContextType | undefined>(undefined);

// Customer tags provider component
export const CustomerTagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customerTags, setCustomerTags] = useState<CustomerTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer tags for a store
  const fetchCustomerTags = useCallback(async (storeId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.get<FetchCustomerTagsApiResponseType>(`/customer-tags/store/${storeId}`);
      setCustomerTags(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch customer tags';
      setError(errorMessage);
      console.error('Error fetching customer tags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new customer tag
  const addCustomerTag = useCallback(async (storeId: string, name: string): Promise<CustomerTag> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.post<CreateCustomerTagApiResponseType>('/customer-tags', { storeId, name: name.trim() });
      const newTag = response.data.data;
      setCustomerTags(prevTags => [newTag, ...prevTags]);
      return newTag;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create customer tag';
      setError(errorMessage);
      console.error('Error creating customer tag:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a customer tag
  const deleteCustomerTag = useCallback(async (tagId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axiosi.delete<DeleteCustomerTagApiResponseType>(`/customer-tags/${tagId}`);
      setCustomerTags(prevTags => prevTags.filter(tag => tag._id !== tagId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete customer tag';
      setError(errorMessage);
      console.error('Error deleting customer tag:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear customer tags
  const clearCustomerTags = useCallback(() => {
    setCustomerTags([]);
  }, []);

  const value: CustomerTagsContextType = {
    customerTags,
    loading,
    error,
    fetchCustomerTags,
    addCustomerTag,
    deleteCustomerTag,
    clearError,
    clearCustomerTags,
  };

  return (
    <CustomerTagsContext.Provider value={value}>
      {children}
    </CustomerTagsContext.Provider>
  );
};

// Custom hook to use customer tags context
export const useCustomerTags = (): CustomerTagsContextType => {
  const context = useContext(CustomerTagsContext);
  if (context === undefined) {
    throw new Error('useCustomerTags must be used within a CustomerTagsProvider');
  }
  return context;
};

export default CustomerTagsContext;
