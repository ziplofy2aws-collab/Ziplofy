import { create } from 'zustand';
import { storesApi } from '@/lib/api';
import { buildStorefrontUrl } from '@/lib/storefront-url';

export type WebpanelStoreSubdomain = {
  _id: string;
  subdomain: string;
  customDomain?: string | null;
};

export type WebpanelStore = {
  _id: string;
  userId: string;
  workspace?: string | null;
  storeName: string;
  storeDescription: string;
  appliedTheme?: string | null;
  status?: string;
  storeCode?: string;
  createdAt?: string;
  updatedAt?: string;
  subdomain?: WebpanelStoreSubdomain | null;
};

export const ACTIVE_STORE_KEY = 'webpanelActiveStoreId';
export const ACTIVE_STORE_CHANGED_EVENT = 'webpanel:active-store-changed';

interface StoreState {
  stores: WebpanelStore[];
  activeStoreId: string | null;
  loading: boolean;
  error: string | null;
  fetchStores: () => Promise<void>;
  createStore: (data: { storeName: string; storeDescription: string }) => Promise<WebpanelStore>;
  setActiveStoreId: (storeId: string) => void;
  getActiveStore: () => WebpanelStore | null;
  getActiveStorefrontUrl: () => string | null;
}

function persistActiveStoreId(storeId: string | null) {
  if (typeof window === 'undefined') return;
  if (storeId) {
    localStorage.setItem(ACTIVE_STORE_KEY, storeId);
    sessionStorage.setItem(ACTIVE_STORE_KEY, storeId);
  } else {
    localStorage.removeItem(ACTIVE_STORE_KEY);
    sessionStorage.removeItem(ACTIVE_STORE_KEY);
  }
  window.dispatchEvent(
    new CustomEvent(ACTIVE_STORE_CHANGED_EVENT, { detail: { storeId } })
  );
}

function readPersistedActiveStoreId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_STORE_KEY) || sessionStorage.getItem(ACTIVE_STORE_KEY);
}

export const useStoreStore = create<StoreState>((set, get) => ({
  stores: [],
  activeStoreId: readPersistedActiveStoreId(),
  loading: false,
  error: null,

  fetchStores: async () => {
    set({ loading: true, error: null });
    try {
      const res = await storesApi.list();
      const stores = (res.data?.data || []) as WebpanelStore[];
      let activeStoreId = get().activeStoreId || readPersistedActiveStoreId();
      if (!activeStoreId || !stores.some((s) => s._id === activeStoreId)) {
        activeStoreId = stores[0]?._id || null;
      }
      persistActiveStoreId(activeStoreId);
      set({ stores, activeStoreId, loading: false });
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to load stores';
      set({ loading: false, error: message });
    }
  },

  createStore: async (data) => {
    const res = await storesApi.create(data);
    const created = res.data?.data as WebpanelStore;
    const stores = [...get().stores, created];
    const activeStoreId = created._id;
    persistActiveStoreId(activeStoreId);
    set({ stores, activeStoreId, error: null });
    return created;
  },

  setActiveStoreId: (storeId) => {
    const exists = get().stores.some((s) => s._id === storeId);
    if (!exists) return;
    persistActiveStoreId(storeId);
    set({ activeStoreId: storeId });
  },

  getActiveStore: () => {
    const { stores, activeStoreId } = get();
    return stores.find((s) => s._id === activeStoreId) || stores[0] || null;
  },

  getActiveStorefrontUrl: () => {
    const store = get().getActiveStore();
    if (!store?.subdomain) return null;
    return buildStorefrontUrl(store.subdomain.subdomain, store.subdomain.customDomain);
  },
}));

/** Convenience selector hook pieces for components. */
export function selectActiveStore(state: StoreState): WebpanelStore | null {
  return state.stores.find((s) => s._id === state.activeStoreId) || state.stores[0] || null;
}
