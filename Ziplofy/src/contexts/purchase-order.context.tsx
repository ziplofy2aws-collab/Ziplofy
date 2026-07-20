import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Types mirrored from backend responses
export type PurchaseOrderStatus =
  | 'draft'
  | 'ordered'
  | 'in_transit'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export interface ICostAdjustment {
  name: string;
  amount: number;
  currency?: string;
}

export interface IPurchaseOrder {
  _id: string;
  storeId: { _id: string; storeName?: string } | string;
  supplierId: { _id: string; name?: string } | string;
  destinationLocationId: { _id: string; name?: string; address?: string } | string;
  tags: Array<{ _id: string; name?: string }>;
  paymentTerm?: string;
  supplierCurrency?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  expectedArrivalDate?: string;
  orderDate: string;
  subtotalCost?: number;
  totalTax?: number;
  totalCost?: number;
  costAdjustments?: ICostAdjustment[];
  status: PurchaseOrderStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePurchaseOrderEntry {
  variantId: string;
  supplierSku?: string;
  quantityOrdered: number;
  cost: number;
  taxPercent?: number;
}

export interface ICreatePurchaseOrderBody {
  storeId: string;
  supplierId: string;
  destinationLocationId: string;
  referenceNumber?: string;
  noteToSupplier?: string;
  tags?: string[];
  paymentTerm?: string;
  supplierCurrency?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  expectedArrivalDate?: string; // ISO string
  orderDate?: string; // ISO string
  costAdjustments?: ICostAdjustment[];
  status?: PurchaseOrderStatus;
  entries: ICreatePurchaseOrderEntry[];
}

type CreatePurchaseOrderResponse = {
  success: true;
  message: string;
  data: { purchaseOrder: IPurchaseOrder };
};

type GetPurchaseOrdersResponse = {
  success: true;
  message: string;
  data: { purchaseOrders: IPurchaseOrder[] };
};

interface PurchaseOrderContextType {
  purchaseOrders: IPurchaseOrder[];
  loading: boolean;
  error: string | null;
  createPurchaseOrder: (body: ICreatePurchaseOrderBody) => Promise<IPurchaseOrder>;
  fetchPurchaseOrdersByStore: (storeId: string) => Promise<void>;
  markAsOrdered: (poId: string) => Promise<IPurchaseOrder>;
  receiveInventory: (
    poId: string,
    entries: Array<{ entryId: string; accept: number; reject?: number }>
  ) => Promise<'partially_received' | 'received'>;
}

const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

export function PurchaseOrderProvider({ children }: { children: React.ReactNode }) {
  const [purchaseOrders, setPurchaseOrders] = useState<IPurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createPurchaseOrder = useCallback(async (body: ICreatePurchaseOrderBody): Promise<IPurchaseOrder> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.post<CreatePurchaseOrderResponse>('/purchase-orders', body);
      const po = data.data.purchaseOrder;
      // Optimistically add to state (front of list)
      setPurchaseOrders(prev => [po, ...prev]);
      return po;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create purchase order';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPurchaseOrdersByStore = useCallback(async (storeId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.get<GetPurchaseOrdersResponse>(`/purchase-orders/store/${storeId}`);
      setPurchaseOrders(data.data.purchaseOrders);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to fetch purchase orders';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsOrdered = useCallback(async (poId: string): Promise<IPurchaseOrder> => {
    setLoading(true);
    setError(null);
    try {
      await axiosi.patch<{ success: true }>(`/purchase-orders/${poId}/mark-ordered`);
      let updatedPo: IPurchaseOrder | null = null;
      setPurchaseOrders(prev => prev.map(p => {
        if (p._id === poId) {
          updatedPo = { ...p, status: 'ordered' } as IPurchaseOrder;
          return updatedPo;
        }
        return p;
      }));
      // Fallback if not found in state
      if (!updatedPo) {
        updatedPo = { _id: poId, status: 'ordered' } as IPurchaseOrder;
      }
      return updatedPo;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to mark as ordered';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const receiveInventory = useCallback(async (
    poId: string,
    entries: Array<{ entryId: string; accept: number; reject?: number }>
  ): Promise<'partially_received' | 'received'> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.post<{ success: true; data: { status: 'partially_received' | 'received' } }>(
        `/purchase-orders/${poId}/receive`,
        { entries }
      );
      const newStatus = data.data.status;
      setPurchaseOrders(prev => prev.map(p => (p._id === poId ? { ...p, status: newStatus } as IPurchaseOrder : p)));
      return newStatus;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to receive inventory';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<PurchaseOrderContextType>(() => ({
    purchaseOrders,
    loading,
    error,
    createPurchaseOrder,
    fetchPurchaseOrdersByStore,
    markAsOrdered,
    receiveInventory,
  }), [purchaseOrders, loading, error, createPurchaseOrder, fetchPurchaseOrdersByStore, markAsOrdered, receiveInventory]);

  return (
    <PurchaseOrderContext.Provider value={value}>
      {children}
    </PurchaseOrderContext.Provider>
  );
}

export function usePurchaseOrders(): PurchaseOrderContextType {
  const ctx = useContext(PurchaseOrderContext);
  if (!ctx) throw new Error('usePurchaseOrders must be used within a PurchaseOrderProvider');
  return ctx;
}


