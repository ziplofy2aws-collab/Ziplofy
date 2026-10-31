'use client';

/** Webpanel adapter for codiic `useStoreMenus` — backed by storeMenuApi. */

import { useCallback, useMemo, useState } from 'react';
import { storeMenuApi } from '@/lib/store-menu';

/** Codiic-shaped menu types (superset of webpanel's — includes product/collection links
 *  for schema compat; webpanel backend will reject link types it doesn't support). */
export type MenuItemLinkType =
  | 'homepage'
  | 'search'
  | 'all-blogs'
  | 'all-collections'
  | 'all-products'
  | 'specific-page'
  | 'specific-blog'
  | 'specific-blog-post'
  | 'specific-collection'
  | 'specific-product'
  | 'lead-gen-form'
  | 'custom';

export type StoreMenuItem = {
  _id: string;
  menuId: string;
  label: string;
  linkType: MenuItemLinkType;
  link?: string;
  pageId?: string;
  blogId?: string;
  blogPostId?: string;
  collectionId?: string;
  productId?: string;
  formId?: string;
  position: number;
  href?: string;
  page?: { _id: string; title: string; urlHandle: string };
  blog?: { _id: string; title: string; urlHandle: string };
  blogPost?: { _id: string; title: string; urlHandle: string };
  collection?: { _id: string; title: string; urlHandle: string };
  product?: { _id: string; title: string; urlHandle: string };
  form?: { _id: string; name: string };
};

export type StoreMenu = {
  _id: string;
  storeId: string;
  menuName: string;
  handle: string;
  menuItemsSummary?: string;
  itemCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateStoreMenuItemInput = {
  label: string;
  linkType: MenuItemLinkType;
  link?: string;
  pageId?: string;
  blogId?: string;
  blogPostId?: string;
  collectionId?: string;
  productId?: string;
  formId?: string;
  position?: number;
};

/** Cast codiic-shaped items to the webpanel api input type (link-type union is narrower). */
const toWpItem = (i: CreateStoreMenuItemInput | StoreMenuItem): never => i as never;

export function useStoreMenus() {
  const [menus, setMenus] = useState<StoreMenu[]>([]);
  const [activeMenu, setActiveMenu] = useState<StoreMenu | null>(null);
  const [activeMenuItems, setActiveMenuItems] = useState<StoreMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenusByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    try {
      const res = await storeMenuApi.listMenus(storeId);
      const items = res.data?.data ?? [];
      setMenus(items);
      return items;
    } catch {
      return [] as StoreMenu[];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMenuById = useCallback(async (storeId: string, menuId: string) => {
    const res = await storeMenuApi.getMenu(storeId, menuId);
    const detail = res.data?.data;
    if (detail) {
      setActiveMenu(detail.menu);
      setActiveMenuItems(detail.items ?? []);
    }
    return detail?.menu ?? null;
  }, []);

  const fetchMenuItemsByMenuId = useCallback(
    async (storeId: string, menuId: string) => {
      const res = await storeMenuApi.getMenu(storeId, menuId);
      const items = res.data?.data?.items ?? [];
      if (activeMenu?._id === menuId) setActiveMenuItems(items);
      return items;
    },
    [activeMenu?._id]
  );

  const createMenu = useCallback(
    async (payload: { storeId?: string; menuName: string; handle?: string; items?: CreateStoreMenuItemInput[] }) => {
      const { storeId, ...rest } = payload;
      const res = await storeMenuApi.createMenu(String(storeId ?? ''), {
        ...rest,
        items: rest.items?.map((i) => toWpItem(i)),
      });
      const detail = res.data?.data;
      if (detail?.menu) {
        setMenus((prev) => [...prev, detail.menu]);
        setActiveMenu(detail.menu);
        setActiveMenuItems(detail.items ?? []);
      }
      return detail ?? null;
    },
    []
  );

  const updateMenu = useCallback(
    async (payload: { storeId?: string; menuId?: string; _id?: string } & Partial<StoreMenu> & { items?: CreateStoreMenuItemInput[] }) => {
      const { storeId, menuId, _id, ...rest } = payload;
      const id = menuId || _id;
      const res = await storeMenuApi.updateMenu(String(storeId ?? ''), String(id), {
        ...rest,
        items: rest.items?.map((i) => toWpItem(i)),
      });
      const detail = res.data?.data;
      if (detail?.menu) {
        setMenus((prev) => prev.map((m) => (m._id === id ? detail.menu : m)));
        if (activeMenu?._id === id) {
          setActiveMenu(detail.menu);
          setActiveMenuItems(detail.items ?? []);
        }
      }
      return detail ?? null;
    },
    [activeMenu?._id]
  );

  const deleteMenu = useCallback(async (storeId: string, menuId: string) => {
    await storeMenuApi.deleteMenu(storeId, menuId);
    setMenus((prev) => prev.filter((m) => m._id !== menuId));
  }, []);

  // Item-level ops route through updateMenu (webpanel stores items on the menu doc).
  const createMenuItem = useCallback(
    async (payload: { storeId?: string; menuId: string } & CreateStoreMenuItemInput) => {
      const { storeId, menuId, ...item } = payload;
      const detail = await storeMenuApi.getMenu(String(storeId ?? ''), menuId);
      const items = detail.data?.data?.items ?? [];
      const res = await storeMenuApi.updateMenu(String(storeId ?? ''), menuId, {
        items: [...items.map((i) => toWpItem(i)), toWpItem(item)],
      });
      if (res.data?.data?.items) setActiveMenuItems(res.data.data.items);
      return res.data?.data ?? null;
    },
    []
  );

  const updateMenuItem = useCallback(
    async (payload: { storeId?: string; menuId?: string; itemId: string } & Partial<StoreMenuItem>) => {
      const { storeId, menuId, itemId, ...fields } = payload;
      const res = await storeMenuApi.getMenu(String(storeId ?? ''), String(menuId));
      const items = (res.data?.data?.items ?? []).map((i) =>
        i._id === itemId ? ({ ...i, ...fields } as unknown as CreateStoreMenuItemInput) : (toWpItem(i))
      ) as CreateStoreMenuItemInput[];
      const upd = await storeMenuApi.updateMenu(String(storeId ?? ''), String(menuId), {
        items: items.map((i) => toWpItem(i)),
      });
      if (upd.data?.data?.items) setActiveMenuItems(upd.data.data.items);
      return upd.data?.data ?? null;
    },
    []
  );

  const deleteMenuItem = useCallback(
    async (storeId: string, menuId: string, itemId: string) => {
      const res = await storeMenuApi.getMenu(storeId, menuId);
      const items = (res.data?.data?.items ?? []).filter((i) => i._id !== itemId);
      const upd = await storeMenuApi.updateMenu(storeId, menuId, {
        items: items.map((i) => toWpItem(i as unknown as CreateStoreMenuItemInput)),
      });
      if (upd.data?.data?.items) setActiveMenuItems(upd.data.data.items);
    },
    []
  );

  return useMemo(
    () => ({
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
      clearMenus: () => setMenus([]),
      clearActiveMenu: () => {
        setActiveMenu(null);
        setActiveMenuItems([]);
      },
    }),
    [menus, activeMenu, activeMenuItems, loading, error, fetchMenusByStoreId, fetchMenuById, fetchMenuItemsByMenuId, createMenu, updateMenu, deleteMenu, createMenuItem, updateMenuItem, deleteMenuItem]
  );
}
