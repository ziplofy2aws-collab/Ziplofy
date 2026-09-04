import api from '@/lib/api';

export type StoreBlogItem = {
  _id: string;
  storeId: string;
  title: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  comments: 'disabled' | 'moderated' | 'allowed';
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreBlogPostItem = {
  _id: string;
  storeId: string;
  blogId: string;
  blogTitle?: string;
  title: string;
  content: string;
  excerpt: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: 'visible' | 'hidden';
  author: string;
  tags: string[];
  featuredImageUrl: string;
  featuredImageKey?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function slugifyHandle(raw: string, fallback = 'item'): string {
  const base = String(raw || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'item';
}

export const storeBlogApi = {
  listBlogs: (storeId: string) =>
    api.get<{ success: boolean; data: StoreBlogItem[]; count?: number }>(`/stores/${storeId}/blogs`),
  getBlog: (storeId: string, blogId: string) =>
    api.get<{ success: boolean; data: StoreBlogItem }>(`/stores/${storeId}/blogs/${blogId}`),
  createBlog: (storeId: string, payload: Partial<StoreBlogItem>) =>
    api.post<{ success: boolean; data: StoreBlogItem; message?: string }>(`/stores/${storeId}/blogs`, payload),
  updateBlog: (storeId: string, blogId: string, payload: Partial<StoreBlogItem>) =>
    api.put<{ success: boolean; data: StoreBlogItem; message?: string }>(
      `/stores/${storeId}/blogs/${blogId}`,
      payload
    ),
  deleteBlog: (storeId: string, blogId: string) =>
    api.delete<{ success: boolean; message?: string }>(`/stores/${storeId}/blogs/${blogId}`),

  listPosts: (storeId: string, params?: { blogId?: string }) =>
    api.get<{ success: boolean; data: StoreBlogPostItem[]; count?: number }>(
      `/stores/${storeId}/blog-posts`,
      { params }
    ),
  getPost: (storeId: string, postId: string) =>
    api.get<{ success: boolean; data: StoreBlogPostItem }>(`/stores/${storeId}/blog-posts/${postId}`),
  createPost: (storeId: string, payload: Partial<StoreBlogPostItem> & { blogId: string }) =>
    api.post<{ success: boolean; data: StoreBlogPostItem; message?: string }>(
      `/stores/${storeId}/blog-posts`,
      payload
    ),
  updatePost: (storeId: string, postId: string, payload: Partial<StoreBlogPostItem>) =>
    api.put<{ success: boolean; data: StoreBlogPostItem; message?: string }>(
      `/stores/${storeId}/blog-posts/${postId}`,
      payload
    ),
  deletePost: (storeId: string, postId: string) =>
    api.delete<{ success: boolean; message?: string }>(`/stores/${storeId}/blog-posts/${postId}`),
};
