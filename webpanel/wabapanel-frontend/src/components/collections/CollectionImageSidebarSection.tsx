import React from 'react';
import {
  productFormCardClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';
import CollectionCoverImageField from './CollectionCoverImageField';
import { COLLECTION_FORM_APPEARANCE } from './collection-form.types';

type CollectionImageSidebarSectionProps = {
  imageUrl: string;
  imageAlt: string;
  onImageUrlChange: (url: string) => void;
  onEditAltText?: () => void;
};

const CollectionImageSidebarSection: React.FC<CollectionImageSidebarSectionProps> = ({
  imageUrl,
  imageAlt,
  onImageUrlChange,
  onEditAltText,
}) => {
  const appearance = COLLECTION_FORM_APPEARANCE;

  return (
    <section className={productFormCardClass(appearance)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className={productFormSectionTitleClass(appearance)}>Image</h2>
        {imageUrl && onEditAltText ? (
          <button
            type="button"
            onClick={onEditAltText}
            className="text-[12px] font-normal text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
          >
            Edit alt text
          </button>
        ) : null}
      </div>
      <CollectionCoverImageField
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        onImageUrlChange={onImageUrlChange}
        compact
      />
    </section>
  );
};

export default CollectionImageSidebarSection;
