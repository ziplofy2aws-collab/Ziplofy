import React from 'react';
import ProductDescriptionInput from '../products/ProductDescriptionInput';
import {
  productFormCardClass,
  productFormInputClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';
import { COLLECTION_FORM_APPEARANCE } from './collection-form.types';

type CollectionBasicInfoSectionProps = {
  title: string;
  description: string;
  titleInputId?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

const CollectionBasicInfoSection: React.FC<CollectionBasicInfoSectionProps> = ({
  title,
  description,
  titleInputId = 'collection-title',
  onTitleChange,
  onDescriptionChange,
}) => {
  const appearance = COLLECTION_FORM_APPEARANCE;

  return (
    <section className={productFormCardClass(appearance)}>
      <h2 className={productFormSectionTitleClass(appearance)}>Title</h2>
      <div className="space-y-4">
        <input
          id={titleInputId}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className={productFormInputClass(appearance)}
          placeholder="e.g. Summer sale"
        />
        <ProductDescriptionInput
          value={description}
          onChange={onDescriptionChange}
          placeholder="Description"
        />
      </div>
    </section>
  );
};

export default CollectionBasicInfoSection;
