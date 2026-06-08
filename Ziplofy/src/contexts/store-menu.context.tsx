import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export const MENU_ITEM_LINK_TYPES = [
  'homepage',
  'all-collections',
  'all-products',
  'specific-collection',
  'specific-product',
  'custom',
] as const;

export type MenuItemLinkType = (typeof MENU_ITEM_LINK_TYPES)[number];

export interface StoreMenu {
  _id: string;
  storeId: string;
  menuName: string;
  handle: string;
  itemLabels?: string[];
  menuItemsSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreMenuItemCollectionRef {
  _id: string;
  urlHandle?: string;
  title?: string;
}

export interface StoreMenuItemProductRef {
  _id: string;
  urlHandle?: string;
  title?: string;
}

export interface StoreMenuItem {
  _id: string;
  menuId: string;
  label: string;
  linkType: MenuItemLinkType;
  link?: string;
  collectionId?: string;
  productId?: string;
  position: number;
  href?: string;
  collection?: StoreMenuItemCollectionRef;
  product?: StoreMenuItemProductRef;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreMenuItemInput {
  label: string;
  linkType: MenuItemLinkType;
  link?: string;
  collectionId?: string;
  productId?: string;
  position?: number;
}

export interface CreateStoreMenuPayload {
  storeId: string;
  menuName: string;
  handle?: string;
  items?: CreateStoreMenuItemInput[];
}

export interface UpdateStoreMenuPayload {
  menuName?: string;
  handle?: string;
  items?: CreateStoreMenuItemInput[];
}

interface MenusListResponse {
  success: boolean;
  data: StoreMenu[];
  count: number;
}

interface MenuDetailResponse {
  success: boolean;
  data: { menu: StoreMenu; items: StoreMenuItem[] };
}

interface MenuItemsResponse {
  success: boolean;
  data: StoreMenuItem[];
  count: number;
}

interface MenuMutationResponse {
  success: boolean;
  data: { menu: StoreMenu; items: StoreMenuItem[] };
  message: string;
}

interface MenuItemMutationResponse {
  success: boolean;
  data: StoreMenuItem;
  message: string;
}

interface DeleteResponse {
  success: boolean;
  data: { deletedId: string };
  message: string;
}

interface StoreMenuContextType {
  menus: StoreMenu[];
  activeMenu: StoreMenu | null;
  activeMenuItems: StoreMenuItem[];
  loading: boolean;
  error: string | null;
  fetchMenusByStoreId: (storeId: string) => Promise<StoreMenu[]>;
  fetchMenuById: (menuId: string, storeId?: string) => Promise<{ menu: StoreMenu; items: StoreMenuItem[] }>;
  fetchMenuItemsByMenuId: (menuId: string, storeId?: string) => Promise<StoreMenuItem[]>;
  createMenu: (payload: CreateStoreMenuPayload) => Promise<{ menu: StoreMenu; items: StoreMenuItem[] }>;
  updateMenu: (menuId: string, payload: UpdateStoreMenuPayload) => Promise<{ menu: StoreMenu; items: StoreMenuItem[] }>;
  deleteMenu: (menuId: string) => Promise<string>;
  createMenuItem: (
    menuId: string,
    storeId: string,
    item: CreateStoreMenuItemInput
  ) => Promise<StoreMenuItem>;
  updateMenuItem: (
    itemId: string,
    storeId: string,
    item: Partial<CreateStoreMenuItemInput>
  ) => Promise<StoreMenuItem>;
  deleteMenuItem: (itemId: string, storeId?: string) => Promise<string>;
  clearMenus: () => void;
  clearActiveMenu: () => void;
}

const StoreMenuContext = createContext<StoreMenuContextType | undefined>(undefined);

export const StoreMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menus, setMenus] = useState<StoreMenu[]>([]);
  const [activeMenu, setActiveMenu] = useState<StoreMenu | null>(null);
  const [activeMenuItems, setActiveMenuItems] = useState<StoreMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenusByStoreId = useCallback(async (storeId: string): Promise<StoreMenu[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<MenusListResponse>(`/store-menus/store/${storeId}`);
      const list = res.data?.data ?? [];
      setMenus(list);
      return list;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch menus';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMenuById = useCallback(
    async (menuId: string, storeId?: string): Promise<{ menu: StoreMenu; items: StoreMenuItem[] }> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.get<MenuDetailResponse>(`/store-menus/${menuId}`, {
          params: storeId ? { storeId } : undefined,
        });
        const { menu, items } = res.data.data;
        setActiveMenu(menu);
        setActiveMenuItems(items);
        return { menu, items };
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to fetch menu';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMenuItemsByMenuId = useCallback(
    async (menuId: string, storeId?: string): Promise<StoreMenuItem[]> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.get<MenuItemsResponse>(`/store-menus/${menuId}/items`, {
          params: storeId ? { storeId } : undefined,
        });
        const items = res.data?.data ?? [];
        setActiveMenuItems(items);
        return items;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to fetch menu items';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createMenu = useCallback(async (payload: CreateStoreMenuPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<MenuMutationResponse>('/store-menus', payload);
      const { menu, items } = res.data.data;
      setMenus((prev) => [menu, ...prev]);
      setActiveMenu(menu);
      setActiveMenuItems(items);
      return { menu, items };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create menu';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMenu = useCallback(async (menuId: string, payload: UpdateStoreMenuPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.patch<MenuMutationResponse>(`/store-menus/${menuId}`, payload);
      const { menu, items } = res.data.data;
      setMenus((prev) => prev.map((m) => (m._id === menuId ? menu : m)));
      setActiveMenu(menu);
      setActiveMenuItems(items);
      return { menu, items };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update menu';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMenu = useCallback(async (menuId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<DeleteResponse>(`/store-menus/${menuId}`);
      setMenus((prev) => prev.filter((m) => m._id !== menuId));
      if (activeMenu?._id === menuId) {
        setActiveMenu(null);
        setActiveMenuItems([]);
      }
      return res.data.data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete menu';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeMenu?._id]);

  const createMenuItem = useCallback(
    async (menuId: string, storeId: string, item: CreateStoreMenuItemInput) => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.post<MenuItemMutationResponse>(`/store-menus/${menuId}/items`, {
          storeId,
          ...item,
        });
        const created = res.data.data;
        setActiveMenuItems((prev) => [...prev, created].sort((a, b) => a.position - b.position));
        return created;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to create menu item';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateMenuItem = useCallback(
    async (itemId: string, storeId: string, item: Partial<CreateStoreMenuItemInput>) => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.patch<MenuItemMutationResponse>(`/store-menus/items/${itemId}`, {
          storeId,
          ...item,
        });
        const updated = res.data.data;
        setActiveMenuItems((prev) =>
          prev.map((row) => (row._id === itemId ? updated : row)).sort((a, b) => a.position - b.position)
        );
        return updated;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update menu item';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteMenuItem = useCallback(async (itemId: string, storeId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<DeleteResponse>(`/store-menus/items/${itemId}`, {
        params: storeId ? { storeId } : undefined,
      });
      setActiveMenuItems((prev) => prev.filter((row) => row._id !== itemId));
      return res.data.data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete menu item';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMenus = useCallback(() => {
    setMenus([]);
    setError(null);
    setLoading(false);
  }, []);

  const clearActiveMenu = useCallback(() => {
    setActiveMenu(null);
    setActiveMenuItems([]);
  }, []);

  const value: StoreMenuContextType = {
    menus,
    activeMenu,
    activeMenuItems,
    loading,
    error,
    fetchMenusByStoreId,
    fetchMenuById,
    fetchMenuItemsByMenuId,
    createMenu,
    updateMenu,
    deleteMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    clearMenus,
    clearActiveMenu,
  };

  return <StoreMenuContext.Provider value={value}>{children}</StoreMenuContext.Provider>;
};

export const useStoreMenus = (): StoreMenuContextType => {
  const ctx = useContext(StoreMenuContext);
  if (!ctx) throw new Error('useStoreMenus must be used within a StoreMenuProvider');
  return ctx;
};

export const StoreMenusContext = StoreMenuContext;
