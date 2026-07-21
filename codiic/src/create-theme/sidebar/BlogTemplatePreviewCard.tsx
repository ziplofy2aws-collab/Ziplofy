import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useBlogs, type Blog } from '../../contexts/blog.context';
import { useStore } from '../../contexts/store.context';
import { buildStorefrontBlogUrl } from '../../utils/storefront-url.util';
import { pickDefaultPreviewBlog } from '../utils/blog-page-preview.util';
import { ThemeEditorCreateBlogSheet } from './ThemeEditorCreateBlogSheet';

type Props = {
  previewBlogHandle: string | null;
  onPreviewBlogHandleChange: (handle: string) => void;
  storefrontOrigin?: string | null;
};

export function BlogTemplatePreviewCard({
  previewBlogHandle,
  onPreviewBlogHandleChange,
  storefrontOrigin,
}: Props) {
  const { activeStoreId } = useStore();
  const { blogs, fetchBlogsByStoreId, loading } = useBlogs();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchBlogsByStoreId(activeStoreId);
  }, [activeStoreId, fetchBlogsByStoreId]);

  useEffect(() => {
    if (previewBlogHandle || !blogs.length) return;
    const fallback = pickDefaultPreviewBlog(blogs);
    if (fallback?.urlHandle) {
      onPreviewBlogHandleChange(fallback.urlHandle);
    }
  }, [blogs, previewBlogHandle, onPreviewBlogHandleChange]);

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

  const active = useMemo(() => {
    if (!previewBlogHandle) return pickDefaultPreviewBlog(blogs);
    return (
      blogs.find((b) => b.urlHandle === previewBlogHandle) ?? pickDefaultPreviewBlog(blogs)
    );
  }, [blogs, previewBlogHandle]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.urlHandle.toLowerCase().includes(q)
    );
  }, [blogs, query]);

  const viewHref = useMemo(() => {
    if (!active?.urlHandle) return null;
    return buildStorefrontBlogUrl(storefrontOrigin ?? null, active.urlHandle);
  }, [active?.urlHandle, storefrontOrigin]);

  const selectBlog = useCallback(
    (blog: Blog) => {
      const handle = blog.urlHandle?.trim();
      if (!handle) return;
      onPreviewBlogHandleChange(handle);
      setOpen(false);
      setQuery('');
    },
    [onPreviewBlogHandleChange]
  );

  const handleCreate = () => {
    setOpen(false);
    setCreateOpen(true);
  };

  const handleCreated = useCallback(
    (blog: Blog) => {
      if (activeStoreId) {
        void fetchBlogsByStoreId(activeStoreId);
      }
      const handle = blog.urlHandle?.trim();
      if (handle) onPreviewBlogHandleChange(handle);
    },
    [activeStoreId, fetchBlogsByStoreId, onPreviewBlogHandleChange]
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
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100">
          <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-gray-900">
            {loading && !active ? 'Loading…' : active?.title ?? 'Select a blog'}
          </p>
          {active?.urlHandle ? (
            <p className="truncate text-[12px] text-gray-500">/blogs/{active.urlHandle}</p>
          ) : (
            <p className="truncate text-[12px] text-gray-500">Choose which blog to preview</p>
          )}
        </div>
        {viewHref ? (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            title="View blog on storefront"
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
                aria-label="Search blogs"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-[12px] text-gray-500">
                {loading ? 'Loading blogs…' : query.trim() ? 'No blogs match' : 'No blogs yet'}
              </li>
            ) : (
              filtered.map((blog) => {
                const selected = blog.urlHandle === (previewBlogHandle ?? active?.urlHandle);
                return (
                  <li key={blog._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => selectBlog(blog)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] hover:bg-gray-50 ${
                        selected ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-900'
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-100">
                        <PhotoIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{blog.title}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="border-t border-[#e1e1e1] p-1">
            <button
              type="button"
              onClick={handleCreate}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-[#005bd3] hover:bg-blue-50"
            >
              <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
              Create blog
            </button>
          </div>
        </div>
      ) : null}

      <ThemeEditorCreateBlogSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
