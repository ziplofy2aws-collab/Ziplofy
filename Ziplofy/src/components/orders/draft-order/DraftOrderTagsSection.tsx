import { PencilIcon } from '@heroicons/react/24/outline';
import React from 'react';
import DraftOrderCard from './DraftOrderCard';

type DraftOrderTagsSectionProps = {
  tags: string;
  onTagsChange: (value: string) => void;
};

const DraftOrderTagsSection: React.FC<DraftOrderTagsSectionProps> = ({ tags, onTagsChange }) => {
  return (
    <DraftOrderCard
      title="Tags"
      headerAction={
        <PencilIcon className="h-4 w-4 text-gray-400" aria-hidden />
      }
      bodyClassName="px-4 py-3"
    >
      <input
        type="text"
        value={tags}
        onChange={(e) => onTagsChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
        aria-label="Order tags"
      />
    </DraftOrderCard>
  );
};

export default DraftOrderTagsSection;
