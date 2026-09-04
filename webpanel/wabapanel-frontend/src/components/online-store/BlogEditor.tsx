'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronRight, Loader2, PenSquare } from 'lucide-react';
import {
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '@/components/admin-list-ui';
import { slugifyHandle, storeBlogApi, type StoreBlogItem } from '@/lib/store-blog';

const BLOG_TITLE_MAX = 255;

function BlogCreateCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-admin-border bg-white">
      <div className="border-b border-admin-border bg-[#f6f6f7] px-4 py-2.5">
        <h2 className="text-[13px] font-semibold text-admin-text">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

const fieldLabelClass = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';
const fieldInputClass =
  'w-full rounded-lg border border-admin-border bg-white py-1.5 pl-3 pr-14 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const radioClass = 'h-3.5 w-3.5 border-admin-border text-admin-text focus:ring-[#005bd3]/30';

type BlogFormValues = {
  title: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  comments: StoreBlogItem['comments'];
};

type Props = {
  mode: 'create' | 'edit';
  storeId: string;
  blogId?: string;
  initial?: Partial<BlogFormValues>;
  onDeleted?: () => void;
};

export function BlogEditor({ mode, storeId, blogId, initial, onDeleted }: Props) {
  const router = useRouter();
  const titleInputId = useId();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<BlogFormValues>({
    title: '',
    pageTitle: '',
    metaDescription: '',
    urlHandle: '',
    comments: 'disabled',
    ...initial,
  });

  useEffect(() => {
    if (initial) setForm((prev) => ({ ...prev, ...initial }));
  }, [initial]);

  const canSave = form.title.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        pageTitle: form.pageTitle.trim() || form.title.trim(),
        metaDescription: form.metaDescription.trim(),
        urlHandle: form.urlHandle.trim() || slugifyHandle(form.title, 'blog'),
        comments: form.comments,
      };
      if (mode === 'create') {
        const res = await storeBlogApi.createBlog(storeId, payload);
        toast.success('Blog saved');
        router.push(`/client/online-store/blogs/manage/${res.data.data._id}`);
      } else if (blogId) {
        await storeBlogApi.updateBlog(storeId, blogId, payload);
        toast.success('Blog saved');
      }
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!blogId || !window.confirm(`Delete blog "${form.title}"? Posts in this blog may be affected.`)) return;
    setDeleting(true);
    try {
      await storeBlogApi.deleteBlog(storeId, blogId);
      toast.success('Blog deleted');
      onDeleted?.();
      router.push('/client/online-store/blogs/manage');
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} py-5`}>
        <nav className="mb-5 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
          <Link href="/client/online-store/blogs" className={`inline-flex items-center ${adminListFooterLinkClass}`}>
            <PenSquare className="h-3.5 w-3.5 shrink-0" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" />
          <Link href="/client/online-store/blogs/manage" className={`font-medium ${adminListFooterLinkClass}`}>
            Manage blogs
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" />
          <span className="truncate font-medium text-admin-text">{mode === 'create' ? 'Add blog' : form.title || 'Edit'}</span>
        </nav>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-4">
            <section className="rounded-xl border border-admin-border bg-white p-4 sm:p-5">
              <div>
                <label htmlFor={titleInputId} className={fieldLabelClass}>
                  Title
                </label>
                <div className="relative">
                  <input
                    id={titleInputId}
                    type="text"
                    value={form.title}
                    maxLength={BLOG_TITLE_MAX}
                    onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, BLOG_TITLE_MAX) })}
                    className={fieldInputClass}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-admin-text-subdued">
                    {form.title.length}/{BLOG_TITLE_MAX}
                  </span>
                </div>
              </div>
            </section>

            <BlogCreateCard title="Search engine listing">
              <div className="space-y-3">
                <div>
                  <label className={fieldLabelClass}>Page title</label>
                  <input
                    className={fieldInputClass}
                    value={form.pageTitle}
                    onChange={(e) => setForm({ ...form, pageTitle: e.target.value })}
                    placeholder={form.title || 'Page title'}
                    maxLength={70}
                  />
                </div>
                <div>
                  <label className={fieldLabelClass}>Meta description</label>
                  <textarea
                    className={`${fieldInputClass} min-h-[72px] pr-3`}
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    maxLength={320}
                    rows={3}
                  />
                </div>
                <div>
                  <label className={fieldLabelClass}>URL handle</label>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[12px] text-admin-text-subdued">blogs/</span>
                    <input
                      className={`${fieldInputClass} pr-3`}
                      value={form.urlHandle}
                      onChange={(e) => setForm({ ...form, urlHandle: e.target.value })}
                      placeholder={slugifyHandle(form.title, 'blog')}
                    />
                  </div>
                </div>
              </div>
            </BlogCreateCard>
          </div>

          <div className="flex flex-col gap-4">
            <BlogCreateCard title="Comments">
              <div className="space-y-2.5">
                {(
                  [
                    ['disabled', 'Disabled'],
                    ['moderated', 'Allowed, pending moderation'],
                    ['allowed', 'Allowed'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-start gap-2.5 text-[13px] text-admin-text">
                    <input
                      type="radio"
                      name="comments"
                      checked={form.comments === value}
                      onChange={() => setForm({ ...form, comments: value })}
                      className={`${radioClass} mt-0.5`}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </BlogCreateCard>

            {mode === 'edit' ? (
              <BlogCreateCard title="Actions">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void handleDelete()}
                  className="text-[13px] font-medium text-red-600 hover:underline disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete blog'}
                </button>
              </BlogCreateCard>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Link href="/client/online-store/blogs/manage" className={adminListSecondaryButtonClass}>
            Cancel
          </Link>
          <button type="button" disabled={!canSave} onClick={() => void handleSave()} className={adminListPrimaryButtonClass}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
