import React from 'react';
import ProductTypeItem from './ProductTypeItem';

interface Tag {
  _id: string;
  name: string;
}

interface ProductTypesListProps {
  tags: Tag[];
  loading: boolean;
  onDeleteClick: (tag: Tag) => void;
}

const ProductTypesList: React.FC<ProductTypesListProps> = ({
  tags,
  loading,
  onDeleteClick,
}) => {
  if (loading) {
    return (
      <div className="px-5 py-14 text-center text-sm text-gray-500 sm:px-6">Loading types…</div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="px-5 py-14 text-center sm:px-6">
        <p className="text-sm font-medium text-gray-900">No product types yet</p>
        <p className="mt-1 text-sm text-gray-500">Add a type above to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th className="px-5 py-3 sm:px-6">Type name</th>
            <th className="w-24 px-4 py-3 text-right" aria-label="Actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tags.map((tag) => (
            <ProductTypeItem key={tag._id} tag={tag} onDeleteClick={onDeleteClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTypesList;
