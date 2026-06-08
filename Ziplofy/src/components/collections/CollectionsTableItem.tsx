import React, { useCallback } from 'react';
import type { Collection } from '../../contexts/collection.context';

interface CollectionsTableItemProps {
  collection: Collection;
  isSelected?: boolean;
  onSelect?: (collectionId: string, checked: boolean) => void;
  onClick: (collectionId: string) => void;
}

const CollectionsTableItem: React.FC<CollectionsTableItemProps> = ({
  collection,
  isSelected,
  onSelect,
  onClick
}) => {
  const handleClick = useCallback(() => {
    onClick(collection._id);
  }, [onClick, collection._id]);

  return (
    <tr
      onClick={handleClick}
      className={`cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50/60' : 'hover:bg-blue-50/50'
      }`}
    >
      <td
        className="w-12 px-3 py-3 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={Boolean(isSelected)}
          onChange={(e) => onSelect?.(collection._id, e.target.checked)}
          aria-label={`Select collection ${collection.title}`}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/40"
        />
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        {collection.title}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {collection.pageTitle}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {collection.urlHandle}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${
          collection.status === 'active'
            ? 'bg-green-50 text-green-700 border-green-200/80'
            : 'bg-gray-100 text-gray-600 border-gray-200/80'
        }`}>
          {collection.status}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {new Date(collection.updatedAt).toLocaleDateString()}
      </td>
    </tr>
  );
};

export default CollectionsTableItem;

