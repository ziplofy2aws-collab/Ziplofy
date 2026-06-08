import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface CustomerTag {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  storeId: string;
  firstName: string;
  lastName: string;
  language: string;
  email: string;
  phoneNumber: string;
  agreedToMarketingEmails: boolean;
  agreedToSmsMarketing: boolean;
  collectTax: 'collect' | 'dont_collect' | 'collect_unless_exempt';
  notes?: string;
  tagIds: CustomerTag[] | [];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  storeId: string;
  firstName: string;
  lastName: string;
  language: string;
  email: string;
  phoneNumber: string;
  agreedToMarketingEmails?: boolean;
  agreedToSmsMarketing?: boolean;
  collectTax?: 'collect' | 'dont_collect' | 'collect_unless_exempt';
  notes?: string;
  tagIds?: string[];
}

// Fetch customers by storeId API response interface
export interface FetchCustomersViaStoreIdResponseType {
  success: boolean;
  message: string;
  data: Customer[];
}

// Create Customer API response interface (explicit)
export interface CreateCustomerApiResponseType {
  success: boolean;
  message: string;
  data: Customer; // includes tagIds: CustomerTag[] | []
}

// Delete Customer API response interface (explicit)
export interface DeleteCustomerApiResponseType {
  success: boolean;
  message: string;
  data: {
    deletedCustomer: {
      id: string;
      name: string;
      email: string;
    }
  };
}

// Search Customers API response interface
export interface SearchCustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchCustomersByStoreId: (storeId: string) => Promise<void>;
  searchCustomers: (storeId: string, query: string, page?: number, limit?: number) => Promise<SearchCustomersResponse>;
  addCustomer: (payload: CreateCustomerRequest) => Promise<Customer>;
  deleteCustomer: (customerId: string) => Promise<void>;
  clearError: () => void;
  clearCustomers: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomersByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<FetchCustomersViaStoreIdResponseType>(`/customers/store/${storeId}`);
      setCustomers(res.data.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch customers';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCustomers = useCallback(async (storeId: string, query: string, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<SearchCustomersResponse>(`/customers/search/${storeId}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const { success, data, pagination } = res.data;
      if (!success) throw new Error('Failed to search customers');
      setCustomers(data);
      return { success, data, pagination };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to search customers';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = useCallback(async (payload: CreateCustomerRequest) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateCustomerApiResponseType>('/customers', payload);
      const created = res.data.data;
      // Prepend for recency
      setCustomers(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create customer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = useCallback(async (customerId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axiosi.delete<DeleteCustomerApiResponseType>(`/customers/${customerId}`);
      setCustomers(prev => prev.filter(c => c._id !== customerId));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete customer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearCustomers = useCallback(() => setCustomers([]), []);

  const value: CustomerContextType = {
    customers,
    loading,
    error,
    fetchCustomersByStoreId,
    searchCustomers,
    addCustomer,
    deleteCustomer,
    clearError,
    clearCustomers,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = (): CustomerContextType => {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomers must be used within a CustomerProvider');
  return ctx;
};

export default CustomerContext;


