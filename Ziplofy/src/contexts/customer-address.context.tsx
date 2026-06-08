import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Types
export interface CustomerAddress {
  _id: string;
  customerId: string;
  country: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  phoneNumber: string;
  addressType?: string; // 'home' | 'office' | 'other' (backend accepts string)
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerAddressRequest {
  customerId: string;
  country: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  phoneNumber: string;
  addressType?: string;
}

export interface UpdateCustomerAddressRequest {
  country?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  phoneNumber?: string;
  addressType?: string;
}

export interface CreateCustomerAddressApiResponseType {
  success: boolean;
  message: string;
  data: CustomerAddress;
}

export interface UpdateCustomerAddressApiResponseType {
  success: boolean;
  message: string;
  data: CustomerAddress;
}

export interface DeleteCustomerAddressApiResponseType {
  success: boolean;
  message: string;
  data: {
    deletedAddress: {
      id: string;
      customerId: string;
      address: string;
    };
  };
}

export interface FetchCustomerAddressByCustomerIdApiResponseType {
  success: boolean;
  message: string;
  data: CustomerAddress[];
  count: number;
}

// Context
interface CustomerAddressContextType {
  addresses: CustomerAddress[];
  loading: boolean;
  error: string | null;
  fetchCustomerAddressesByCustomerId: (customerId: string) => Promise<void>;
  addCustomerAddress: (payload: CreateCustomerAddressRequest) => Promise<CustomerAddress>;
  updateCustomerAddress: (addressId: string, payload: UpdateCustomerAddressRequest) => Promise<CustomerAddress>;
  deleteCustomerAddress: (addressId: string) => Promise<void>;
  clearError: () => void;
  clearAddresses: () => void;
}

const CustomerAddressContext = createContext<CustomerAddressContextType | undefined>(undefined);

export const CustomerAddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerAddressesByCustomerId = useCallback(async (customerId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<FetchCustomerAddressByCustomerIdApiResponseType>(`/customer-address/customer/${customerId}`);
      setAddresses(res.data.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch customer addresses';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomerAddress = useCallback(async (payload: CreateCustomerAddressRequest): Promise<CustomerAddress> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateCustomerAddressApiResponseType>('/customer-address', payload);
      const created = res.data.data;
      setAddresses(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create customer address';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomerAddress = useCallback(async (addressId: string, payload: UpdateCustomerAddressRequest): Promise<CustomerAddress> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<UpdateCustomerAddressApiResponseType>(`/customer-address/${addressId}`, payload);
      const updated = res.data.data;
      setAddresses(prev => prev.map(a => (a._id === addressId ? updated : a)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update customer address';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomerAddress = useCallback(async (addressId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axiosi.delete<DeleteCustomerAddressApiResponseType>(`/customer-address/${addressId}`);
      setAddresses(prev => prev.filter(a => a._id !== addressId));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete customer address';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearAddresses = useCallback(() => setAddresses([]), []);

  const value: CustomerAddressContextType = {
    addresses,
    loading,
    error,
    fetchCustomerAddressesByCustomerId,
    addCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress,
    clearError,
    clearAddresses,
  };

  return (
    <CustomerAddressContext.Provider value={value}>
      {children}
    </CustomerAddressContext.Provider>
  );
};

export const useCustomerAddresses = (): CustomerAddressContextType => {
  const ctx = useContext(CustomerAddressContext);
  if (!ctx) throw new Error('useCustomerAddresses must be used within a CustomerAddressProvider');
  return ctx;
};

export default CustomerAddressContext;


