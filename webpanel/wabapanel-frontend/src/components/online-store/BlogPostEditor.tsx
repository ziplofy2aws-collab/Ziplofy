'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronRight, Loader2, PenSquare, Sparkles } from 'lucide-react';
import {
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '@/components/admin-list-ui';
import { InformaticImageField } from '@/components/store-media/InformaticImageField';
import { slugifyHandle, storeBlogApi, type StoreBlogItem } from '@/lib/store-blog';
import { useAuthStore } from '@/stores/authStore';

const fieldLabel = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';
const fieldInput =
  'w-full rounded-lg border border-admin-border bg-white py-1.5 pl-3 pr-3 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const fieldInputWithCounter =
  'w-full rounded-lg border border-admin-border bg-white py-1.5 pl-3 pr-9 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const radioClass = 'h-3.5 w-3.5 border-admin-border text-admin-text focus:ring-[#005bd3]/30';

function BlogPostCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-admin-border bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-admin-border bg-[#f6f6f7] px-4 py-2.5">
        <h2 className="text-[13px] font-semibold text-admin-text">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export type BlogPostFormValues = {
  title: string;
  content: string;
  excerpt: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: 'visible' | 'hidden';
  author: string;
  blogId: string;
  tags: string;
  featuredImageUrl: string;
};

export const emptyBlogPostForm = (): BlogPostFormValues => ({
  title: '',
  content: '',
  excerpt: '',
  pageTitle: '',
  metaDescription: '',
  urlHandle: '',
  visibility: 'hidden',
  author: '',
  blogId: '',
  tags: '',
  featuredImageUrl: '',
});

type Props = {
  mode: 'create' | 'edit';
  storeId: string;
  postId?: string;
  initial?: Partial<BlogPostFormValues>;
  onSaved?: (postId: string) => void;
};

export function BlogPostEditor({ mode, storeId, postId, initial, onSaved }: Props) {
  const userName = useAuthStore((s) => s.user?.name || '');
  const [blogs, setBlogs] = useState<StoreBlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [excerptEditing, setExcerptEditing] = useState(false);
  const [form, setForm] = useState<BlogPostFormValues>(() => ({
    ...emptyBlogPostForm(),
    author: userName || '',
    ...initial,
  }));

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await storeBlogApi.listBlogs(storeId);
        const list = res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
        setBlogs(list);
        if (!form.blogId && list[0]) {
          setForm((f) => ({ ...f, blogId: list[0]._id }));
        }
      } catch {
        toast.error('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId]);

  const selectedBlog = useMemo(
    () => blogs.find((b) => b._id === form.blogId) || blogs[0] || null,
    [blogs, form.blogId]
  );

  const seoHandle = form.urlHandle.trim() || slugifyHandle(form.title, 'post');
  const seoBlogHandle = selectedBlog?.urlHandle || 'blog';

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.blogId) {
      toast.error('Create a blog first, then assign this post');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        blogId: form.blogId,
        title: form.title.trim(),
        content: form.content,
        excerpt: form.excerpt,
        pageTitle: form.pageTitle.trim() || form.title.trim(),
        metaDescription: form.metaDescription.trim(),
        urlHandle: form.urlHandle.trim() || slugifyHandle(form.title, 'post'),
        visibility: form.visibility,
        author: form.author.trim(),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        featuredImageUrl: form.featuredImageUrl,
      };
      if (mode === 'create') {
        const res = await storeBlogApi.createPost(storeId, payload);
        toast.success('Blog post created');
        onSaved?.(res.data.data._id);
      } else if (postId) {
        await storeBlogApi.updatePost(storeId, postId, payload);
        toast.success('Blog post saved');
        onSaved?.(postId);
      }
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-admin-text-secondary" />
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="rounded-xl border border-admin-border bg-white p-8 text-center">
        <p className="text-[15px] font-semibold text-admin-text">Create a blog first</p>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Blog posts belong to a blog container. Add one, then create articles.
        </p>
        <Link href="/client/online-store/blogs/manage/new" className={`${adminListPrimaryButtonClass} mt-4 inline-flex`}>
          Add blog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-admin-border bg-white p-4 sm:p-5">
          <label className={fieldLabel}>Title</label>
          <div className="relative">
            <input
              className={fieldInputWithCounter}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. How to style your summer collection"
            />
            <Sparkles className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
          </div>
        </section>

        <BlogPostCard title="Content">
          <textarea
            className={`${fieldInput} min-h-[260px] font-mono text-[12px]`}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your article content (HTML supported)…"
          />
        </BlogPostCard>

        <BlogPostCard
          title="Excerpt"
          action={
            !excerptEditing && !form.excerpt ? (
              <button type="button" onClick={() => setExcerptEditing(true)} className="text-[12px] font-medium text-[#005bd3] hover:underline">
                Add excerpt
              </button>
            ) : null
          }
        >
          {excerptEditing || form.excerpt ? (
            <textarea
              className={`${fieldInput} min-h-[100px]`}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Short summary for blog index cards"
            />
          ) : (
            <p className="text-[13px] text-admin-text-secondary">Add a summary of your post to appear on your blog.</p>
          )}
        </BlogPostCard>

        <BlogPostCard title="Search engine listing">
          <div className="space-y-3">
            <div>
              <label className={fieldLabel}>Page title</label>
              <input
                className={fieldInput}
                value={form.pageTitle}
                onChange={(e) => setForm({ ...form, pageTitle: e.target.value })}
                placeholder={form.title || 'Page title'}
                maxLength={70}
              />
            </div>
            <div>
              <label className={fieldLabel}>Meta description</label>
              <textarea
                className={`${fieldInput} min-h-[72px]`}
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                maxLength={320}
                rows={3}
              />
            </div>
            <div>
              <label className={fieldLabel}>URL handle</label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[12px] text-admin-text-subdued">blogs/{seoBlogHandle}/</span>
                <input
                  className={fieldInput}
                  value={form.urlHandle}
                  onChange={(e) => setForm({ ...form, urlHandle: e.target.value })}
                  placeholder={slugifyHandle(form.title, 'post')}
                />
              </div>
              <p className="mt-1.5 text-[12px] text-admin-text-subdued">Preview: /blogs/{seoBlogHandle}/{seoHandle}</p>
            </div>
          </div>
        </BlogPostCard>
      </div>

      <div className="flex flex-col gap-4">
        <BlogPostCard title="Visibility">
          <div className="space-y-2.5">
            {(['hidden', 'visible'] as const).map((v) => (
              <label key={v} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-admin-text">
                <input
                  type="radio"
                  name="visibility"
                  checked={form.visibility === v}
                  onChange={() => setForm({ ...form, visibility: v })}
                  className={radioClass}
                />
                {v === 'visible' ? 'Visible' : 'Hidden'}
              </label>
            ))}
          </div>
        </BlogPostCard>

        <BlogPostCard title="Organization">
          <div className="space-y-3">
            <div>
              <label className={fieldLabel}>Author</label>
              <input className={fieldInput} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div>
              <label className={fieldLabel}>Blog</label>
              <select className={fieldInput} value={form.blogId} onChange={(e) => setForm({ ...form, blogId: e.target.value })}>
                {blogs.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={fieldLabel}>Tags (comma-separated)</label>
              <input
                className={fieldInput}
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="news, update, tutorial"
              />
            </div>
          </div>
        </BlogPostCard>

        <BlogPostCard title="Featured image">
          <InformaticImageField
            label=""
            value={form.featuredImageUrl}
            onChange={(url) => setForm({ ...form, featuredImageUrl: url })}
            storeId={storeId}
          />
        </BlogPostCard>
      </div>

      <div className="flex justify-end gap-2 lg:col-span-2">
        <Link href="/client/online-store/blogs" className={adminListSecondaryButtonClass}>
          Cancel
        </Link>
        <button type="button" disabled={saving} className={adminListPrimaryButtonClass} onClick={() => void handleSave()}>
          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          {mode === 'create' ? 'Save' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export function BlogPostPageShell({
  mode,
  title,
  children,
}: {
  mode: 'create' | 'edit';
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} py-5`}>
        <nav className="mb-5 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
          <Link href="/client/online-store/blogs" className={`inline-flex items-center ${adminListFooterLinkClass}`}>
            <PenSquare className="h-3.5 w-3.5 shrink-0" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" />
          <span className="truncate font-medium text-admin-text">
            {mode === 'create' ? 'Add blog post' : title || 'Edit blog post'}
          </span>
        </nav>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
            {mode === 'create' ? 'Add blog post' : title || 'Edit blog post'}
          </h1>
          <Link href="/client/online-store/blogs/manage" className={adminListSecondaryButtonClass}>
            Manage blogs
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
