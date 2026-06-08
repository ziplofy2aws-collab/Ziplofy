import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type TransferStatus =
  | "draft"
  | "ready_to_ship"
  | "in_progress"
  | "transferred"
  | "cancelled";

export interface TransferLocation {
  _id: string;
  storeId: string;
  name: string;
  countryRegion: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  canShip: boolean;
  canLocalDeliver: boolean;
  canPickup: boolean;
  isDefault: boolean;
  isFulfillmentAllowed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferTagDoc {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  _id: string;
  storeId: string;
  originLocationId: TransferLocation; // populated Location doc
  destinationLocationId: TransferLocation; // populated Location doc
  referenceName?: string;
  note?: string;
  tags: TransferTagDoc[]; // populated TransferTag docs
  transferDate?: string; // ISO string
  status: TransferStatus;
  createdAt: string;
  updatedAt: string;
}

interface CreateTransferPayload {
  storeId: string;
  originLocationId: string;
  destinationLocationId: string;
  referenceName?: string;
  note?: string;
  tags?: string[];
  transferDate?: string;
  entries: Array<{ variantId: string; quantity: number }>;
}

interface CreateTransferResponse {
  success: boolean;
  data: Transfer;
}

interface GetTransfersResponse {
  success: boolean;
  data: Transfer[];
}

interface DeleteTransferResponse {
  success: boolean;
  message: string;
}

interface UpdateTransferPayload {
  referenceName?: string;
  note?: string;
  tags?: string[];
  transferDate?: string;
  receivedDate?: string;
  status?: TransferStatus;
}

interface UpdateTransferResponse {
  success: boolean;
  data: Transfer;
  message: string;
}

interface TransferContextType {
  transfers: Transfer[];
  loading: boolean;
  error: string | null;
  createTransfer: (payload: CreateTransferPayload) => Promise<Transfer>;
  fetchTransfersByStoreId: (storeId: string) => Promise<Transfer[]>;
  updateTransfer: (transferId: string, payload: UpdateTransferPayload) => Promise<Transfer>;
  deleteTransfer: (transferId: string) => Promise<void>;
  markReadyToShip: (transferId: string) => Promise<Transfer>;
  setTransfers: React.Dispatch<React.SetStateAction<Transfer[]>>;
  clearError: () => void;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export const TransferProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const createTransfer = useCallback(async (payload: CreateTransferPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CreateTransferResponse>('/transfers', payload);
      if (!res.data.success) throw new Error('Failed to create transfer');
      const transfer = res.data.data;
      setTransfers(prev => [transfer, ...prev]);
      return transfer;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create transfer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransfersByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetTransfersResponse>(`/transfers/store/${storeId}`);
      if (!res.data.success) throw new Error('Failed to fetch transfers');
      const list = res.data.data || [];
      setTransfers(list);
      return list;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch transfers';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransfer = useCallback(async (transferId: string, payload: UpdateTransferPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.put<UpdateTransferResponse>(`/transfers/${transferId}`, payload);
      if (!res.data.success) throw new Error('Failed to update transfer');
      
      // Update the transfer in local state
      setTransfers(prev => prev.map(transfer => 
        transfer._id === transferId ? res.data.data : transfer
      ));
      return res.data.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update transfer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransfer = useCallback(async (transferId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<DeleteTransferResponse>(`/transfers/${transferId}`);
      if (!res.data.success) throw new Error('Failed to delete transfer');
      
      // Remove the transfer from local state
      setTransfers(prev => prev.filter(transfer => transfer._id !== transferId));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete transfer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markReadyToShip = useCallback(async (transferId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Trigger backend side-effects but do not depend on response shape
      await axiosi.post<{ success: boolean; message: string }>(`/transfers/${transferId}/ready-to-ship`);
      // Locally update only the status for the targeted transfer
      let updatedTransfer: Transfer | null = null;
      setTransfers(prev => prev.map(t => {
        if (t._id === transferId) {
          updatedTransfer = { ...t, status: 'ready_to_ship' };
          return updatedTransfer;
        }
        return t;
      }));
      // Fallback return of the locally-updated object (not from backend)
      if (!updatedTransfer) {
        // If not found in state, throw to indicate no-op
        throw new Error('Transfer not found in local state');
      }
      return updatedTransfer;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to mark as ready to ship';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: TransferContextType = {
    transfers,
    loading,
    error,
    createTransfer,
    fetchTransfersByStoreId,
    updateTransfer,
    deleteTransfer,
    markReadyToShip,
    setTransfers,
    clearError,
  };

  return (
    <TransferContext.Provider value={value}>{children}</TransferContext.Provider>
  );
};

export const useTransfers = (): TransferContextType => {
  const ctx = useContext(TransferContext);
  if (!ctx) throw new Error('useTransfers must be used within a TransferProvider');
  return ctx;
};


