'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Plus, Search } from 'lucide-react';
import { storeBlogApi, type StoreBlogPostItem } from '@/lib/store-blog';
import type { BlogPostPreviewSelection } from './blog-page-preview.util';
import { buildStorefrontBlogPostUrl } from './blog-page-preview.util';
import {
  TemplatePreviewPickerOption,
  TemplatePreviewPickerShell,
  TemplatePreviewPickerThumb,
  templatePreviewSearchClassName,
  templatePreviewViewLinkClassName,
} from './TemplatePreviewPickerShell';

type Props = {
  storeId: string | null;
  previewSelection: BlogPostPreviewSelection | null;
  onPreviewSelectionChange: (selection: BlogPostPreviewSelection) => void;
  storefrontOrigin?: string | null;
};

export function BlogPostTemplatePreviewCard({
  storeId,
  previewSelection,
  onPreviewSelectionChange,
  storefrontOrigin,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<StoreBlogPostItem[]>([]);
  const [blogHandleById, setBlogHandleById] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!storeId) {
      setPosts([]);
      setBlogHandleById(new Map());
      return;
    }
    let cancelled = false;
    setLoading(true);
    void Promise.all([storeBlogApi.listBlogs(storeId), storeBlogApi.listPosts(storeId)])
      .then(([blogsRes, postsRes]) => {
        if (cancelled) return;
        const handles = new Map<string, string>();
        for (const blog of blogsRes.data.data || []) {
          const handle = blog.urlHandle?.trim();
          if (handle) handles.set(blog._id, handle);
        }
        setBlogHandleById(handles);
        setPosts(postsRes.data.data || []);
      })
      .catch(() => {
        if (!cancelled) {
          setPosts([]);
          setBlogHandleById(new Map());
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const selectionForPost = useCallback(
    (post: StoreBlogPostItem): BlogPostPreviewSelection | null => {
      const blogHandle = blogHandleById.get(post.blogId);
      const postHandle = post.urlHandle?.trim();
      if (!blogHandle || !postHandle) return null;
      return { blogHandle, postHandle };
    },
    [blogHandleById]
  );

  const selectablePosts = useMemo(
    () => posts.filter((p) => p.visibility !== 'hidden' && selectionForPost(p)),
    [posts, selectionForPost]
  );

  useEffect(() => {
    if (previewSelection || !selectablePosts.length) return;
    const fallback = selectionForPost(selectablePosts[0]!);
    if (fallback) onPreviewSelectionChange(fallback);
  }, [previewSelection, selectablePosts, selectionForPost, onPreviewSelectionChange]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 40);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const activePost = useMemo(() => {
    if (previewSelection) {
      const match = selectablePosts.find((post) => {
        const sel = selectionForPost(post);
        return (
          sel?.blogHandle === previewSelection.blogHandle &&
          sel?.postHandle === previewSelection.postHandle
        );
      });
      if (match) return match;
    }
    return selectablePosts[0] ?? null;
  }, [previewSelection, selectablePosts, selectionForPost]);

  const activeSelection = activePost ? selectionForPost(activePost) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return selectablePosts;
    return selectablePosts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.urlHandle.toLowerCase().includes(q)
    );
  }, [selectablePosts, query]);

  const viewHref = useMemo(() => {
    if (!activeSelection) return null;
    return buildStorefrontBlogPostUrl(storefrontOrigin ?? null, activeSelection.postHandle);
  }, [activeSelection, storefrontOrigin]);

  const selectPost = useCallback(
    (post: StoreBlogPostItem) => {
      const selection = selectionForPost(post);
      if (!selection) return;
      onPreviewSelectionChange(selection);
      setOpen(false);
      setQuery('');
    },
    [selectionForPost, onPreviewSelectionChange]
  );

  return (
    <TemplatePreviewPickerShell
      rootRef={rootRef}
      label="Preview blog post"
      open={open}
      onToggle={() => setOpen((v) => !v)}
      trigger={
        <div className="flex items-center gap-3">
          <TemplatePreviewPickerThumb src={activePost?.featuredImageUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-gray-900">
              {loading && !activePost ? 'Loading…' : activePost?.title ?? 'Select a blog post'}
            </p>
            {activeSelection ? (
              <p className="truncate text-[11px] text-gray-500">
                /blog/{activeSelection.postHandle}
              </p>
            ) : (
              <p className="truncate text-[11px] text-gray-500">Choose which post to preview</p>
            )}
          </div>
        </div>
      }
      triggerAside={
        viewHref ? (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            title="View post on storefront"
            onClick={(e) => e.stopPropagation()}
            className={templatePreviewViewLinkClassName}
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        ) : null
      }
    >
      <div className="border-b border-[#eceef0] p-2.5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blog posts"
            className={templatePreviewSearchClassName}
            aria-label="Search blog posts"
          />
        </div>
      </div>

      <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
        {!storeId ? (
          <li className="px-3 py-4 text-center text-[12px] text-gray-500">
            Select a store to preview blog posts.
          </li>
        ) : filtered.length === 0 ? (
          <li className="px-3 py-4 text-center text-[12px] text-gray-500">
            {loading ? 'Loading blog posts…' : query.trim() ? 'No posts match' : 'No blog posts yet'}
          </li>
        ) : (
          filtered.map((post) => {
            const sel = selectionForPost(post);
            const selected =
              sel?.blogHandle === activeSelection?.blogHandle &&
              sel?.postHandle === activeSelection?.postHandle;
            return (
              <li key={post._id}>
                <TemplatePreviewPickerOption
                  selected={selected}
                  onClick={() => selectPost(post)}
                  thumb={<TemplatePreviewPickerThumb src={post.featuredImageUrl} size="sm" />}
                  title={post.title}
                  subtitle={sel ? `/blog/${sel.postHandle}` : undefined}
                />
              </li>
            );
          })
        )}
      </ul>

      {storeId ? (
        <div className="border-t border-[#eceef0] p-1.5">
          <Link
            href="/client/online-store/blogs/posts/new"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-[#005bd3] transition hover:bg-[#eef3ff]"
            onClick={() => setOpen(false)}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Create blog post
          </Link>
        </div>
      ) : null}
    </TemplatePreviewPickerShell>
  );
}
