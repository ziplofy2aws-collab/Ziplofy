import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Location interface (matches backend model)
export interface Location {
  _id: string;
  storeId: string;
  name: string;
  countryRegion: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  canShip: boolean;
  canLocalDeliver: boolean;
  canPickup: boolean;
  isFulfillmentAllowed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create/Update request payloads
export type CreateLocationRequest = Omit<Location, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateLocationRequest = Partial<Omit<Location, '_id' | 'storeId' | 'createdAt' | 'updatedAt'>> & { storeId?: never };

// API response interfaces
interface CreateLocationResponse { success: boolean; data: Location; message: string; }
interface GetLocationsByStoreResponse { success: boolean; data: Location[]; count: number; }
interface UpdateLocationResponse { success: boolean; data: Location; message: string; }
interface DeleteLocationResponse { success: boolean; data: { deletedLocation: { id: string; name: string } }; message: string; }

// Context type
interface LocationsContextType {
  locations: Location[];
  loading: boolean;
  error: string | null;
  fetchLocationsByStoreId: (storeId: string) => Promise<void>;
  createLocation: (payload: CreateLocationRequest) => Promise<Location>;
  updateLocation: (locationId: string, payload: UpdateLocationRequest) => Promise<Location>;
  deleteLocation: (locationId: string) => Promise<void>;
  clearError: () => void;
  clearLocations: () => void;
}

const LocationsContext = createContext<LocationsContextType | undefined>(undefined);

export const LocationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationsByStoreId = useCallback(async (storeId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.get<GetLocationsByStoreResponse>(`/locations/store/${storeId}`);
      setLocations(data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLocation = useCallback(async (payload: CreateLocationRequest): Promise<Location> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.post<CreateLocationResponse>('/locations', payload);
      setLocations(prev => [data.data, ...prev]);
      return data.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create location');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (locationId: string, payload: UpdateLocationRequest): Promise<Location> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.put<UpdateLocationResponse>(`/locations/${locationId}`, payload);
      setLocations(prev => prev.map(l => (l._id === locationId ? data.data : l)));
      return data.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update location');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLocation = useCallback(async (locationId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await axiosi.delete<DeleteLocationResponse>(`/locations/${locationId}`);
      setLocations(prev => prev.filter(l => l._id !== locationId));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete location');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearLocations = useCallback(() => { setLocations([]); setError(null); setLoading(false); }, []);

  const value: LocationsContextType = {
    locations,
    loading,
    error,
    fetchLocationsByStoreId,
    createLocation,
    updateLocation,
    deleteLocation,
    clearError,
    clearLocations,
  };

  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  );
};

export const useLocations = (): LocationsContextType => {
  const ctx = useContext(LocationsContext);
  if (!ctx) {
    throw new Error('useLocations must be used within a LocationsProvider');
  }
  return ctx;
};

export default LocationsContext;


