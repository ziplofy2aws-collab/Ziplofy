import { PencilIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useMemo, useState } from 'react';
import { normalizeStorefrontPathHandle } from '../utils/storefront-url.util';
import {
  META_DESCRIPTION_MAX,
  PAGE_TITLE_MAX,
  plainTextFromHtml,
  sanitizeUrlHandle,
  slugFromTitle,
  truncateSeoText,
} from './seo-text.util';

export type SearchEngineListingEditorProps = {
  entityTitle: string;
  entityDescription?: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  urlPrefix: string;
  urlOrigin?: string;
  fallbackSlug?: string;
  pageTitleMax?: number;
  metaDescriptionMax?: number;
  onPageTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onUrlHandleChange: (value: string) => void;
  className?: string;
  compact?: boolean;
};

export function SearchEngineListingEditor({
  entityTitle,
  entityDescription = '',
  pageTitle,
  metaDescription,
  urlHandle,
  urlPrefix,
  urlOrigin,
  fallbackSlug = 'page',
  pageTitleMax = PAGE_TITLE_MAX,
  metaDescriptionMax = META_DESCRIPTION_MAX,
  onPageTitleChange,
  onMetaDescriptionChange,
  onUrlHandleChange,
  className = '',
  compact = false,
}: SearchEngineListingEditorProps) {
  const [editing, setEditing] = useState(false);

  const plainDescription = useMemo(
    () => plainTextFromHtml(entityDescription),
    [entityDescription]
  );

  const previewTitle = useMemo(() => {
    const custom = pageTitle.trim();
    if (custom) return truncateSeoText(custom, pageTitleMax);
    const title = entityTitle.trim();
    return title ? truncateSeoText(title, pageTitleMax) : '';
  }, [pageTitle, entityTitle, pageTitleMax]);

  const previewSnippet = useMemo(() => {
    const meta = metaDescription.trim();
    if (meta) return truncateSeoText(meta, metaDescriptionMax);
    return plainDescription ? truncateSeoText(plainDescription, metaDescriptionMax) : '';
  }, [metaDescription, plainDescription, metaDescriptionMax]);

  const handleSlug = useMemo(() => {
    const handle = urlHandle.trim();
    if (handle) return normalizeStorefrontPathHandle(handle);
    return slugFromTitle(entityTitle, fallbackSlug);
  }, [urlHandle, entityTitle, fallbackSlug]);

  const baseOrigin =
    urlOrigin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const fullUrlPreview = `${baseOrigin.replace(/\/+$/, '')}/${urlPrefix.replace(/^\/+|\/+$/g, '')}/${handleSlug}`;

  const listingEmpty =
    !entityTitle.trim() &&
    !plainDescription &&
    !pageTitle.trim() &&
    !metaDescription.trim() &&
    !urlHandle.trim();

  const handlePageTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPageTitleChange(e.target.value.slice(0, pageTitleMax));
    },
    [onPageTitleChange, pageTitleMax]
  );

  const handleMetaDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onMetaDescriptionChange(e.target.value.slice(0, metaDescriptionMax));
    },
    [onMetaDescriptionChange, metaDescriptionMax]
  );

  const handleUrlHandleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUrlHandleChange(sanitizeUrlHandle(e.target.value));
    },
    [onUrlHandleChange]
  );

  return (
    <div
      className={
        compact
          ? `rounded-lg border border-gray-200/80 bg-white shadow-sm ${className}`.trim()
          : `rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm ${className}`.trim()
      }
    >
      <div
        className={
          compact
            ? 'flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-2.5'
            : 'flex items-start justify-between gap-3'
        }
      >
        <h2
          className={
            compact
              ? 'text-[13px] font-medium text-gray-800'
              : 'text-base font-semibold text-gray-900'
          }
        >
          Search engine listing
        </h2>
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          className={
            compact
              ? 'rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600'
              : 'rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800'
          }
          aria-expanded={editing}
          aria-label={editing ? 'Close search listing editor' : 'Edit search listing'}
        >
          <PencilIcon className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
        </button>
      </div>

      {!editing ? (
        <div className={compact ? 'p-4' : 'mt-4'}>
          {listingEmpty ? (
            <p className={compact ? 'text-[13px] font-normal text-gray-500' : 'text-sm text-gray-600'}>
              Add a title and description to see how this page might appear in a search engine listing.
            </p>
          ) : (
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-4">
              <p className="mb-3 cursor-default text-lg font-normal leading-snug text-blue-700 hover:underline">
                {previewTitle || entityTitle.trim() || 'Page title'}
              </p>
              <p className="mb-2 truncate text-sm text-emerald-800">{fullUrlPreview}</p>
              <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                {previewSnippet || 'Add a meta description to show a snippet here.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={compact ? 'space-y-4 p-4' : 'mt-4 space-y-5'}>
          <p className={compact ? 'text-[13px] font-normal text-gray-500' : 'text-sm text-gray-600'}>
            Add a title and description to see how this page might appear in a search engine listing.
          </p>
          <div className="border-t border-gray-200" />

          <div>
            <label
              className={
                compact
                  ? 'mb-1 block text-xs font-normal text-gray-500'
                  : 'mb-2 block text-sm font-medium text-gray-700'
              }
            >
              Page title
            </label>
            <input
              type="text"
              value={pageTitle}
              onChange={handlePageTitleChange}
              placeholder={entityTitle.trim() || 'Page title'}
              maxLength={pageTitleMax}
              className={
                compact
                  ? 'w-full rounded-md border border-gray-200 px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200'
                  : 'w-full rounded-lg border border-gray-200 px-3 py-2 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400'
              }
            />
            <p className={compact ? 'mt-1 text-[12px] text-gray-400' : 'mt-1.5 text-sm text-gray-500'}>
              {pageTitle.length} of {pageTitleMax} characters used
            </p>
          </div>

          <div>
            <label
              className={
                compact
                  ? 'mb-1 block text-xs font-normal text-gray-500'
                  : 'mb-2 block text-sm font-medium text-gray-700'
              }
            >
              Meta description
            </label>
            <textarea
              value={metaDescription}
              onChange={handleMetaDescriptionChange}
              placeholder="Enter meta description"
              maxLength={metaDescriptionMax}
              rows={3}
              className={
                compact
                  ? 'w-full resize-none rounded-md border border-gray-200 px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200'
                  : 'w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400'
              }
            />
            <p className={compact ? 'mt-1 text-[12px] text-gray-400' : 'mt-1.5 text-sm text-gray-500'}>
              {metaDescription.length} of {metaDescriptionMax} characters used
            </p>
          </div>

          <div>
            <label
              className={
                compact
                  ? 'mb-1 block text-xs font-normal text-gray-500'
                  : 'mb-2 block text-sm font-medium text-gray-700'
              }
            >
              URL handle
            </label>
            <div className="relative">
              <span
                className={
                  compact
                    ? 'pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[13px] text-gray-400'
                    : 'pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base text-gray-500'
                }
              >
                {urlPrefix.replace(/^\/+|\/+$/g, '')}/
              </span>
              <input
                type="text"
                value={urlHandle}
                onChange={handleUrlHandleChange}
                placeholder={slugFromTitle(entityTitle, fallbackSlug)}
                className={
                  compact
                    ? 'w-full rounded-md border border-gray-200 py-1.5 pl-22 pr-3 text-[13px] font-normal text-gray-700 transition-colors focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200'
                    : 'w-full rounded-lg border border-gray-200 py-2 pl-24 pr-3 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400'
                }
              />
            </div>
            <p className={compact ? 'mt-1.5 break-all text-[12px] text-gray-400' : 'mt-2 break-all text-sm text-gray-500'}>
              {fullUrlPreview}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
