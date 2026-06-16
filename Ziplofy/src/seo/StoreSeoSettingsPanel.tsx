import { PhotoIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../contexts/store.context';
import { META_DESCRIPTION_MAX, PAGE_TITLE_MAX } from './seo-text.util';
import { resolveStorefrontHomeSeoPreview } from './resolve-storefront-home-seo';

type Props = {
  storefrontOrigin?: string | null;
  showSaveButton?: boolean;
  onSaved?: () => void;
};

export function StoreSeoSettingsPanel({
  storefrontOrigin,
  showSaveButton = true,
  onSaved,
}: Props) {
  const { stores, activeStoreId, updateStore, loading } = useStore();
  const activeStore = useMemo(
    () => stores.find((store) => store._id === activeStoreId) ?? null,
    [stores, activeStoreId]
  );

  const [homePageTitle, setHomePageTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [socialImageUrl, setSocialImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeStore) return;
    setHomePageTitle(activeStore.seoHomePageTitle ?? '');
    setMetaDescription(activeStore.seoMetaDescription ?? '');
    setSocialImageUrl(activeStore.seoSocialImageUrl ?? '');
  }, [activeStore]);

  const preview = useMemo(() => {
    if (!activeStore) return null;
    return resolveStorefrontHomeSeoPreview({
      storeName: activeStore.storeName,
      storeDescription: activeStore.storeDescription,
      seoHomePageTitle: homePageTitle,
      seoMetaDescription: metaDescription,
      seoSocialImageUrl: socialImageUrl,
      storefrontOrigin: storefrontOrigin ?? undefined,
    });
  }, [activeStore, homePageTitle, metaDescription, socialImageUrl, storefrontOrigin]);

  const handleSave = useCallback(async () => {
    if (!activeStore) {
      toast.error('Select a store first');
      return;
    }
    try {
      setSaving(true);
      await updateStore(activeStore._id, {
        seoHomePageTitle: homePageTitle.trim(),
        seoMetaDescription: metaDescription.trim(),
        seoSocialImageUrl: socialImageUrl.trim(),
      });
      toast.success('SEO settings saved');
      onSaved?.();
    } catch {
      toast.error('Failed to save SEO settings');
    } finally {
      setSaving(false);
    }
  }, [activeStore, homePageTitle, metaDescription, socialImageUrl, updateStore, onSaved]);

  if (!activeStore) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Select a store to manage SEO settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Home page SEO</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Default title and description used on your storefront home page and social previews.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="seo-home-title">
                Home page title
              </label>
              <input
                id="seo-home-title"
                type="text"
                value={homePageTitle}
                onChange={(e) => setHomePageTitle(e.target.value.slice(0, PAGE_TITLE_MAX))}
                placeholder={activeStore.storeName}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                {homePageTitle.length} of {PAGE_TITLE_MAX} characters used
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="seo-meta-description">
                Meta description
              </label>
              <textarea
                id="seo-meta-description"
                rows={4}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value.slice(0, META_DESCRIPTION_MAX))}
                placeholder="Brief description for search engines"
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                {metaDescription.length} of {META_DESCRIPTION_MAX} characters used
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="seo-social-image">
                Social sharing image URL
              </label>
              <input
                id="seo-social-image"
                type="url"
                value={socialImageUrl}
                onChange={(e) => setSocialImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {showSaveButton ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save SEO settings'}
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Search preview
              </p>
              <p className="mb-2 text-lg leading-snug text-blue-700">{preview?.title}</p>
              <p className="mb-2 truncate text-sm text-emerald-800">{preview?.canonicalUrl}</p>
              <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">{preview?.description}</p>
            </div>

            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-8 text-center">
              {socialImageUrl.trim() ? (
                <img
                  src={socialImageUrl.trim()}
                  alt="Social sharing preview"
                  className="max-h-40 w-full rounded-lg object-cover"
                />
              ) : (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <PhotoIcon className="h-6 w-6 text-gray-400" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Social sharing image</p>
                  <p className="mt-0.5 text-xs text-gray-500">Recommended 1200 × 628 px</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-4 text-sm text-blue-900">
        Product and collection SEO is edited on each product or collection page. The storefront runtime
        applies these settings automatically when customers visit your store.
      </section>
    </div>
  );
}
