import api from '@/lib/api';
import { slugifyHandle } from '@/lib/store-blog';

export type StorePageItem = {
  _id: string;
  storeId: string;
  title: string;
  content: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: 'visible' | 'hidden';
  themeTemplate: string;
  createdAt?: string;
  updatedAt?: string;
};

export { slugifyHandle };

export const storePageApi = {
  listPages: (storeId: string) =>
    api.get<{ success: boolean; data: StorePageItem[]; count?: number }>(`/stores/${storeId}/pages`),
  getPageByHandle: (storeId: string, urlHandle: string) =>
    api.get<{ success: boolean; data: StorePageItem; message?: string }>(
      `/stores/${storeId}/pages/by-handle/${encodeURIComponent(urlHandle)}`
    ),
  getPage: (storeId: string, pageId: string) =>
    api.get<{ success: boolean; data: StorePageItem }>(`/stores/${storeId}/pages/${pageId}`),
  createPage: (storeId: string, payload: Partial<StorePageItem>) =>
    api.post<{ success: boolean; data: StorePageItem; message?: string }>(`/stores/${storeId}/pages`, payload),
  updatePage: (storeId: string, pageId: string, payload: Partial<StorePageItem>) =>
    api.put<{ success: boolean; data: StorePageItem; message?: string }>(
      `/stores/${storeId}/pages/${pageId}`,
      payload
    ),
  deletePage: (storeId: string, pageId: string) =>
    api.delete<{ success: boolean; message?: string }>(`/stores/${storeId}/pages/${pageId}`),
};

export function stripHtmlPreview(html: string, maxLen = 120): string {
  const text = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}
