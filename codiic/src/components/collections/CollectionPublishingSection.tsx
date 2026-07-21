import React from 'react';
import {
  productFormCardClass,
  productFormInputClass,
  productFormLabelClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';
import { COLLECTION_FORM_APPEARANCE } from './collection-form.types';

type CollectionPublishingSectionProps = {
  status: 'draft' | 'published';
  onStatusChange: (status: 'draft' | 'published') => void;
};

const CollectionPublishingSection: React.FC<CollectionPublishingSectionProps> = ({
  status,
  onStatusChange,
}) => {
  const appearance = COLLECTION_FORM_APPEARANCE;

  return (
    <section className={productFormCardClass(appearance)}>
      <h2 className={productFormSectionTitleClass(appearance)}>Publishing</h2>
      <div>
        <label htmlFor="collection-status" className={productFormLabelClass(appearance)}>
          Status
        </label>
        <select
          id="collection-status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'draft' | 'published')}
          className={`${productFormInputClass(appearance)} cursor-pointer`}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
    </section>
  );
};

export default CollectionPublishingSection;
