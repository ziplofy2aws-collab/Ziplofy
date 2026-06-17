import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { axiosi } from '../config/axios.config';

export interface StorefrontBlogComment {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface FetchCommentsResponse {
  success: boolean;
  data: StorefrontBlogComment[];
  count: number;
  commentsEnabled: boolean;
  commentsMode?: 'disabled' | 'moderated' | 'allowed';
}

interface CreateCommentResponse {
  success: boolean;
  message: string;
  data: StorefrontBlogComment & { status: string };
}

export function useStorefrontBlogComments(storeId: string | undefined, articleId: string | undefined) {
  const [comments, setComments] = useState<StorefrontBlogComment[]>([]);
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [commentsMode, setCommentsMode] = useState<'disabled' | 'moderated' | 'allowed'>('disabled');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!storeId || !articleId) {
      setComments([]);
      setCommentsEnabled(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosi.get<FetchCommentsResponse>(
        `/storefront/blog-comments/store/${storeId}/article/${articleId}`
      );
      setComments(res.data?.data ?? []);
      setCommentsEnabled(Boolean(res.data?.commentsEnabled));
      setCommentsMode(res.data?.commentsMode ?? 'disabled');
    } catch {
      setComments([]);
      setCommentsEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [storeId, articleId]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  const submitComment = useCallback(
    async (payload: { name: string; email: string; message: string }) => {
      if (!storeId || !articleId) return;

      try {
        setSubmitting(true);
        const res = await axiosi.post<CreateCommentResponse>('/storefront/blog-comments', {
          storeId,
          articleId,
          ...payload,
        });
        toast.success(res.data?.message || 'Comment submitted');
        await fetchComments();
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Failed to post comment';
        toast.error(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [storeId, articleId, fetchComments]
  );

  return {
    comments,
    commentsEnabled,
    commentsMode,
    loading,
    submitting,
    submitComment,
    refetchComments: fetchComments,
  };
}
