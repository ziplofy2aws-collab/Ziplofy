import React from 'react';
import CategoryItem from './CategoryItem';

interface Category {
  _id: string;
  name: string;
  hasChildren?: boolean;
}

interface CategoryListProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onCategorySelect }) => {
  return (
    <div className="divide-y divide-gray-200">
      {categories.map((category) => (
        <CategoryItem
          key={category._id}
          category={category}
          onSelect={onCategorySelect}
        />
      ))}
    </div>
  );
};

export default CategoryList;

