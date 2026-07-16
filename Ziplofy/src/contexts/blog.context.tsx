import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export const BLOG_COMMENTS_MODES = ['disabled', 'moderated', 'allowed'] as const;
export type BlogCommentsMode = (typeof BLOG_COMMENTS_MODES)[number];

export interface Blog {
  _id: string;
  storeId: string;
  title: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  comments: BlogCommentsMode;
  /** Theme creator template: `default` or `blogs.{slug}`. */
  themeTemplate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPayload {
  storeId: string;
  title: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  comments?: BlogCommentsMode;
  themeTemplate?: string;
}

export interface UpdateBlogPayload {
  storeId?: string;
  title?: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  comments?: BlogCommentsMode;
  themeTemplate?: string;
}

interface BlogsListResponse {
  success: boolean;
  data: Blog[];
  count: number;
}

interface BlogDetailResponse {
  success: boolean;
  data: Blog;
}

interface BlogMutationResponse {
  success: boolean;
  data: Blog;
  message: string;
}

interface DeleteBlogResponse {
  success: boolean;
  data: { deletedId: string };
  message: string;
}

interface BlogContextType {
  blogs: Blog[];
  activeBlog: Blog | null;
  loading: boolean;
  error: string | null;
  fetchBlogsByStoreId: (storeId: string) => Promise<Blog[]>;
  fetchBlogById: (blogId: string, storeId?: string) => Promise<Blog>;
  createBlog: (payload: CreateBlogPayload) => Promise<Blog>;
  updateBlog: (blogId: string, payload: UpdateBlogPayload) => Promise<Blog>;
  deleteBlog: (blogId: string, storeId?: string) => Promise<string>;
  clearBlogs: () => void;
  clearActiveBlog: () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function formatBlogCommentsLabel(comments: BlogCommentsMode): string {
  switch (comments) {
    case 'moderated':
      return 'Allowed, pending moderation';
    case 'allowed':
      return 'Allowed';
    default:
      return 'Disabled';
  }
}

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogsByStoreId = useCallback(async (storeId: string): Promise<Blog[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<BlogsListResponse>(`/blogs/store/${storeId}`);
      const list = res.data?.data ?? [];
      setBlogs(list);
      return list;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch blogs';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBlogById = useCallback(async (blogId: string, storeId?: string): Promise<Blog> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<BlogDetailResponse>(`/blogs/${blogId}`, {
        params: storeId ? { storeId } : undefined,
      });
      const blog = res.data.data;
      setActiveBlog(blog);
      return blog;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch blog';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBlog = useCallback(async (payload: CreateBlogPayload): Promise<Blog> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<BlogMutationResponse>('/blogs', payload);
      const blog = res.data.data;
      setBlogs((prev) => [blog, ...prev]);
      setActiveBlog(blog);
      return blog;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create blog';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlog = useCallback(async (blogId: string, payload: UpdateBlogPayload): Promise<Blog> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.patch<BlogMutationResponse>(`/blogs/${blogId}`, payload);
      const blog = res.data.data;
      setBlogs((prev) => prev.map((row) => (row._id === blogId ? blog : row)));
      if (activeBlog?._id === blogId) {
        setActiveBlog(blog);
      }
      return blog;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update blog';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeBlog?._id]);

  const deleteBlog = useCallback(async (blogId: string, storeId?: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.delete<DeleteBlogResponse>(`/blogs/${blogId}`, {
        params: storeId ? { storeId } : undefined,
      });
      setBlogs((prev) => prev.filter((row) => row._id !== blogId));
      if (activeBlog?._id === blogId) {
        setActiveBlog(null);
      }
      return res.data.data.deletedId;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete blog';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeBlog?._id]);

  const clearBlogs = useCallback(() => {
    setBlogs([]);
    setError(null);
    setLoading(false);
  }, []);

  const clearActiveBlog = useCallback(() => {
    setActiveBlog(null);
  }, []);

  const value: BlogContextType = {
    blogs,
    activeBlog,
    loading,
    error,
    fetchBlogsByStoreId,
    fetchBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    clearBlogs,
    clearActiveBlog,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlogs = (): BlogContextType => {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error('useBlogs must be used within a BlogProvider');
  return ctx;
};

export const BlogsContext = BlogContext;
