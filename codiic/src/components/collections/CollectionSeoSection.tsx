import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React from 'react';
import {
  productFormCardClass,
  productFormHelperTextClass,
  productFormInputClass,
  productFormLabelClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';
import { COLLECTION_FORM_APPEARANCE } from './collection-form.types';

type CollectionSeoSectionProps = {
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onPageTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onUrlHandleChange: (value: string) => void;
};

const CollectionSeoSection: React.FC<CollectionSeoSectionProps> = ({
  pageTitle,
  metaDescription,
  urlHandle,
  expanded,
  onToggleExpanded,
  onPageTitleChange,
  onMetaDescriptionChange,
  onUrlHandleChange,
}) => {
  const appearance = COLLECTION_FORM_APPEARANCE;

  return (
    <section className={productFormCardClass(appearance)}>
      <button
        type="button"
        onClick={onToggleExpanded}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <h2 className={productFormSectionTitleClass(appearance)}>Search engine listing</h2>
        {expanded ? (
          <ChevronUpIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        ) : (
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        )}
      </button>

      {expanded ? (
        <div className="mt-4 space-y-4 border-t border-gray-100/80 pt-4">
          <div>
            <label htmlFor="collection-page-title" className={productFormLabelClass(appearance)}>
              Page title
            </label>
            <input
              id="collection-page-title"
              type="text"
              maxLength={70}
              value={pageTitle}
              onChange={(e) => onPageTitleChange(e.target.value)}
              className={productFormInputClass(appearance)}
            />
            <p className={productFormHelperTextClass(appearance)}>
              {pageTitle.length} of 70 characters used
            </p>
          </div>
          <div>
            <label htmlFor="collection-meta-description" className={productFormLabelClass(appearance)}>
              Meta description
            </label>
            <textarea
              id="collection-meta-description"
              maxLength={160}
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              rows={3}
              className={`${productFormInputClass(appearance)} resize-none`}
            />
            <p className={productFormHelperTextClass(appearance)}>
              {metaDescription.length} of 160 characters used
            </p>
          </div>
          <div>
            <label htmlFor="collection-url-handle" className={productFormLabelClass(appearance)}>
              URL handle
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-400">
                collections/
              </span>
              <input
                id="collection-url-handle"
                type="text"
                value={urlHandle}
                onChange={(e) => onUrlHandleChange(e.target.value)}
                className={`${productFormInputClass(appearance)} pl-[5.5rem]`}
              />
            </div>
            <p className={productFormHelperTextClass(appearance)}>
              https://your-store.com/collections/{urlHandle || '…'}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CollectionSeoSection;
