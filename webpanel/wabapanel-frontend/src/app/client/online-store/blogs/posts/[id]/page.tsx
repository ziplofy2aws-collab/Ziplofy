'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { adminListPageInnerClass } from '@/components/admin-list-ui';
import { BlogPostEditor, BlogPostPageShell } from '@/components/online-store/BlogPostEditor';
import { storeBlogApi, type StoreBlogPostItem } from '@/lib/store-blog';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

export default function EditBlogPostPage() {
  const params = useParams();
  const postId = String(params?.id || '');
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [post, setPost] = useState<StoreBlogPostItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const load = useCallback(async () => {
    if (!storeId || !postId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await storeBlogApi.getPost(storeId, postId);
      if (res.data?.success && res.data.data) setPost(res.data.data);
      else toast.error('Post not found');
    } catch {
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [storeId, postId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!storeId) {
    return (
      <div className={`${adminListPageInnerClass} py-8 text-[13px] text-admin-text-secondary`}>
        Select a store to edit blog posts.
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${adminListPageInnerClass} flex min-h-[240px] items-center justify-center`}>
        <Loader2 className="h-6 w-6 animate-spin text-admin-text-secondary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`${adminListPageInnerClass} py-8 text-[13px] text-admin-text-secondary`}>
        Blog post not found.
      </div>
    );
  }

  return (
    <BlogPostPageShell mode="edit" title={post.title}>
      <BlogPostEditor
        mode="edit"
        storeId={storeId}
        postId={postId}
        initial={{
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          pageTitle: post.pageTitle,
          metaDescription: post.metaDescription,
          urlHandle: post.urlHandle,
          visibility: post.visibility,
          author: post.author,
          blogId: post.blogId,
          tags: post.tags.join(', '),
          featuredImageUrl: post.featuredImageUrl,
        }}
        onSaved={() => void load()}
      />
    </BlogPostPageShell>
  );
}
