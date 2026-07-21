import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useBlogs } from '../../contexts/blog.context';
import { useBlogPosts, type BlogPost } from '../../contexts/blog-post.context';
import { useStore } from '../../contexts/store.context';
import { buildStorefrontBlogPostUrl } from '../../utils/storefront-url.util';
import type { BlogPostPreviewSelection } from '../utils/blog-page-preview.util';
import { ThemeEditorCreateBlogPostSheet } from './ThemeEditorCreateBlogPostSheet';

type Props = {
  previewSelection: BlogPostPreviewSelection | null;
  onPreviewSelectionChange: (selection: BlogPostPreviewSelection) => void;
  storefrontOrigin?: string | null;
};

export function BlogPostTemplatePreviewCard({
  previewSelection,
  onPreviewSelectionChange,
  storefrontOrigin,
}: Props) {
  const { activeStoreId } = useStore();
  const { blogs, fetchBlogsByStoreId } = useBlogs();
  const { blogPosts, fetchBlogPostsByStoreId, loading } = useBlogPosts();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchBlogsByStoreId(activeStoreId);
    void fetchBlogPostsByStoreId(activeStoreId);
  }, [activeStoreId, fetchBlogsByStoreId, fetchBlogPostsByStoreId]);

  const blogHandleById = useMemo(() => {
    const out = new Map<string, string>();
    for (const blog of blogs) {
      const handle = blog.urlHandle?.trim();
      if (handle) out.set(blog._id, handle);
    }
    return out;
  }, [blogs]);

  const selectionForPost = useCallback(
    (post: BlogPost): BlogPostPreviewSelection | null => {
      const blogHandle = blogHandleById.get(post.blogId);
      const postHandle = post.urlHandle?.trim();
      if (!blogHandle || !postHandle) return null;
      return { blogHandle, postHandle };
    },
    [blogHandleById]
  );

  /** Visible posts only — hidden posts don’t render on the storefront. */
  const selectablePosts = useMemo(
    () => blogPosts.filter((p) => p.visibility !== 'hidden' && selectionForPost(p)),
    [blogPosts, selectionForPost]
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
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.urlHandle.toLowerCase().includes(q)
    );
  }, [selectablePosts, query]);

  const viewHref = useMemo(() => {
    if (!activeSelection) return null;
    return buildStorefrontBlogPostUrl(
      storefrontOrigin ?? null,
      activeSelection.blogHandle,
      activeSelection.postHandle
    );
  }, [activeSelection, storefrontOrigin]);

  const selectPost = useCallback(
    (post: BlogPost) => {
      const selection = selectionForPost(post);
      if (!selection) return;
      onPreviewSelectionChange(selection);
      setOpen(false);
      setQuery('');
    },
    [selectionForPost, onPreviewSelectionChange]
  );

  const handleCreated = useCallback(
    (post: BlogPost) => {
      if (activeStoreId) {
        void fetchBlogPostsByStoreId(activeStoreId);
      }
      const blogHandle = blogHandleById.get(post.blogId);
      const postHandle = post.urlHandle?.trim();
      if (blogHandle && postHandle) {
        onPreviewSelectionChange({ blogHandle, postHandle });
      }
    },
    [activeStoreId, fetchBlogPostsByStoreId, blogHandleById, onPreviewSelectionChange]
  );

  return (
    <div className="relative border-b border-[#e1e1e1] bg-white px-3 py-3" ref={rootRef}>
      <p className="mb-2 text-[12px] font-medium text-gray-600">Preview</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-lg border border-[#e1e1e1] bg-[#fafafa] px-3 py-2.5 text-left transition-colors hover:border-[#c9cccf] hover:bg-white"
      >
        {activePost?.featuredImageUrl ? (
          <img
            src={activePost.featuredImageUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded bg-gray-100 object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100">
            <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-gray-900">
            {loading && !activePost ? 'Loading…' : activePost?.title ?? 'Select a blog post'}
          </p>
          {activeSelection ? (
            <p className="truncate text-[12px] text-gray-500">
              /blogs/{activeSelection.blogHandle}/{activeSelection.postHandle}
            </p>
          ) : (
            <p className="truncate text-[12px] text-gray-500">Choose which post to preview</p>
          )}
        </div>
        {viewHref ? (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            title="View post on storefront"
            onClick={(e) => e.stopPropagation()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-800"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
          </a>
        ) : null}
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-3 right-3 z-[1600] mt-1.5 overflow-hidden rounded-xl border border-[#c9cccf] bg-white shadow-lg"
        >
          <div className="border-b border-[#e1e1e1] p-2">
            <div className="relative">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full rounded-lg border border-[#8c9196] bg-white py-2 pl-8 pr-3 text-[13px] text-gray-900 outline-none focus:border-[#005bd3] focus:ring-2 focus:ring-[#005bd3]/20"
                aria-label="Search blog posts"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-[12px] text-gray-500">
                {loading
                  ? 'Loading blog posts…'
                  : query.trim()
                    ? 'No posts match'
                    : 'No blog posts yet'}
              </li>
            ) : (
              filtered.map((post) => {
                const sel = selectionForPost(post);
                const selected =
                  sel?.blogHandle === activeSelection?.blogHandle &&
                  sel?.postHandle === activeSelection?.postHandle;
                return (
                  <li key={post._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => selectPost(post)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] hover:bg-gray-50 ${
                        selected ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-900'
                      }`}
                    >
                      {post.featuredImageUrl ? (
                        <img
                          src={post.featuredImageUrl}
                          alt=""
                          className="h-7 w-7 shrink-0 rounded bg-gray-100 object-cover"
                        />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-100">
                          <PhotoIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{post.title}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="border-t border-[#e1e1e1] p-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-[#005bd3] hover:bg-blue-50"
            >
              <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
              Create blog post
            </button>
          </div>
        </div>
      ) : null}

      <ThemeEditorCreateBlogPostSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultBlogId={activePost?.blogId ?? null}
        onCreated={handleCreated}
      />
    </div>
  );
}
