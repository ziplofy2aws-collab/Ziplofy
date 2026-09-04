import api from '@/lib/api';

export type MenuItemLinkType =
  | 'homepage'
  | 'search'
  | 'all-blogs'
  | 'specific-page'
  | 'specific-blog'
  | 'specific-blog-post'
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
  formId?: string;
  position: number;
  href?: string;
  page?: { _id: string; title: string; urlHandle: string };
  blog?: { _id: string; title: string; urlHandle: string };
  blogPost?: { _id: string; title: string; urlHandle: string };
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

export type StoreMenuDetail = {
  menu: StoreMenu;
  items: StoreMenuItem[];
};

export type CreateMenuItemInput = {
  label: string;
  linkType: MenuItemLinkType;
  link?: string;
  pageId?: string;
  blogId?: string;
  blogPostId?: string;
  formId?: string;
  position?: number;
};

export const storeMenuApi = {
  listMenus: (storeId: string) =>
    api.get<{ success: boolean; data: StoreMenu[]; count?: number }>(`/stores/${storeId}/menus`),
  getMenu: (storeId: string, menuId: string) =>
    api.get<{ success: boolean; data: StoreMenuDetail }>(`/stores/${storeId}/menus/${menuId}`),
  createMenu: (storeId: string, payload: { menuName: string; handle?: string; items?: CreateMenuItemInput[] }) =>
    api.post<{ success: boolean; data: StoreMenuDetail; message?: string }>(`/stores/${storeId}/menus`, payload),
  updateMenu: (
    storeId: string,
    menuId: string,
    payload: { menuName?: string; handle?: string; items?: CreateMenuItemInput[] }
  ) =>
    api.put<{ success: boolean; data: StoreMenuDetail; message?: string }>(
      `/stores/${storeId}/menus/${menuId}`,
      payload
    ),
  deleteMenu: (storeId: string, menuId: string) =>
    api.delete<{ success: boolean; message?: string }>(`/stores/${storeId}/menus/${menuId}`),
};

export function slugifyMenuHandle(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'menu';
}
