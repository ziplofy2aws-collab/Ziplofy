'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BlogPostEditor, BlogPostPageShell } from '@/components/online-store/BlogPostEditor';
import { adminListPageInnerClass } from '@/components/admin-list-ui';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

export default function NewBlogPostPage() {
  const router = useRouter();
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  if (!storeId) {
    return (
      <div className={`${adminListPageInnerClass} py-8 text-[13px] text-admin-text-secondary`}>
        Select a store to create blog posts.
      </div>
    );
  }

  return (
    <BlogPostPageShell mode="create">
      <BlogPostEditor
        mode="create"
        storeId={storeId}
        onSaved={(id) => router.push(`/client/online-store/blogs/posts/${id}`)}
      />
    </BlogPostPageShell>
  );
}
