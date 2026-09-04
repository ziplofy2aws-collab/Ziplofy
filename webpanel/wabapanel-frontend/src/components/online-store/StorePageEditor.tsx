'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, ChevronRight, FileText, Loader2, Sparkles, Trash2, X } from 'lucide-react';
import {
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '@/components/admin-list-ui';
import { slugifyHandle, storePageApi } from '@/lib/store-page';

const fieldLabel = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';
const fieldInput =
  'w-full rounded-lg border border-admin-border bg-white py-1.5 pl-3 pr-9 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const radioClass = 'h-3.5 w-3.5 border-admin-border text-admin-text focus:ring-[#005bd3]/30';

function PageCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
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

export type StorePageFormValues = {
  title: string;
  content: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: 'visible' | 'hidden';
};

export const emptyStorePageForm = (): StorePageFormValues => ({
  title: '',
  content: '',
  pageTitle: '',
  metaDescription: '',
  urlHandle: '',
  visibility: 'hidden',
});

function PageAddedBanner({
  pageTitle,
  onDismiss,
  onAddAnother,
}: {
  pageTitle: string;
  onDismiss: () => void;
  onAddAnother: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
      <p className="text-[13px] font-medium text-emerald-900">Added {pageTitle}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onAddAnother} className={adminListSecondaryButtonClass}>
          Add another page
        </button>
        <button type="button" onClick={onDismiss} className="rounded p-1 text-emerald-800 hover:bg-emerald-100" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

type Props = {
  mode: 'create' | 'edit';
  storeId: string;
  pageId?: string;
  initial?: Partial<StorePageFormValues>;
  showAddedBanner?: boolean;
  onDismissBanner?: () => void;
};

export function StorePageEditor({
  mode,
  storeId,
  pageId,
  initial,
  showAddedBanner,
  onDismissBanner,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<StorePageFormValues>(() => ({
    ...emptyStorePageForm(),
    ...initial,
  }));

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
        content: form.content,
        pageTitle: form.pageTitle.trim() || form.title.trim(),
        metaDescription: form.metaDescription.trim(),
        urlHandle: form.urlHandle.trim() || slugifyHandle(form.title, 'page'),
        visibility: form.visibility,
      };
      if (mode === 'create') {
        const res = await storePageApi.createPage(storeId, payload);
        toast.success('Page created');
        router.push(`/client/online-store/pages/${res.data.data._id}?created=1`);
      } else if (pageId) {
        await storePageApi.updatePage(storeId, pageId, payload);
        toast.success('Page updated');
      }
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pageId || !window.confirm(`Delete "${form.title || 'this page'}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await storePageApi.deletePage(storeId, pageId);
      toast.success('Page deleted');
      router.push('/client/online-store/pages');
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const seoHandle = form.urlHandle.trim() || slugifyHandle(form.title, 'page');

  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} py-5`}>
        <nav className="mb-5 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
          <Link href="/client/online-store/pages" className={`inline-flex items-center gap-1 font-medium ${adminListFooterLinkClass}`}>
            <FileText className="h-3.5 w-3.5 shrink-0" />
            Pages
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" />
          <span className="truncate font-medium text-admin-text">{mode === 'create' ? 'Add page' : form.title || 'Edit page'}</span>
        </nav>

        {showAddedBanner ? (
          <PageAddedBanner
            pageTitle={form.title.trim() || 'page'}
            onDismiss={() => onDismissBanner?.()}
            onAddAnother={() => router.push('/client/online-store/pages/new')}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-4">
            <section className="rounded-xl border border-admin-border bg-white p-4 sm:p-5">
              <div className="space-y-4">
                <div>
                  <label className={fieldLabel}>Title</label>
                  <div className="relative">
                    <input
                      className={fieldInput}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. About us, sizing chart, FAQ"
                    />
                    <Sparkles className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-subdued" />
                  </div>
                </div>
                <div>
                  <label className={fieldLabel}>Content</label>
                  <textarea
                    className={`${fieldInput} min-h-[260px] pr-3 font-mono text-[12px]`}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Write your page content (HTML supported)…"
                  />
                </div>
              </div>
            </section>

            <PageCard title="Search engine listing">
              <div className="space-y-3">
                <div>
                  <label className={fieldLabel}>Page title</label>
                  <input
                    className={`${fieldInput} pr-3`}
                    value={form.pageTitle}
                    onChange={(e) => setForm({ ...form, pageTitle: e.target.value })}
                    placeholder={form.title || 'Page title'}
                    maxLength={70}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Meta description</label>
                  <textarea
                    className={`${fieldInput} min-h-[72px] pr-3`}
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    maxLength={320}
                    rows={3}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>URL handle</label>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[12px] text-admin-text-subdued">/</span>
                    <input
                      className={`${fieldInput} pr-3`}
                      value={form.urlHandle}
                      onChange={(e) => setForm({ ...form, urlHandle: e.target.value })}
                      placeholder={slugifyHandle(form.title, 'page')}
                    />
                  </div>
                  <p className="mt-1.5 text-[12px] text-admin-text-subdued">Preview: /{seoHandle}</p>
                </div>
              </div>
            </PageCard>
          </div>

          <div className="flex flex-col gap-4">
            <PageCard title="Visibility" action={<Calendar className="h-4 w-4 text-admin-text-subdued" />}>
              <div className="space-y-2.5">
                {(['visible', 'hidden'] as const).map((v) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                    <input
                      type="radio"
                      name="page-visibility"
                      checked={form.visibility === v}
                      onChange={() => setForm({ ...form, visibility: v })}
                      className={radioClass}
                    />
                    {v === 'visible' ? 'Visible' : 'Hidden'}
                  </label>
                ))}
              </div>
            </PageCard>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-admin-border pt-4">
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting || saving}
              className="mr-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[13px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Deleting…' : 'Delete page'}
            </button>
          ) : (
            <Link href="/client/online-store/pages" className={`${adminListSecondaryButtonClass} mr-auto`}>
              Cancel
            </Link>
          )}
          <button type="button" disabled={!canSave} onClick={() => void handleSave()} className={adminListPrimaryButtonClass}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function StorePageFormSkeleton() {
  return (
    <div className={`${adminListPageInnerClass} animate-pulse space-y-4 py-5`}>
      <div className="h-4 w-48 rounded bg-[#ebebeb]" />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="h-80 rounded-xl bg-[#ebebeb]" />
        <div className="h-40 rounded-xl bg-[#ebebeb]" />
      </div>
    </div>
  );
}
