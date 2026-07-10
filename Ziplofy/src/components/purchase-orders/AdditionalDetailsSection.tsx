import React from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';
import MultiSelect from '../MultiSelect';

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
    <div className="border border-gray-200 p-4 bg-white/95">
      <h2 className="text-base font-medium text-gray-900 mb-3">Additional details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1.5">
            Reference number
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => onReferenceChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
        <div className="flex-1">
          <MultiSelect
            label="Tags"
            value={tagIds}
            options={tagOptions}
            onChange={onTagIdsChange}
            placeholder={tagsLoading ? 'Loading…' : 'No tags'}
            disabled={tagsLoading && tagOptions.length === 0}
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-xs text-gray-600 mb-1.5">
          Note to supplier
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
    </div>
  );
};

export default AdditionalDetailsSection;

