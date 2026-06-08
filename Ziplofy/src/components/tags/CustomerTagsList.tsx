import React from 'react';
import CustomerTagItem from './CustomerTagItem';

interface Tag {
  _id: string;
  name: string;
}

interface CustomerTagsListProps {
  tags: Tag[];
  loading: boolean;
  onDeleteClick: (tag: Tag) => void;
}

const CustomerTagsList: React.FC<CustomerTagsListProps> = ({
  tags,
  loading,
  onDeleteClick,
}) => {
  if (loading) {
    return (
      <div className="px-5 py-14 text-center text-sm text-gray-500 sm:px-6">Loading tags…</div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="px-5 py-14 text-center sm:px-6">
        <p className="text-sm font-medium text-gray-900">No tags yet</p>
        <p className="mt-1 text-sm text-gray-500">Add a tag above to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th className="px-5 py-3 sm:px-6">Tag name</th>
            <th className="w-24 px-4 py-3 text-right" aria-label="Actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tags.map((tag) => (
            <CustomerTagItem key={tag._id} tag={tag} onDeleteClick={onDeleteClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTagsList;

