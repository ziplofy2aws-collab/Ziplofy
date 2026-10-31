'use client';

/** Webpanel adapter for codiic `useBlogPosts` — backed by storeBlogApi. */

import { useCallback, useMemo, useState } from 'react';
import { storeBlogApi, type StoreBlogPostItem } from '@/lib/store-blog';

export type BlogPostVisibility = 'visible' | 'hidden';

export type BlogPost = StoreBlogPostItem & { [key: string]: unknown };

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogPostsByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    try {
      const res = await storeBlogApi.listPosts(storeId);
      const items = (res.data?.data ?? []) as BlogPost[];
      setBlogPosts(items);
      return items;
    } catch {
      return [] as BlogPost[];
    } finally {
      setLoading(false);
    }
  }, []);

  const createBlogPost = useCallback(
    async (payload: Partial<BlogPost> & { storeId?: string; blogId: string }) => {
      const { storeId, ...rest } = payload;
      const res = await storeBlogApi.createPost(
        String(storeId ?? ''),
        rest as Partial<StoreBlogPostItem> & { blogId: string }
      );
      const post = res.data?.data as BlogPost;
      setBlogPosts((prev) => [...prev, post]);
      return post;
    },
    []
  );

  const updateBlogPost = useCallback(
    async (payload: Partial<BlogPost> & { storeId?: string; blogPostId?: string; _id?: string }) => {
      const { storeId, blogPostId, _id, ...rest } = payload;
      const id = blogPostId || _id;
      const res = await storeBlogApi.updatePost(String(storeId ?? ''), String(id), rest);
      const post = res.data?.data as BlogPost;
      setBlogPosts((prev) => prev.map((p) => (p._id === id ? post : p)));
      return post;
    },
    []
  );

  const fetchBlogPostById = useCallback(async (_storeId: string, postId: string) => {
    return blogPosts.find((p) => p._id === postId) ?? null;
  }, [blogPosts]);

  const deleteBlogPost = useCallback(async (storeId: string, postId: string) => {
    await storeBlogApi.deletePost(storeId, postId);
    setBlogPosts((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  return useMemo(
    () => ({
      blogPosts,
      activeBlogPost,
      loading,
      error,
      fetchBlogPostsByStoreId,
      fetchBlogPostById,
      createBlogPost,
      updateBlogPost,
      deleteBlogPost,
      setActiveBlogPost,
      clearBlogPosts: () => setBlogPosts([]),
      clearActiveBlogPost: () => setActiveBlogPost(null),
    }),
    [blogPosts, activeBlogPost, loading, error, fetchBlogPostsByStoreId, fetchBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost]
  );
}
