import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useBlogs, type Blog } from '../../contexts/blog.context';
import { useStore } from '../../contexts/store.context';
import { buildStorefrontBlogUrl } from '../../utils/storefront-url.util';
import { pickDefaultPreviewBlog } from '../utils/blog-page-preview.util';
import { ThemeEditorCreateBlogSheet } from './ThemeEditorCreateBlogSheet';
import {
  TemplatePreviewPickerOption,
  TemplatePreviewPickerShell,
  TemplatePreviewPickerThumb,
  templatePreviewCreateClassName,
  templatePreviewSearchClassName,
  templatePreviewViewLinkClassName,
} from './TemplatePreviewPickerShell';

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
      (b) => b.title.toLowerCase().includes(q) || b.urlHandle.toLowerCase().includes(q)
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
    <>
      <TemplatePreviewPickerShell
        rootRef={rootRef}
        label="Preview blog"
        open={open}
        onToggle={() => setOpen((v) => !v)}
        trigger={
          <div className="flex items-center gap-3">
            <TemplatePreviewPickerThumb />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-gray-900">
                {loading && !active ? 'Loading…' : active?.title ?? 'Select a blog'}
              </p>
              {active?.urlHandle ? (
                <p className="truncate text-[11px] text-gray-500">/blogs/{active.urlHandle}</p>
              ) : (
                <p className="truncate text-[11px] text-gray-500">Choose which blog to preview</p>
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
              title="View blog on storefront"
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
              placeholder="Search blogs"
              className={templatePreviewSearchClassName}
              aria-label="Search blogs"
            />
          </div>
        </div>

        <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-[12px] text-gray-500">
              {loading ? 'Loading blogs…' : query.trim() ? 'No blogs match' : 'No blogs yet'}
            </li>
          ) : (
            filtered.map((blog) => {
              const selected = blog.urlHandle === (previewBlogHandle ?? active?.urlHandle);
              return (
                <li key={blog._id}>
                  <TemplatePreviewPickerOption
                    selected={selected}
                    onClick={() => selectBlog(blog)}
                    thumb={<TemplatePreviewPickerThumb size="sm" />}
                    title={blog.title}
                    subtitle={blog.urlHandle ? `/blogs/${blog.urlHandle}` : undefined}
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
            Create blog
          </button>
        </div>
      </TemplatePreviewPickerShell>

      <ThemeEditorCreateBlogSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
