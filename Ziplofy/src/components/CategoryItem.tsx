import { ArrowRightIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

interface Category {
  _id: string;
  name: string;
  hasChildren?: boolean;
}

interface CategoryItemProps {
  category: Category;
  onSelect: (category: Category) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(category);
  }, [category, onSelect]);

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">
          {category.name}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {category.hasChildren ? 'Has subcategories' : 'Select this category'}
        </div>
      </div>
      {category.hasChildren && (
        <ArrowRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
      )}
    </button>
  );
};

export default CategoryItem;

