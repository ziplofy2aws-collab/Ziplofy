import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface Vendor {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorPayload {
  storeId: string;
  name: string;
}

interface CreateVendorResponse {
  success: boolean;
  message: string;
  data: Vendor;
}

interface DeleteVendorResponse {
  success: boolean;
  message: string;
  data: { deletedVendor: { id: string; storeId: string; name: string } };
}

interface GetVendorsByStoreResponse {
  success: boolean;
  data: Vendor[];
  count: number;
}

interface VendorContextType {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  createVendor: (payload: CreateVendorPayload) => Promise<Vendor>;
  deleteVendor: (id: string) => Promise<string>;
  fetchVendorsByStoreId: (storeId: string) => Promise<void>;
  clearVendors: () => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createVendor = useCallback(async (payload: CreateVendorPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateVendorResponse>('/vendors', payload);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to create vendor');
      setVendors(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create vendor';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVendor = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<DeleteVendorResponse>(`/vendors/${id}`);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to delete vendor');
      setVendors(prev => prev.filter(v => v._id !== data.deletedVendor.id));
      return data.deletedVendor.id;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete vendor';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVendorsByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetVendorsByStoreResponse>(`/vendors/store/${storeId}`);
      const { success, data } = res.data;
      if (!success) throw new Error('Failed to fetch vendors');
      setVendors(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch vendors';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearVendors = useCallback(() => {
    setVendors([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: VendorContextType = {
    vendors,
    loading,
    error,
    createVendor,
    deleteVendor,
    fetchVendorsByStoreId,
    clearVendors,
  };

  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
};

export const useVendors = (): VendorContextType => {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error('useVendors must be used within a VendorProvider');
  return ctx;
};

export const VendorsContext = VendorContext;


