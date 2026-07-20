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

export interface UpdateCustomerRequest {
  firstName?: string;
  lastName?: string;
  language?: string;
  email?: string;
  phoneNumber?: string;
  agreedToMarketingEmails?: boolean;
  agreedToSmsMarketing?: boolean;
  collectTax?: 'collect' | 'dont_collect' | 'collect_unless_exempt';
  notes?: string;
  tagIds?: string[];
}

export interface GetCustomerByIdResponseType {
  success: boolean;
  message: string;
  data: Customer;
}

export interface UpdateCustomerApiResponseType {
  success: boolean;
  message: string;
  data: Customer;
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
  customerSearchResults: Customer[];
  activeCustomer: Customer | null;
  activeCustomerLoading: boolean;
  loading: boolean;
  customerSearchLoading: boolean;
  error: string | null;
  fetchCustomersByStoreId: (storeId: string) => Promise<void>;
  fetchCustomerById: (customerId: string) => Promise<Customer>;
  searchCustomers: (storeId: string, query: string, page?: number, limit?: number) => Promise<SearchCustomersResponse>;
  addCustomer: (payload: CreateCustomerRequest) => Promise<Customer>;
  updateCustomer: (customerId: string, payload: UpdateCustomerRequest) => Promise<Customer>;
  deleteCustomer: (customerId: string) => Promise<void>;
  clearActiveCustomer: () => void;
  clearCustomerSearchResults: () => void;
  clearError: () => void;
  clearCustomers: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [activeCustomerLoading, setActiveCustomerLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
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

  const fetchCustomerById = useCallback(async (customerId: string) => {
    try {
      setActiveCustomerLoading(true);
      setError(null);
      const res = await axiosi.get<GetCustomerByIdResponseType>(`/customers/${customerId}`);
      const customer = res.data.data;
      setActiveCustomer(customer);
      setCustomers((prev) => {
        const exists = prev.some((c) => c._id === customer._id);
        if (!exists) return [customer, ...prev];
        return prev.map((c) => (c._id === customer._id ? customer : c));
      });
      return customer;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch customer';
      setError(msg);
      throw err;
    } finally {
      setActiveCustomerLoading(false);
    }
  }, []);

  const searchCustomers = useCallback(async (storeId: string, query: string, page: number = 1, limit: number = 10) => {
    try {
      setCustomerSearchLoading(true);
      setError(null);
      const res = await axiosi.get<SearchCustomersResponse>(`/customers/search/${storeId}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const { success, data, pagination } = res.data;
      if (!success) throw new Error('Failed to search customers');
      setCustomerSearchResults(data);
      return { success, data, pagination };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to search customers';
      setError(msg);
      throw new Error(msg);
    } finally {
      setCustomerSearchLoading(false);
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

  const updateCustomer = useCallback(async (customerId: string, payload: UpdateCustomerRequest) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<UpdateCustomerApiResponseType>(`/customers/${customerId}`, payload);
      const updated = res.data.data;
      setCustomers((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setActiveCustomer((prev) => (prev?._id === updated._id ? updated : prev));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update customer';
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
      setActiveCustomer((prev) => (prev?._id === customerId ? null : prev));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete customer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearActiveCustomer = useCallback(() => {
    setActiveCustomer(null);
    setActiveCustomerLoading(false);
  }, []);

  const clearCustomerSearchResults = useCallback(() => {
    setCustomerSearchResults([]);
    setCustomerSearchLoading(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearCustomers = useCallback(() => {
    setCustomers([]);
    setCustomerSearchResults([]);
    setActiveCustomer(null);
  }, []);

  const value: CustomerContextType = {
    customers,
    customerSearchResults,
    activeCustomer,
    activeCustomerLoading,
    loading,
    customerSearchLoading,
    error,
    fetchCustomersByStoreId,
    fetchCustomerById,
    searchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    clearActiveCustomer,
    clearCustomerSearchResults,
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


