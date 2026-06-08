import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { axiosi } from '../config/axios.config';
import type { StorefrontProductVariant } from './product-variant.context';
import { useStorefrontAuth, type StorefrontUser } from './storefront-auth.context';
import { safeLocalStorage } from '../types/local-storage';

export interface StorefrontCartItem {
  _id: string;
  storeId: string;
  productVariantId: StorefrontProductVariant;
  customerId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Guest cart item stored in localStorage
export interface GuestCartItem {
  _id: string; // Generated UUID for local tracking
  storeId: string;
  productVariantId: StorefrontProductVariant;
  quantity: number;
  createdAt: string;
}

interface CreateCartPayload {
  storeId: string;
  productVariantId: string;
  quantity?: number;
}

interface UpdateCartPayload {
  id: string;
  quantity: number;
}

interface StorefrontCartContextType {
  items: StorefrontCartItem[];
  guestItems: GuestCartItem[];
  loading: boolean;
  error: string | null;
  isGuest: boolean;
  createCartEntry: (payload: CreateCartPayload, variant?: StorefrontProductVariant) => Promise<StorefrontCartItem | GuestCartItem>;
  getCartByCustomerId: (customerId: string) => Promise<StorefrontCartItem[]>;
  updateCartEntry: (payload: UpdateCartPayload) => Promise<StorefrontCartItem | GuestCartItem>;
  deleteCartEntry: (id: string) => Promise<StorefrontCartItem | GuestCartItem>;
  setItems: (items: StorefrontCartItem[]) => void;
  clear: () => void;
  getAllItems: () => (StorefrontCartItem | GuestCartItem)[];
}

const GUEST_CART_KEY = 'ziplofy_guest_cart';

const generateId = () => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const StorefrontCartContext = createContext<StorefrontCartContextType | undefined>(undefined);

export const StorefrontCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<StorefrontCartItem[]>([]);
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, registerLogoutCallback, registerLoginCallback } = useStorefrontAuth();

  const isGuest = !user;

  // Load guest cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = safeLocalStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GuestCartItem[];
        setGuestItems(parsed);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (guestItems.length > 0) {
      safeLocalStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems));
    } else {
      safeLocalStorage.removeItem(GUEST_CART_KEY);
    }
  }, [guestItems]);

  // Sync guest cart to server when user logs in
  const syncGuestCartToServer = useCallback(async (loggedInUser: StorefrontUser) => {
    const stored = safeLocalStorage.getItem(GUEST_CART_KEY);
    if (!stored) return;

    try {
      const guestCart = JSON.parse(stored) as GuestCartItem[];
      if (guestCart.length === 0) return;

      setLoading(true);
      
      // Add each guest cart item to the server
      for (const guestItem of guestCart) {
        try {
          await axiosi.post('/storefront/cart', {
            storeId: guestItem.storeId,
            productVariantId: typeof guestItem.productVariantId === 'string' 
              ? guestItem.productVariantId 
              : guestItem.productVariantId._id,
            quantity: guestItem.quantity,
          });
        } catch {
          // Continue even if one item fails
        }
      }

      // Clear guest cart after sync
      safeLocalStorage.removeItem(GUEST_CART_KEY);
      setGuestItems([]);

      // Fetch updated cart from server
      const res = await axiosi.get<{ success: boolean; data: StorefrontCartItem[] }>(
        `/storefront/cart/customer/${loggedInUser._id}`
      );
      if (res.data.success) {
        setItems(res.data.data || []);
      }

      toast.success('Your cart has been synced!');
    } catch {
      // Silently fail sync
    } finally {
      setLoading(false);
    }
  }, []);

  // Register login callback to sync guest cart
  useEffect(() => {
    const unregister = registerLoginCallback(syncGuestCartToServer);
    return unregister;
  }, [registerLoginCallback, syncGuestCartToServer]);

  const createCartEntry = useCallback(async (
    payload: CreateCartPayload, 
    variant?: StorefrontProductVariant
  ): Promise<StorefrontCartItem | GuestCartItem> => {
    // If user is not logged in, add to guest cart
    if (!user) {
      if (!variant) {
        throw new Error('Variant data required for guest cart');
      }

      // Check if item already exists in guest cart
      const existingIdx = guestItems.findIndex(
        item => (typeof item.productVariantId === 'string' 
          ? item.productVariantId 
          : item.productVariantId._id) === payload.productVariantId
      );

      if (existingIdx >= 0) {
        // Update quantity
        const updated: GuestCartItem = {
          ...guestItems[existingIdx],
          quantity: guestItems[existingIdx].quantity + (payload.quantity || 1),
        };
        setGuestItems(prev => {
          const next = [...prev];
          next[existingIdx] = updated;
          return next;
        });
        toast.dismiss();
        toast.success('Product quantity updated in cart');
        return updated;
      }

      // Add new item
      const newItem: GuestCartItem = {
        _id: generateId(),
        storeId: payload.storeId,
        productVariantId: variant,
        quantity: payload.quantity || 1,
        createdAt: new Date().toISOString(),
      };
      setGuestItems(prev => [newItem, ...prev]);
      toast.dismiss();
      toast.success('Product added to cart');
      return newItem;
    }

    // User is logged in, use server API
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<{ success: boolean; data: StorefrontCartItem }>(`/storefront/cart`, payload);
      if (!res.data.success) throw new Error('Create cart entry failed');
      const created = res.data.data;
      setItems(prev => {
        const idx = prev.findIndex(i => i._id === created._id);
        if (idx >= 0) {
          const next = prev.slice();
          next[idx] = created;
          return next;
        }
        return [created, ...prev];
      });
      toast.dismiss();
      toast.success('Product added to cart');
      return created;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Create cart entry failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, guestItems]);

  const getCartByCustomerId = useCallback(async (customerId: string): Promise<StorefrontCartItem[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<{ success: boolean; data: StorefrontCartItem[]; count: number }>(`/storefront/cart/customer/${customerId}`);
      if (!res.data.success) throw new Error('Fetch cart failed');
      setItems(res.data.data || []);
      return res.data.data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Fetch cart failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCartEntry = useCallback(async (payload: UpdateCartPayload): Promise<StorefrontCartItem | GuestCartItem> => {
    // Check if it's a guest cart item
    if (payload.id.startsWith('guest_')) {
      const idx = guestItems.findIndex(i => i._id === payload.id);
      if (idx < 0) throw new Error('Guest cart item not found');
      
      const updated: GuestCartItem = {
        ...guestItems[idx],
        quantity: payload.quantity,
      };
      setGuestItems(prev => prev.map(i => (i._id === payload.id ? updated : i)));
      return updated;
    }

    // Server cart item
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.patch<{ success: boolean; data: StorefrontCartItem }>(`/storefront/cart/${payload.id}`, { quantity: payload.quantity });
      if (!res.data.success) throw new Error('Update cart entry failed');
      const updated = res.data.data;
      setItems(prev => prev.map(i => (i._id === updated._id ? updated : i)));
      return updated;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Update cart entry failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [guestItems]);

  const deleteCartEntry = useCallback(async (id: string): Promise<StorefrontCartItem | GuestCartItem> => {
    // Check if it's a guest cart item
    if (id.startsWith('guest_')) {
      const item = guestItems.find(i => i._id === id);
      if (!item) throw new Error('Guest cart item not found');
      
      setGuestItems(prev => prev.filter(i => i._id !== id));
      return item;
    }

    // Server cart item
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<{ success: boolean; data: StorefrontCartItem }>(`/storefront/cart/${id}`);
      if (!res.data.success) throw new Error('Delete cart entry failed');
      const deleted = res.data.data;
      setItems(prev => prev.filter(i => i._id !== deleted._id));
      return deleted;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Delete cart entry failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [guestItems]);

  const clear = useCallback(() => {
    setItems([]);
    setGuestItems([]);
    safeLocalStorage.removeItem(GUEST_CART_KEY);
    setError(null);
    setLoading(false);
  }, []);

  // Get all items (guest + authenticated)
  const getAllItems = useCallback((): (StorefrontCartItem | GuestCartItem)[] => {
    if (user) {
      return items;
    }
    return guestItems;
  }, [user, items, guestItems]);

  // Register clear function to be called on logout
  useEffect(() => {
    const unregister = registerLogoutCallback(clear);
    return unregister;
  }, [registerLogoutCallback, clear]);

  const value: StorefrontCartContextType = {
    items,
    guestItems,
    loading,
    error,
    isGuest,
    createCartEntry,
    getCartByCustomerId,
    updateCartEntry,
    deleteCartEntry,
    setItems,
    clear,
    getAllItems,
  };

  return (
    <StorefrontCartContext.Provider value={value}>{children}</StorefrontCartContext.Provider>
  );
};

export const useStorefrontCart = (): StorefrontCartContextType => {
  const ctx = useContext(StorefrontCartContext);
  if (!ctx) throw new Error('useStorefrontCart must be used within a StorefrontCartProvider');
  return ctx;
};

export default StorefrontCartContext;
