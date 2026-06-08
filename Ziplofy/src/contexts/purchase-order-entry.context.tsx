import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

// ----------------------------
// Types matching backend API
// ----------------------------
export interface PurchaseOrderEntryVariantProductRef {
  _id: string;
  title?: string;
}

export interface PurchaseOrderEntryVariantRef {
  _id: string;
  sku: string;
  optionValues?: Record<string, string>; // e.g., { Size: "Large", Color: "Blue" }
  productId?: PurchaseOrderEntryVariantProductRef | string;
}

export interface PurchaseOrderEntryDoc {
  _id: string;
  purchaseOrderId: string;
  variantId: PurchaseOrderEntryVariantRef | string;
  supplierSku?: string;
  quantityOrdered: number;
  quantityReceived: number;
  cost: number;
  taxPercent?: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

type GetEntriesResponse = {
  success: boolean;
  data: PurchaseOrderEntryDoc[];
  count: number;
}

// ----------------------------
// Context types
// ----------------------------
interface PurchaseOrderEntryContextType {
  entries: PurchaseOrderEntryDoc[];
  loading: boolean;
  error: string | null;
  fetchEntriesByPurchaseOrderId: (purchaseOrderId: string) => Promise<void>;
  clearEntries: () => void;
}

const PurchaseOrderEntryContext = createContext<PurchaseOrderEntryContextType | undefined>(undefined);

export function PurchaseOrderEntryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<PurchaseOrderEntryDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntriesByPurchaseOrderId = useCallback(async (purchaseOrderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.get<GetEntriesResponse>(`/purchase-order-entries/purchase-order/${purchaseOrderId}`);
      setEntries(data.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to fetch purchase order entries';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
    setError(null);
    setLoading(false);
  }, []);

  const value = useMemo<PurchaseOrderEntryContextType>(() => ({
    entries,
    loading,
    error,
    fetchEntriesByPurchaseOrderId,
    clearEntries,
  }), [entries, loading, error, fetchEntriesByPurchaseOrderId, clearEntries]);

  return (
    <PurchaseOrderEntryContext.Provider value={value}>
      {children}
    </PurchaseOrderEntryContext.Provider>
  );
}

export function usePurchaseOrderEntries(): PurchaseOrderEntryContextType {
  const ctx = useContext(PurchaseOrderEntryContext);
  if (!ctx) throw new Error('usePurchaseOrderEntries must be used within a PurchaseOrderEntryProvider');
  return ctx;
}


