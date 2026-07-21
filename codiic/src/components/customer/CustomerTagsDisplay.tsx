import React from 'react';
import type { CustomerTag } from '../../contexts/customer.context';

interface CustomerTagsDisplayProps {
  tags: CustomerTag[] | [];
}

const CustomerTagsDisplay: React.FC<CustomerTagsDisplayProps> = ({ tags }) => {
  return (
    <div className="pt-3 border-t border-gray-200">
      <h3 className="text-xs text-gray-600 mb-2">Tags</h3>
      <div className="flex flex-wrap gap-1.5">
        {Array.isArray(tags) && tags.length > 0 ? (
          (tags as any[]).map((t: any) => (
            <span
              key={t._id || t}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {t.name || t}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500">No tags</span>
        )}
      </div>
    </div>
  );
};

export default CustomerTagsDisplay;

