import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Shipping Profile Interfaces
export interface ShippingProfileStoreRef {
  _id: string;
  storeName: string;
}

// Product type (populated from backend)
export interface ShippingProfileProduct {
  _id: string;
  title: string;
  imageUrls?: string[];
}

// Product Variant type (populated from backend)
export interface ShippingProfileProductVariant {
  _id: string;
  productId: string | ShippingProfileProduct;
  optionValues: Record<string, string>;
  sku: string;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  profit?: number;
  marginPercent?: number;
  unitPriceTotalAmount?: number;
  unitPriceTotalAmountMetric?: string;
  unitPriceBaseMeasure?: number;
  unitPriceBaseMeasureMetric?: string;
  chargeTax?: boolean;
  weightValue: number;
  weightUnit: string;
  countryOfOrigin?: string | null;
  hsCode?: string;
  images?: string[];
  outOfStockContinueSelling: boolean;
  isPhysicalProduct?: boolean;
  isInventoryTrackingEnabled?: boolean;
  isSynthetic?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Location type (populated from backend)
export interface ShippingProfileLocation {
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

// Shipping Zone type (populated from backend)
export interface ShippingProfileShippingZone {
  _id: string;
  zoneName: string;
  shippingProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingProfileLocationSetting {
  locationId: string;
  location: ShippingProfileLocation | null;
  createNewRates: boolean;
  removeRates: boolean;
}

export interface ShippingProfile {
  _id: string;
  profileName: string;
  storeId: string | ShippingProfileStoreRef;
  productVariantIds: (ShippingProfileProductVariant | string)[];
  locationSettings: ShippingProfileLocationSetting[];
  shippingZoneIds: (ShippingProfileShippingZone | string)[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingProfilePayload {
  profileName: string;
  storeId: string;
}

export interface UpdateShippingProfilePayload {
  profileName: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total?: number;
    store?: {
      id: string;
      name: string;
    };
    productVariantsCount?: number;
    locationsCount?: number;
    shippingZonesCount?: number;
  };
}

interface ShippingProfileContextValue {
  shippingProfiles: ShippingProfile[];
  loading: boolean;
  error: string | null;
  total: number;
  createShippingProfile: (payload: CreateShippingProfilePayload) => Promise<ShippingProfile>;
  updateShippingProfile: (id: string, payload: UpdateShippingProfilePayload) => Promise<ShippingProfile>;
  deleteShippingProfile: (id: string) => Promise<string>;
  getShippingProfilesByStoreId: (storeId: string) => Promise<ShippingProfile[]>;
  clearShippingProfiles: () => void;
}

const ShippingProfileContext = createContext<ShippingProfileContextValue | undefined>(undefined);

export const ShippingProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingProfiles, setShippingProfiles] = useState<ShippingProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  const createShippingProfile = useCallback(async (payload: CreateShippingProfilePayload): Promise<ShippingProfile> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosi.post<ApiResponse<ShippingProfile>>('/shipping-profiles', payload);
      if (response.data.success) {
        const newProfile = response.data.data;
        setShippingProfiles((prev) => [newProfile, ...prev]);
        setTotal((prev) => prev + 1);
        return newProfile;
      } else {
        throw new Error(response.data.message || 'Failed to create shipping profile');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create shipping profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getShippingProfilesByStoreId = useCallback(async (storeId: string): Promise<ShippingProfile[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosi.get<ApiResponse<ShippingProfile[]>>(`/shipping-profiles/store/${storeId}`);
      if (response.data.success) {
        const profiles = response.data.data;
        setShippingProfiles(profiles);
        setTotal(response.data.meta?.total || profiles.length);
        return profiles;
      } else {
        throw new Error(response.data.message || 'Failed to fetch shipping profiles');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch shipping profiles';
      setError(errorMessage);
      setShippingProfiles([]);
      setTotal(0);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShippingProfile = useCallback(async (id: string, payload: UpdateShippingProfilePayload): Promise<ShippingProfile> => {
    setLoading(true);
    setError(null);
    try {
      if (!payload.profileName || !payload.profileName.trim()) {
        throw new Error('profileName is required');
      }
      const response = await axiosi.put<ApiResponse<ShippingProfile>>(`/shipping-profiles/${id}`, payload);
      if (response.data.success) {
        const updatedProfile = response.data.data;
        setShippingProfiles((prev) => prev.map((profile) => (profile._id === id ? updatedProfile : profile)));
        return updatedProfile;
      } else {
        throw new Error(response.data.message || 'Failed to update shipping profile');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update shipping profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteShippingProfile = useCallback(async (id: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosi.delete<ApiResponse<{ deletedId: string }>>(`/shipping-profiles/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete shipping profile');
      }
      const deletedId = response.data.data.deletedId;
      setShippingProfiles((prev) => prev.filter((profile) => profile._id !== deletedId));
      setTotal((prev) => Math.max(0, prev - 1));
      return deletedId;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete shipping profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearShippingProfiles = useCallback(() => {
    setShippingProfiles([]);
    setTotal(0);
    setError(null);
  }, []);

  const value = useMemo<ShippingProfileContextValue>(
    () => ({
      shippingProfiles,
      loading,
      error,
      total,
      createShippingProfile,
      updateShippingProfile,
      deleteShippingProfile,
      getShippingProfilesByStoreId,
      clearShippingProfiles,
    }),
    [
      shippingProfiles,
      loading,
      error,
      total,
      createShippingProfile,
      updateShippingProfile,
      deleteShippingProfile,
      getShippingProfilesByStoreId,
      clearShippingProfiles,
    ]
  );

  return <ShippingProfileContext.Provider value={value}>{children}</ShippingProfileContext.Provider>;
};

export const useShippingProfiles = (): ShippingProfileContextValue => {
  const context = useContext(ShippingProfileContext);
  if (context === undefined) {
    throw new Error('useShippingProfiles must be used within a ShippingProfileProvider');
  }
  return context;
};

