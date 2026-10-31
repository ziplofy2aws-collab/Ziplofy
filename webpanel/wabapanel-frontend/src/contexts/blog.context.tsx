'use client';

/** Webpanel adapter for codiic `useBlogs` — backed by storeBlogApi. */

import { useCallback, useMemo, useState } from 'react';
import { storeBlogApi, type StoreBlogItem } from '@/lib/store-blog';

export type BlogCommentsMode = 'disabled' | 'moderated' | 'allowed';

export type Blog = StoreBlogItem & { [key: string]: unknown };

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogsByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    try {
      const res = await storeBlogApi.listBlogs(storeId);
      const items = (res.data?.data ?? []) as Blog[];
      setBlogs(items);
      return items;
    } catch {
      return [] as Blog[];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBlogById = useCallback(async (storeId: string, blogId: string) => {
    const res = await storeBlogApi.getBlog(storeId, blogId);
    return (res.data?.data ?? null) as Blog | null;
  }, []);

  const createBlog = useCallback(async (payload: Partial<Blog> & { storeId?: string }) => {
    const { storeId, ...rest } = payload;
    const res = await storeBlogApi.createBlog(String(storeId ?? ''), rest);
    const blog = res.data?.data as Blog;
    setBlogs((prev) => [...prev, blog]);
    return blog;
  }, []);

  const updateBlog = useCallback(async (payload: Partial<Blog> & { blogId?: string; storeId?: string; _id?: string }) => {
    const { blogId, storeId, _id, ...rest } = payload;
    const id = blogId || _id;
    const res = await storeBlogApi.updateBlog(String(storeId ?? ''), String(id), rest);
    const blog = res.data?.data as Blog;
    setBlogs((prev) => prev.map((b) => (b._id === id ? blog : b)));
    return blog;
  }, []);

  const deleteBlog = useCallback(async (storeId: string, blogId: string) => {
    await storeBlogApi.deleteBlog(storeId, blogId);
    setBlogs((prev) => prev.filter((b) => b._id !== blogId));
  }, []);

  return useMemo(
    () => ({
      blogs,
      activeBlog,
      loading,
      error,
      fetchBlogsByStoreId,
      fetchBlogById,
      createBlog,
      updateBlog,
      deleteBlog,
      setActiveBlog,
      clearBlogs: () => setBlogs([]),
      clearActiveBlog: () => setActiveBlog(null),
    }),
    [blogs, activeBlog, loading, error, fetchBlogsByStoreId, fetchBlogById, createBlog, updateBlog, deleteBlog]
  );
}
