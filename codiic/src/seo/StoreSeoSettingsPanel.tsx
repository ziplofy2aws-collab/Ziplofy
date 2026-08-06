import { InformationCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminListCardClass, adminListFooterLinkClass, adminListSecondaryButtonClass } from '../components/admin-list-ui';
import { SelectImageModal, type SelectedImageAsset } from '../components/SelectImageModal';
import { useStore } from '../contexts/store.context';
import { META_DESCRIPTION_MAX, PAGE_TITLE_MAX } from './seo-text.util';
import { resolveStorefrontHomeSeoPreview } from './resolve-storefront-home-seo';

export type StoreSeoValues = {
  homePageTitle: string;
  metaDescription: string;
  socialImageUrl: string;
};

type Props = {
  storefrontOrigin?: string | null;
  showSaveButton?: boolean;
  onSaved?: () => void;
  variant?: 'default' | 'preferences';
  seoValues?: StoreSeoValues;
  onSeoChange?: (values: StoreSeoValues) => void;
};

function InfoTooltip() {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 text-admin-text-subdued transition-colors hover:text-admin-text-secondary"
      aria-label="More information"
    >
      <InformationCircleIcon className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function StoreSeoSettingsPanel({
  storefrontOrigin,
  showSaveButton = true,
  onSaved,
  variant = 'default',
  seoValues,
  onSeoChange,
}: Props) {
  const { stores, activeStoreId, updateStore, loading } = useStore();
  const activeStore = useMemo(
    () => stores.find((store) => store._id === activeStoreId) ?? null,
    [stores, activeStoreId]
  );

  const isControlled = Boolean(seoValues && onSeoChange);

  const [homePageTitle, setHomePageTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [socialImageUrl, setSocialImageUrl] = useState('');
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const resolvedHomePageTitle = isControlled ? (seoValues?.homePageTitle ?? '') : homePageTitle;
  const resolvedMetaDescription = isControlled ? (seoValues?.metaDescription ?? '') : metaDescription;
  const resolvedSocialImageUrl = isControlled ? (seoValues?.socialImageUrl ?? '') : socialImageUrl;

  const updateSeoField = useCallback(
    (field: keyof StoreSeoValues, value: string) => {
      if (isControlled && onSeoChange && seoValues) {
        onSeoChange({ ...seoValues, [field]: value });
        return;
      }

      if (field === 'homePageTitle') setHomePageTitle(value);
      if (field === 'metaDescription') setMetaDescription(value);
      if (field === 'socialImageUrl') setSocialImageUrl(value);
    },
    [isControlled, onSeoChange, seoValues]
  );

  useEffect(() => {
    if (!activeStore || isControlled) return;
    setHomePageTitle(activeStore.seoHomePageTitle ?? '');
    setMetaDescription(activeStore.seoMetaDescription ?? '');
    setSocialImageUrl(activeStore.seoSocialImageUrl ?? '');
  }, [activeStore, isControlled]);

  const preview = useMemo(() => {
    if (!activeStore) return null;
    return resolveStorefrontHomeSeoPreview({
      storeName: activeStore.storeName,
      storeDescription: activeStore.storeDescription,
      seoHomePageTitle: resolvedHomePageTitle,
      seoMetaDescription: resolvedMetaDescription,
      seoSocialImageUrl: resolvedSocialImageUrl,
      storefrontOrigin: storefrontOrigin ?? undefined,
    });
  }, [activeStore, resolvedHomePageTitle, resolvedMetaDescription, resolvedSocialImageUrl, storefrontOrigin]);

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

  const handleImageSelected = useCallback(
    (asset: SelectedImageAsset) => {
      updateSeoField('socialImageUrl', asset.url);
    },
    [updateSeoField]
  );

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400/30';

  if (!activeStore) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Select a store to manage SEO settings.
      </div>
    );
  }

  const previewHost = preview?.canonicalUrl
    ? preview.canonicalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').toUpperCase()
    : activeStore.storeName.toUpperCase();

  const previewTitle = resolvedHomePageTitle.trim() || preview?.title || activeStore.storeName;
  const previewDescription =
    resolvedMetaDescription.trim() ||
    preview?.description ||
    'Enter a description to be shown on search engines like Google';

  if (variant === 'preferences') {
    return (
      <section className={adminListCardClass}>
        <div className="border-b border-admin-divider px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[13px] font-semibold text-admin-text">Social sharing image and SEO</h2>
            <InfoTooltip />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 sm:p-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-admin-border bg-admin-secondary/60 px-6 py-8 text-center">
              {resolvedSocialImageUrl.trim() ? (
                <div className="w-full space-y-3">
                  <img
                    src={resolvedSocialImageUrl.trim()}
                    alt="Social sharing preview"
                    className="max-h-36 w-full rounded-md object-cover"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setImagePickerOpen(true)}
                      className={`text-[12px] font-medium ${adminListFooterLinkClass}`}
                    >
                      Change image
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSeoField('socialImageUrl', '')}
                      className="text-[12px] font-medium text-admin-text-secondary hover:text-admin-text"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setImagePickerOpen(true)}
                    className={adminListSecondaryButtonClass}
                  >
                    Add image
                  </button>
                  <p className="mt-2 text-[12px] text-admin-text-secondary">Recommended: 1200 x 628 px</p>
                </>
              )}
            </div>

            <div className="rounded-lg border border-admin-border bg-admin-surface px-3 py-3">
              <p className="truncate text-[11px] font-normal uppercase tracking-wide text-admin-text-secondary">
                {previewHost}
              </p>
              <p className="mt-1 truncate text-[13px] font-semibold text-admin-text">{previewTitle}</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-admin-text-secondary">
                {previewDescription}
              </p>
            </div>

          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-admin-text" htmlFor="seo-home-title">
                Home page title
              </label>
              <input
                id="seo-home-title"
                type="text"
                value={resolvedHomePageTitle}
                onChange={(e) =>
                  updateSeoField('homePageTitle', e.target.value.slice(0, PAGE_TITLE_MAX))
                }
                placeholder={activeStore.storeName}
                className="w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] text-admin-text outline-none placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]"
              />
              <p className="mt-1.5 text-[12px] text-admin-text-secondary">
                {resolvedHomePageTitle.length} of {PAGE_TITLE_MAX} characters used
              </p>
            </div>

            <div>
              <label
                className="mb-1.5 block text-[13px] font-medium text-admin-text"
                htmlFor="seo-meta-description"
              >
                Meta description
              </label>
              <textarea
                id="seo-meta-description"
                rows={4}
                value={resolvedMetaDescription}
                onChange={(e) =>
                  updateSeoField('metaDescription', e.target.value.slice(0, META_DESCRIPTION_MAX))
                }
                placeholder="Enter a description to be shown on search engines like Google"
                className="w-full resize-none rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] text-admin-text outline-none placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]"
              />
              <p className="mt-1.5 text-[12px] text-admin-text-secondary">
                {resolvedMetaDescription.length} of {META_DESCRIPTION_MAX} characters used
              </p>
            </div>
          </div>
        </div>

        <SelectImageModal
          open={imagePickerOpen}
          initialUrl={resolvedSocialImageUrl}
          onClose={() => setImagePickerOpen(false)}
          onSelect={handleImageSelected}
        />
      </section>
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
                value={resolvedHomePageTitle}
                onChange={(e) =>
                  updateSeoField('homePageTitle', e.target.value.slice(0, PAGE_TITLE_MAX))
                }
                placeholder={activeStore.storeName}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                {resolvedHomePageTitle.length} of {PAGE_TITLE_MAX} characters used
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="seo-meta-description">
                Meta description
              </label>
              <textarea
                id="seo-meta-description"
                rows={4}
                value={resolvedMetaDescription}
                onChange={(e) =>
                  updateSeoField('metaDescription', e.target.value.slice(0, META_DESCRIPTION_MAX))
                }
                placeholder="Brief description for search engines"
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                {resolvedMetaDescription.length} of {META_DESCRIPTION_MAX} characters used
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Social sharing image</label>
              <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center">
                {resolvedSocialImageUrl.trim() ? (
                  <div className="w-full space-y-3">
                    <img
                      src={resolvedSocialImageUrl.trim()}
                      alt="Social sharing preview"
                      className="max-h-36 w-full rounded-lg object-cover"
                    />
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setImagePickerOpen(true)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Change image
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSeoField('socialImageUrl', '')}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setImagePickerOpen(true)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      Add image
                    </button>
                    <p className="mt-2 text-xs text-gray-500">Recommended: 1200 x 628 px</p>
                  </>
                )}
              </div>
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
              {resolvedSocialImageUrl.trim() ? (
                <img
                  src={resolvedSocialImageUrl.trim()}
                  alt="Social sharing preview"
                  className="max-h-40 w-full rounded-lg object-cover"
                />
              ) : (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <PhotoIcon className="h-6 w-6 text-gray-400" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Social sharing image</p>
                  <p className="mt-0.5 text-xs text-gray-500">Choose an image from your store files</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <SelectImageModal
        open={imagePickerOpen}
        initialUrl={resolvedSocialImageUrl}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelected}
      />

      <section className="rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-4 text-sm text-blue-900">
        Product and collection SEO is edited on each product or collection page. The storefront runtime
        applies these settings automatically when customers visit your store.
      </section>
    </div>
  );
}
