import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

export const BLOG_COMMENT_STATUS = ['pending', 'published', 'spam'] as const;
export type BlogCommentStatus = (typeof BLOG_COMMENT_STATUS)[number];

export interface BlogCommentArticleRef {
  _id: string;
  title: string;
  urlHandle: string;
  blogId: string;
}

export interface BlogComment {
  _id: string;
  storeId: string;
  articleId: string | BlogCommentArticleRef;
  name: string;
  email: string;
  message: string;
  status: BlogCommentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogCommentPayload {
  storeId: string;
  articleId: string;
  name: string;
  email: string;
  message: string;
  status?: BlogCommentStatus;
}

export interface UpdateBlogCommentPayload {
  storeId?: string;
  name?: string;
  email?: string;
  message?: string;
  status?: BlogCommentStatus;
}

interface BlogCommentsListResponse {
  success: boolean;
  data: BlogComment[];
  count: number;
}

interface BlogCommentMutationResponse {
  success: boolean;
  message: string;
  data: BlogComment;
}

interface DeleteBlogCommentResponse {
  success: boolean;
  message: string;
  data: {
    deletedId: string;
    storeId: string;
    articleId: string;
  };
}

interface BlogCommentsContextType {
  comments: BlogComment[];
  loading: boolean;
  error: string | null;
  fetchCommentsByStoreId: (
    storeId: string,
    params?: { articleId?: string; status?: BlogCommentStatus }
  ) => Promise<BlogComment[]>;
  createComment: (payload: CreateBlogCommentPayload) => Promise<BlogComment>;
  updateComment: (commentId: string, payload: UpdateBlogCommentPayload) => Promise<BlogComment>;
  deleteComment: (commentId: string, storeId?: string) => Promise<void>;
  clearComments: () => void;
  clearError: () => void;
}

const BlogCommentsContext = createContext<BlogCommentsContextType | undefined>(undefined);

export const BlogCommentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommentsByStoreId = useCallback(
    async (
      storeId: string,
      params?: { articleId?: string; status?: BlogCommentStatus }
    ): Promise<BlogComment[]> => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.get<BlogCommentsListResponse>(
          `/blog-comments/store/${storeId}`,
          {
            params: {
              articleId: params?.articleId,
              status: params?.status,
            },
          }
        );
        const list = response.data.data ?? [];
        setComments(list);
        return list;
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Failed to fetch comments';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createComment = useCallback(async (payload: CreateBlogCommentPayload): Promise<BlogComment> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosi.post<BlogCommentMutationResponse>('/blog-comments', payload);
      const comment = response.data.data;
      setComments((prev) => [comment, ...prev]);
      return comment;
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        'Failed to create comment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateComment = useCallback(
    async (commentId: string, payload: UpdateBlogCommentPayload): Promise<BlogComment> => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.patch<BlogCommentMutationResponse>(
          `/blog-comments/${commentId}`,
          payload
        );
        const comment = response.data.data;
        setComments((prev) => prev.map((row) => (row._id === commentId ? comment : row)));
        return comment;
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Failed to update comment';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteComment = useCallback(async (commentId: string, storeId?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axiosi.delete<DeleteBlogCommentResponse>(`/blog-comments/${commentId}`, {
        params: storeId ? { storeId } : undefined,
      });
      setComments((prev) => prev.filter((row) => row._id !== commentId));
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        'Failed to delete comment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearComments = useCallback(() => {
    setComments([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: BlogCommentsContextType = {
    comments,
    loading,
    error,
    fetchCommentsByStoreId,
    createComment,
    updateComment,
    deleteComment,
    clearComments,
    clearError,
  };

  return <BlogCommentsContext.Provider value={value}>{children}</BlogCommentsContext.Provider>;
};

export const useBlogComments = (): BlogCommentsContextType => {
  const context = useContext(BlogCommentsContext);
  if (!context) {
    throw new Error('useBlogComments must be used within a BlogCommentsProvider');
  }
  return context;
};

export default BlogCommentsContext;
