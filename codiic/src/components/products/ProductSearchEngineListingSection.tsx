import React from "react";
import { SearchEngineListingEditor } from "../../seo/SearchEngineListingEditor";
import type { ProductFormAppearance } from "./product-form-appearance";

interface ProductSearchEngineListingSectionProps {
  productTitle: string;
  productDescription: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  onPageTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onUrlHandleChange: (value: string) => void;
  appearance?: ProductFormAppearance;
  embedded?: boolean;
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
  appearance = 'default',
  embedded = false,
}) => {
  return (
    <SearchEngineListingEditor
      entityTitle={productTitle}
      entityDescription={productDescription}
      pageTitle={pageTitle}
      metaDescription={metaDescription}
      urlHandle={urlHandle}
      urlPrefix="products"
      fallbackSlug="product"
      onPageTitleChange={onPageTitleChange}
      onMetaDescriptionChange={onMetaDescriptionChange}
      onUrlHandleChange={onUrlHandleChange}
      compact={appearance === 'minimal'}
      embedded={embedded}
      className={
        embedded
          ? ''
          : appearance === 'minimal'
            ? 'border-gray-200/50 shadow-none'
            : ''
      }
    />
  );
};

export default ProductSearchEngineListingSection;
