import { TagIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { tagDeleteButtonClass, tagIconBubbleClass, tagTableRowClass } from './tag-management-ui';

interface Tag {
  _id: string;
  name: string;
}

interface ProductTagItemProps {
  tag: Tag;
  onDeleteClick: (tag: Tag) => void;
}

const ProductTagItem: React.FC<ProductTagItemProps> = ({ tag, onDeleteClick }) => {
  return (
    <tr className={tagTableRowClass}>
      <td className="px-5 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className={tagIconBubbleClass}>
            <TagIcon className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-[13px] font-medium text-admin-text">{tag.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onDeleteClick(tag)}
          className={tagDeleteButtonClass}
          aria-label={`Delete tag ${tag.name}`}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

export default ProductTagItem;
