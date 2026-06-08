import React from 'react';
import CustomerNotesSection from './CustomerNotesSection';
import CustomerTagsSection from './CustomerTagsSection';
import type { CustomerTag } from '../../contexts/customer-tags.context';

interface AdditionalInformationSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  selectedTagIds: string[];
  customerTags: CustomerTag[];
  onTagSelect: (tagId: string) => void;
  onTagRemove: (tagId: string) => void;
  onCreateTag: (name: string) => Promise<void>;
  activeStoreId?: string;
}

const AdditionalInformationSection: React.FC<AdditionalInformationSectionProps> = ({
  notes,
  onNotesChange,
  selectedTagIds,
  customerTags,
  onTagSelect,
  onTagRemove,
  onCreateTag,
  activeStoreId,
}) => {
  return (
    <div className="mb-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h2>
      
      <div className="space-y-6">
        <CustomerNotesSection notes={notes} onChange={onNotesChange} />
        <CustomerTagsSection
          selectedTagIds={selectedTagIds}
          customerTags={customerTags}
          onTagSelect={onTagSelect}
          onTagRemove={onTagRemove}
          onCreateTag={onCreateTag}
          activeStoreId={activeStoreId}
        />
      </div>
    </div>
  );
};

export default AdditionalInformationSection;

