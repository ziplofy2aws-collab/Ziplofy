import { PencilIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useMemo, useState } from "react";

const PAGE_TITLE_MAX = 70;
const META_DESC_MAX = 160;

interface ProductSearchEngineListingSectionProps {
  productTitle: string;
  productDescription: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  onPageTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onUrlHandleChange: (value: string) => void;
}

function stripHtml(html: string): string {
  if (!html.trim()) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromTitle(title: string): string {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "product";
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

const ProductSearchEngineListingSection: React.FC<
  ProductSearchEngineListingSectionProps
> = ({
  productTitle,
  productDescription,
  pageTitle,
  metaDescription,
  urlHandle,
  onPageTitleChange,
  onMetaDescriptionChange,
  onUrlHandleChange,
}) => {
  const [editing, setEditing] = useState(false);

  const plainDescription = useMemo(
    () => stripHtml(productDescription),
    [productDescription]
  );

  const previewTitle = useMemo(() => {
    const custom = pageTitle.trim();
    if (custom) return truncate(custom, PAGE_TITLE_MAX);
    const t = productTitle.trim();
    return t ? truncate(t, PAGE_TITLE_MAX) : "";
  }, [pageTitle, productTitle]);

  const previewSnippet = useMemo(() => {
    const meta = metaDescription.trim();
    if (meta) return truncate(meta, META_DESC_MAX);
    const d = plainDescription;
    return d ? truncate(d, META_DESC_MAX) : "";
  }, [metaDescription, plainDescription]);

  const handleSlug = useMemo(() => {
    const h = urlHandle.trim();
    if (h) return h;
    return slugFromTitle(productTitle);
  }, [urlHandle, productTitle]);

  const baseOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const fullUrlPreview = `${baseOrigin}/products/${handleSlug}`;

  const listingEmpty =
    !productTitle.trim() &&
    !plainDescription &&
    !pageTitle.trim() &&
    !metaDescription.trim() &&
    !urlHandle.trim();

  const handlePageTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.slice(0, PAGE_TITLE_MAX);
      onPageTitleChange(v);
    },
    [onPageTitleChange]
  );

  const handleMetaDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value.slice(0, META_DESC_MAX);
      onMetaDescriptionChange(v);
    },
    [onMetaDescriptionChange]
  );

  const handleUrlHandleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const v = raw
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");
      onUrlHandleChange(v);
    },
    [onUrlHandleChange]
  );

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">
          Search engine listing
        </h2>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          aria-expanded={editing}
          aria-label={editing ? "Close search listing editor" : "Edit search listing"}
        >
          <PencilIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {!editing ? (
        <div className="mt-4">
          {listingEmpty ? (
            <p className="text-sm text-gray-600">
              Add a title and description to see how this product might appear
              in a search engine listing
            </p>
          ) : (
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-4">
              <p className="mb-3 cursor-default text-lg font-normal leading-snug text-blue-700 hover:underline">
                {previewTitle || productTitle.trim() || "Product title"}
              </p>
              <p className="mb-2 truncate text-sm text-emerald-800">
                {fullUrlPreview}
              </p>
              <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                {previewSnippet ||
                  "Add a meta description or product description to show a snippet here."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Add a title and description to see how this product might appear in
            a search engine listing
          </p>

          <div className="my-4 border-t border-gray-200" />

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Page title
              </label>
              <input
                type="text"
                value={pageTitle}
                onChange={handlePageTitleChange}
                placeholder={productTitle.trim() || "Page title"}
                maxLength={PAGE_TITLE_MAX}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <p className="mt-1.5 text-sm text-gray-500">
                {pageTitle.length} of {PAGE_TITLE_MAX} characters used
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Meta description
              </label>
              <textarea
                value={metaDescription}
                onChange={handleMetaDescriptionChange}
                placeholder="Enter meta description"
                maxLength={META_DESC_MAX}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <p className="mt-1.5 text-sm text-gray-500">
                {metaDescription.length} of {META_DESC_MAX} characters used
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                URL handle
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base text-gray-500">
                  products/
                </span>
                <input
                  type="text"
                  value={urlHandle}
                  onChange={handleUrlHandleChange}
                  placeholder={slugFromTitle(productTitle)}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-20 pr-3 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <p className="mt-2 break-all text-sm text-gray-500">
                {fullUrlPreview || `${baseOrigin}/products/`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearchEngineListingSection;
