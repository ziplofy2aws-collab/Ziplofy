import React from 'react';
import MultiSelect from '../MultiSelect';
import {
  productFormCardClass,
  productFormInputClass,
  productFormLabelClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';
import { PO_FORM_APPEARANCE } from './purchase-order-ui.util';

interface SelectOption {
  value: string;
  label: string;
}

interface AdditionalDetailsSectionProps {
  reference: string;
  onReferenceChange: (value: string) => void;
  tagIds: string[];
  onTagIdsChange: (value: string[]) => void;
  note: string;
  onNoteChange: (value: string) => void;
  tagOptions: SelectOption[];
  tagsLoading: boolean;
}

const AdditionalDetailsSection: React.FC<AdditionalDetailsSectionProps> = ({
  reference,
  onReferenceChange,
  tagIds,
  onTagIdsChange,
  note,
  onNoteChange,
  tagOptions,
  tagsLoading,
}) => {
  return (
    <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
      <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Additional details</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className={productFormLabelClass(PO_FORM_APPEARANCE)} htmlFor="po-reference">
            Reference number
          </label>
          <input
            id="po-reference"
            type="text"
            value={reference}
            onChange={(e) => onReferenceChange(e.target.value)}
            className={productFormInputClass(PO_FORM_APPEARANCE)}
          />
        </div>
        <div>
          <MultiSelect
            label="Tags"
            value={tagIds}
            options={tagOptions}
            onChange={onTagIdsChange}
            placeholder={tagsLoading ? 'Loading…' : 'Select tags'}
            disabled={tagsLoading && tagOptions.length === 0}
          />
        </div>
      </div>
      <div className="mt-3">
        <label className={productFormLabelClass(PO_FORM_APPEARANCE)} htmlFor="po-note">
          Note to supplier
        </label>
        <textarea
          id="po-note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
          className={`${productFormInputClass(PO_FORM_APPEARANCE)} resize-y`}
        />
      </div>
    </section>
  );
};

export default AdditionalDetailsSection;
