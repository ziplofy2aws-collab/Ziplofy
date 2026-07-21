import React, { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ProductDescriptionInput from '../../components/products/ProductDescriptionInput';
import { useBlogs } from '../../contexts/blog.context';
import { useBlogPosts, type BlogPost } from '../../contexts/blog-post.context';
import { useStore } from '../../contexts/store.context';

const POST_TITLE_MAX = 255;

function slugifyPostHandle(name: string, { trimEdges = true }: { trimEdges?: boolean } = {}): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-');
  if (trimEdges) {
    slug = slug.replace(/^-+|-+$/g, '');
  }
  return slug;
}

export type ThemeEditorCreateBlogPostSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Preselect this blog when the sheet opens (falls back to first blog). */
  defaultBlogId?: string | null;
  onCreated?: (post: BlogPost) => void;
};

export function ThemeEditorCreateBlogPostSheet({
  open,
  onClose,
  defaultBlogId,
  onCreated,
}: ThemeEditorCreateBlogPostSheetProps) {
  const { activeStoreId } = useStore();
  const { blogs, fetchBlogsByStoreId } = useBlogs();
  const { createBlogPost } = useBlogPosts();
  const titleInputId = useId();
  const handleInputId = useId();
  const blogSelectId = useId();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [blogId, setBlogId] = useState('');
  const [title, setTitle] = useState('');
  const [urlHandle, setUrlHandle] = useState('');
  const [handleTouched, setHandleTouched] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const suggestedHandle = useMemo(() => slugifyPostHandle(title), [title]);
  const effectiveHandle = handleTouched ? urlHandle : suggestedHandle;
  const selectedBlog = blogs.find((b) => b._id === blogId) ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !activeStoreId) return;
    void fetchBlogsByStoreId(activeStoreId);
  }, [open, activeStoreId, fetchBlogsByStoreId]);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setTitle('');
    setUrlHandle('');
    setHandleTouched(false);
    setContent('');
    setBlogId(defaultBlogId ?? '');
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open, defaultBlogId]);

  /** Fall back to the first blog once blogs load. */
  useEffect(() => {
    if (!open || blogId || !blogs.length) return;
    setBlogId(defaultBlogId && blogs.some((b) => b._id === defaultBlogId) ? defaultBlogId : blogs[0]!._id);
  }, [open, blogId, blogs, defaultBlogId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const handleSave = async () => {
    const name = title.trim();
    if (!name) {
      toast.error('Title is required');
      return;
    }
    if (!blogId) {
      toast.error('Select a blog for this post');
      return;
    }
    if (!activeStoreId) {
      toast.error('Select a store before saving a blog post');
      return;
    }

    setSaving(true);
    try {
      const post = await createBlogPost({
        storeId: activeStoreId,
        blogId,
        title: name,
        urlHandle: slugifyPostHandle(effectiveHandle) || undefined,
        content: content.trim() || undefined,
        visibility: 'visible',
      });
      toast.success('Blog post created');
      onCreated?.(post);
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Failed to create blog post');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[15000] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close create blog post"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-editor-create-blog-post-title"
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-center border-b border-[#e1e1e1] py-2">
          <span className="h-1 w-10 rounded-full bg-gray-300" aria-hidden />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 sm:px-6">
          <h2
            id="theme-editor-create-blog-post-title"
            className="pr-10 text-lg font-semibold tracking-tight text-gray-900"
          >
            Create blog post
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Add a post, then preview it in your blog post template.
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <label
                htmlFor={blogSelectId}
                className="mb-1.5 block text-sm font-semibold text-gray-900"
              >
                Blog
              </label>
              <select
                id={blogSelectId}
                value={blogId}
                onChange={(e) => setBlogId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-2 focus:ring-[#005bd3]/20"
              >
                {!blogs.length ? <option value="">No blogs yet</option> : null}
                {blogs.map((blog) => (
                  <option key={blog._id} value={blog._id}>
                    {blog.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={titleInputId}
                className="mb-1.5 block text-sm font-semibold text-gray-900"
              >
                Title
              </label>
              <div className="relative">
                <input
                  id={titleInputId}
                  type="text"
                  value={title}
                  maxLength={POST_TITLE_MAX}
                  onChange={(e) => setTitle(e.target.value.slice(0, POST_TITLE_MAX))}
                  placeholder="e.g. Our first story"
                  autoFocus
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-16 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#005bd3] focus:outline-none focus:ring-2 focus:ring-[#005bd3]/20"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">
                  {title.length}/{POST_TITLE_MAX}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor={handleInputId}
                className="mb-1.5 block text-sm font-semibold text-gray-900"
              >
                URL handle
              </label>
              <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 focus-within:border-[#005bd3] focus-within:ring-2 focus-within:ring-[#005bd3]/20">
                <span className="shrink-0 border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                  /blogs/{selectedBlog?.urlHandle || '…'}/
                </span>
                <input
                  id={handleInputId}
                  type="text"
                  value={effectiveHandle}
                  onChange={(e) => {
                    setHandleTouched(true);
                    // Keep trailing "-" while typing so users can form multi-word handles.
                    setUrlHandle(slugifyPostHandle(e.target.value, { trimEdges: false }));
                  }}
                  onBlur={() => {
                    setUrlHandle((prev) => slugifyPostHandle(prev));
                  }}
                  placeholder="our-first-story"
                  className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-semibold text-gray-900">
                Content <span className="font-normal text-gray-400">(optional)</span>
              </p>
              <ProductDescriptionInput
                value={content}
                onChange={setContent}
                hideLabel
                placeholder="Write your blog post…"
                enableTemplates={false}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#e1e1e1] bg-white px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !title.trim() || !blogId}
            className="rounded-lg bg-[#005bd3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004bb0] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Create post'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
