import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export const BLOG_POST_VISIBILITY = ['visible', 'hidden'] as const;
export type BlogPostVisibility = (typeof BLOG_POST_VISIBILITY)[number];

export interface BlogPost {
  _id: string;
  storeId: string;
  blogId: string;
  title: string;
  content: string;
  excerpt: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: BlogPostVisibility;
  author: string;
  tagIds: string[];
  featuredImageUrl: string;
  featuredImageKey: string;
  featuredImageUploadId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostPayload {
  storeId: string;
  blogId: string;
  title: string;
  content?: string;
  excerpt?: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  visibility?: BlogPostVisibility;
  author?: string;
  tagIds?: string[];
  featuredImageUrl?: string;
  featuredImageKey?: string;
  featuredImageUploadId?: string;
}

export interface UpdateBlogPostPayload {
  storeId?: string;
  blogId?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  visibility?: BlogPostVisibility;
  author?: string;
  tagIds?: string[];
  featuredImageUrl?: string;
  featuredImageKey?: string;
  featuredImageUploadId?: string;
}

interface BlogPostsListResponse {
  success: boolean;
  data: BlogPost[];
  count: number;
}

interface BlogPostDetailResponse {
  success: boolean;
  data: BlogPost;
}

interface BlogPostMutationResponse {
  success: boolean;
  data: BlogPost;
  message: string;
}

interface DeleteBlogPostResponse {
  success: boolean;
  data: { deletedId: string };
  message: string;
}

interface BlogPostContextType {
  blogPosts: BlogPost[];
  activeBlogPost: BlogPost | null;
  loading: boolean;
  error: string | null;
  fetchBlogPostsByStoreId: (storeId: string, blogId?: string) => Promise<BlogPost[]>;
  fetchBlogPostById: (postId: string, storeId?: string) => Promise<BlogPost>;
  createBlogPost: (payload: CreateBlogPostPayload) => Promise<BlogPost>;
  updateBlogPost: (postId: string, payload: UpdateBlogPostPayload) => Promise<BlogPost>;
  deleteBlogPost: (postId: string, storeId?: string) => Promise<string>;
  clearBlogPosts: () => void;
  clearActiveBlogPost: () => void;
}

const BlogPostContext = createContext<BlogPostContextType | undefined>(undefined);

export const BlogPostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogPostsByStoreId = useCallback(
    async (storeId: string, blogId?: string): Promise<BlogPost[]> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.get<BlogPostsListResponse>(`/blog-posts/store/${storeId}`, {
          params: blogId ? { blogId } : undefined,
        });
        const list = res.data?.data ?? [];
        setBlogPosts(list);
        return list;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to fetch blog posts';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchBlogPostById = useCallback(
    async (postId: string, storeId?: string): Promise<BlogPost> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.get<BlogPostDetailResponse>(`/blog-posts/${postId}`, {
          params: storeId ? { storeId } : undefined,
        });
        const post = res.data.data;
        setActiveBlogPost(post);
        return post;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to fetch blog post';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createBlogPost = useCallback(async (payload: CreateBlogPostPayload): Promise<BlogPost> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<BlogPostMutationResponse>('/blog-posts', payload);
      const post = res.data.data;
      setBlogPosts((prev) => [post, ...prev]);
      setActiveBlogPost(post);
      return post;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create blog post';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlogPost = useCallback(
    async (postId: string, payload: UpdateBlogPostPayload): Promise<BlogPost> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.patch<BlogPostMutationResponse>(`/blog-posts/${postId}`, payload);
        const post = res.data.data;
        setBlogPosts((prev) => prev.map((row) => (row._id === postId ? post : row)));
        if (activeBlogPost?._id === postId) {
          setActiveBlogPost(post);
        }
        return post;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update blog post';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [activeBlogPost?._id]
  );

  const deleteBlogPost = useCallback(
    async (postId: string, storeId?: string): Promise<string> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.delete<DeleteBlogPostResponse>(`/blog-posts/${postId}`, {
          params: storeId ? { storeId } : undefined,
        });
        setBlogPosts((prev) => prev.filter((row) => row._id !== postId));
        if (activeBlogPost?._id === postId) {
          setActiveBlogPost(null);
        }
        return res.data.data.deletedId;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to delete blog post';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [activeBlogPost?._id]
  );

  const clearBlogPosts = useCallback(() => {
    setBlogPosts([]);
    setError(null);
    setLoading(false);
  }, []);

  const clearActiveBlogPost = useCallback(() => {
    setActiveBlogPost(null);
  }, []);

  const value: BlogPostContextType = {
    blogPosts,
    activeBlogPost,
    loading,
    error,
    fetchBlogPostsByStoreId,
    fetchBlogPostById,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    clearBlogPosts,
    clearActiveBlogPost,
  };

  return <BlogPostContext.Provider value={value}>{children}</BlogPostContext.Provider>;
};

export const useBlogPosts = (): BlogPostContextType => {
  const ctx = useContext(BlogPostContext);
  if (!ctx) throw new Error('useBlogPosts must be used within a BlogPostProvider');
  return ctx;
};

export const BlogPostsContext = BlogPostContext;
