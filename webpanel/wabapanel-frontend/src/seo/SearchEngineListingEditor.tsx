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
  /** Nest inside another chrome (e.g. collapsible) — no outer card / title. */
  embedded?: boolean;
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
  embedded = false,
}: SearchEngineListingEditorProps) {
  const [editing, setEditing] = useState(embedded);

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

  const compactFieldClass =
    'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-normal text-admin-text transition-colors placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
  const defaultFieldClass =
    'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-base text-admin-text transition-colors placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
  const compactLabelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';
  const defaultLabelClass = 'mb-2 block text-sm font-medium text-admin-text';

  return (
    <div
      className={
        embedded
          ? className.trim()
          : compact
            ? `overflow-hidden rounded-xl border border-admin-border bg-admin-surface ${className}`.trim()
            : `rounded-xl border border-admin-border bg-admin-surface p-6 ${className}`.trim()
      }
    >
      {embedded ? null : (
        <div
          className={
            compact
              ? 'flex items-start justify-between gap-3 border-b border-admin-divider bg-admin-table-header px-4 py-2.5'
              : 'flex items-start justify-between gap-3'
          }
        >
          <h2
            className={
              compact
                ? 'text-[13px] font-semibold text-admin-text'
                : 'text-base font-semibold text-admin-text'
            }
          >
            Search engine listing
          </h2>
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className={
              compact
                ? 'rounded-lg p-1 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text'
                : 'rounded-lg p-2 text-admin-text-secondary transition-colors hover:bg-admin-row-hover hover:text-admin-text'
            }
            aria-expanded={editing}
            aria-label={editing ? 'Close search listing editor' : 'Edit search listing'}
          >
            <PencilIcon className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
          </button>
        </div>
      )}

      {!editing ? (
        <div className={compact ? 'p-4' : 'mt-4'}>
          {listingEmpty ? (
            <p className={compact ? 'text-[13px] text-admin-text-secondary' : 'text-sm text-admin-text-secondary'}>
              Add a title and description to see how this page might appear in a search engine listing.
            </p>
          ) : (
            <div className="rounded-lg border border-admin-border bg-admin-secondary px-4 py-4">
              <p className="mb-3 cursor-default text-lg font-normal leading-snug text-[#005bd3] hover:underline">
                {previewTitle || entityTitle.trim() || 'Page title'}
              </p>
              <p className="mb-2 truncate text-sm text-[#0c5132]">{fullUrlPreview}</p>
              <p className="line-clamp-2 text-sm leading-relaxed text-admin-text-secondary">
                {previewSnippet || 'Add a meta description to show a snippet here.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={compact ? 'space-y-4 p-4' : 'mt-4 space-y-5'}>
          <p className={compact ? 'text-[13px] text-admin-text-secondary' : 'text-sm text-admin-text-secondary'}>
            Add a title and description to see how this page might appear in a search engine listing.
          </p>
          <div className="border-t border-admin-divider" />

          <div>
            <label className={compact ? compactLabelClass : defaultLabelClass}>Page title</label>
            <input
              type="text"
              value={pageTitle}
              onChange={handlePageTitleChange}
              placeholder={entityTitle.trim() || 'Page title'}
              maxLength={pageTitleMax}
              className={compact ? compactFieldClass : defaultFieldClass}
            />
            <p className={compact ? 'mt-1 text-[12px] text-admin-text-subdued' : 'mt-1.5 text-sm text-admin-text-secondary'}>
              {pageTitle.length} of {pageTitleMax} characters used
            </p>
          </div>

          <div>
            <label className={compact ? compactLabelClass : defaultLabelClass}>Meta description</label>
            <textarea
              value={metaDescription}
              onChange={handleMetaDescriptionChange}
              placeholder="Enter meta description"
              maxLength={metaDescriptionMax}
              rows={3}
              className={
                compact
                  ? `${compactFieldClass} resize-none`
                  : `${defaultFieldClass} resize-none`
              }
            />
            <p className={compact ? 'mt-1 text-[12px] text-admin-text-subdued' : 'mt-1.5 text-sm text-admin-text-secondary'}>
              {metaDescription.length} of {metaDescriptionMax} characters used
            </p>
          </div>

          <div>
            <label className={compact ? compactLabelClass : defaultLabelClass}>URL handle</label>
            <div className="relative">
              <span
                className={
                  compact
                    ? 'pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[13px] text-admin-text-subdued'
                    : 'pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base text-admin-text-secondary'
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
                    ? 'w-full rounded-lg border border-admin-border bg-admin-surface py-1.5 pl-22 pr-3 text-[13px] font-normal text-admin-text transition-colors focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30'
                    : 'w-full rounded-lg border border-admin-border bg-admin-surface py-2 pl-24 pr-3 text-base text-admin-text transition-colors focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30'
                }
              />
            </div>
            <p
              className={
                compact
                  ? 'mt-1.5 break-all text-[12px] text-admin-text-subdued'
                  : 'mt-2 break-all text-sm text-admin-text-secondary'
              }
            >
              {fullUrlPreview}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
