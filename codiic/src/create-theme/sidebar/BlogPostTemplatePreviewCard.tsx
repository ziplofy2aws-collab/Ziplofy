import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useBlogs } from '../../contexts/blog.context';
import { useBlogPosts, type BlogPost } from '../../contexts/blog-post.context';
import { useStore } from '../../contexts/store.context';
import { buildStorefrontBlogPostUrl } from '../../utils/storefront-url.util';
import type { BlogPostPreviewSelection } from '../utils/blog-page-preview.util';
import { ThemeEditorCreateBlogPostSheet } from './ThemeEditorCreateBlogPostSheet';
import {
  TemplatePreviewPickerOption,
  TemplatePreviewPickerShell,
  TemplatePreviewPickerThumb,
  templatePreviewCreateClassName,
  templatePreviewSearchClassName,
  templatePreviewViewLinkClassName,
} from './TemplatePreviewPickerShell';

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
    <>
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
                  /blogs/{activeSelection.blogHandle}/{activeSelection.postHandle}
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
              <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
            </a>
          ) : null
        }
      >
        <div className="border-b border-[#eceef0] p-2.5">
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
              placeholder="Search blog posts"
              className={templatePreviewSearchClassName}
              aria-label="Search blog posts"
            />
          </div>
        </div>

        <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-[12px] text-gray-500">
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
                  <TemplatePreviewPickerOption
                    selected={selected}
                    onClick={() => selectPost(post)}
                    thumb={
                      <TemplatePreviewPickerThumb src={post.featuredImageUrl} size="sm" />
                    }
                    title={post.title}
                    subtitle={
                      sel ? `/blogs/${sel.blogHandle}/${sel.postHandle}` : undefined
                    }
                  />
                </li>
              );
            })
          )}
        </ul>

        <div className="border-t border-[#eceef0] p-1.5">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCreateOpen(true);
            }}
            className={templatePreviewCreateClassName}
          >
            <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
            Create blog post
          </button>
        </div>
      </TemplatePreviewPickerShell>

      <ThemeEditorCreateBlogPostSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultBlogId={activePost?.blogId ?? null}
        onCreated={handleCreated}
      />
    </>
  );
}
