'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { adminListPageInnerClass } from '@/components/admin-list-ui';
import { BlogEditor } from '@/components/online-store/BlogEditor';
import { storeBlogApi, type StoreBlogItem } from '@/lib/store-blog';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

export default function EditBlogPage() {
  const params = useParams();
  const blogId = String(params?.id || '');
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [blog, setBlog] = useState<StoreBlogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const load = useCallback(async () => {
    if (!storeId || !blogId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await storeBlogApi.getBlog(storeId, blogId);
      if (res.data?.success && res.data.data) setBlog(res.data.data);
      else toast.error('Blog not found');
    } catch {
      toast.error('Failed to load blog');
    } finally {
      setLoading(false);
    }
  }, [storeId, blogId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!storeId) {
    return <div className={`${adminListPageInnerClass} py-8 text-[13px]`}>Select a store first.</div>;
  }

  if (loading) {
    return (
      <div className={`${adminListPageInnerClass} flex min-h-[200px] items-center justify-center`}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return <div className={`${adminListPageInnerClass} py-8 text-[13px]`}>Blog not found.</div>;
  }

  return (
    <BlogEditor
      mode="edit"
      storeId={storeId}
      blogId={blogId}
      initial={{
        title: blog.title,
        pageTitle: blog.pageTitle,
        metaDescription: blog.metaDescription,
        urlHandle: blog.urlHandle,
        comments: blog.comments,
      }}
    />
  );
}
