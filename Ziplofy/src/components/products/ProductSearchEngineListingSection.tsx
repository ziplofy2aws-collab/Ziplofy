import React from "react";
import { SearchEngineListingEditor } from "../../seo/SearchEngineListingEditor";

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
    />
  );
};

export default ProductSearchEngineListingSection;
