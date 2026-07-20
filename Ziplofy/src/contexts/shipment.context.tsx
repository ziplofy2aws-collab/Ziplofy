import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'received' | 'cancelled';

export interface ShipmentDoc {
  _id: string;
  transferId: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedArrivalDate?: string; // ISO
  shippedDate?: string; // ISO
  receivedDate?: string; // ISO
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
}

interface CreateShipmentPayload {
  transferId: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedArrivalDate?: string; // ISO date
}

interface UpdateShipmentPayload {
  trackingNumber?: string;
  carrier?: string;
  estimatedArrivalDate?: string; // ISO date
}

interface ApiResponse<T> { success: boolean; data: T; message?: string }

interface ShipmentContextType {
  shipments: ShipmentDoc[];
  loading: boolean;
  error: string | null;
  createShipment: (payload: CreateShipmentPayload) => Promise<ShipmentDoc>;
  getShipmentByTransferId: (transferId: string) => Promise<ShipmentDoc | null>;
  updateShipment: (shipmentId: string, payload: UpdateShipmentPayload) => Promise<ShipmentDoc>;
  deleteShipment: (shipmentId: string) => Promise<void>;
  markShipmentInTransit: (shipmentId: string) => Promise<{ shipmentId: string; transferId: string }>;
  receiveShipment: (shipmentId: string, items: Array<{ entryId: string; accept: number; reject: number }>) => Promise<{ shipmentId: string; transferId: string }>;
  clearError: () => void;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipments, setShipments] = useState<ShipmentDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const createShipment = useCallback(async (payload: CreateShipmentPayload) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.post<ApiResponse<ShipmentDoc>>('/shipments', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create shipment');
      setShipments(prev => [data.data, ...prev.filter(s => s._id !== data.data._id)]);
      return data.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create shipment';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getShipmentByTransferId = useCallback(async (transferId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.get<ApiResponse<ShipmentDoc | null>>(`/shipments/transfer/${transferId}`);
      if (!data.success) throw new Error(data.message || 'Failed to fetch shipment');
      const shipment = data.data || null;
      if (shipment) {
        setShipments(prev => {
          const exists = prev.some(s => s._id === shipment._id);
          return exists ? prev.map(s => (s._id === shipment._id ? shipment : s)) : [shipment, ...prev];
        });
      }
      return shipment;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch shipment';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShipment = useCallback(async (shipmentId: string, payload: UpdateShipmentPayload) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.put<ApiResponse<ShipmentDoc>>(`/shipments/${shipmentId}`, payload);
      if (!data.success) throw new Error(data.message || 'Failed to update shipment');
      setShipments(prev => prev.map(s => (s._id === data.data._id ? data.data : s)));
      return data.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update shipment';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteShipment = useCallback(async (shipmentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.delete<{ success: boolean; message?: string }>(`/shipments/${shipmentId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete shipment');
      setShipments(prev => prev.filter(s => s._id !== shipmentId));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete shipment';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markShipmentInTransit = useCallback(async (shipmentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.get<{ success: boolean; data: { shipmentId: string; transferId: string }; message?: string }>(`/shipments/${shipmentId}/in-transit`);
      if (!data.success) throw new Error(data.message || 'Failed to mark shipment in transit');
      // Optimistically update local shipment status
      setShipments(prev => prev.map(s => (s._id === shipmentId ? { ...s, status: 'in_transit' } : s)));
      return data.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to mark shipment in transit';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const receiveShipment = useCallback(async (shipmentId: string, items: Array<{ entryId: string; accept: number; reject: number }>) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosi.post<{ success: boolean; data: { shipmentId: string; transferId: string }; message?: string }>(`/shipments/${shipmentId}/receive`, items);
      if (!data.success) throw new Error(data.message || 'Failed to receive shipment');
      // Optimistically update local shipment status
      setShipments(prev => prev.map(s => (s._id === shipmentId ? { ...s, status: 'received', receivedDate: new Date().toISOString() } : s)));
      return data.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to receive shipment';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: ShipmentContextType = {
    shipments,
    loading,
    error,
    createShipment,
    getShipmentByTransferId,
    updateShipment,
    deleteShipment,
    markShipmentInTransit,
    receiveShipment,
    clearError,
  };

  return (
    <ShipmentContext.Provider value={value}>{children}</ShipmentContext.Provider>
  );
};

export const useShipments = (): ShipmentContextType => {
  const ctx = useContext(ShipmentContext);
  if (!ctx) throw new Error('useShipments must be used within a ShipmentProvider');
  return ctx;
};