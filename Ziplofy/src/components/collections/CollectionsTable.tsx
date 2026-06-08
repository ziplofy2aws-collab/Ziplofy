import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Collection } from '../../contexts/collection.context';
import CollectionsTableItem from './CollectionsTableItem';

type SortOrder = 'asc' | 'desc';

interface CollectionsTableProps {
  collections: Collection[];
  onCollectionClick: (collectionId: string) => void;
  sortOrder?: SortOrder;
  onSortToggle?: () => void;
}

const CollectionsTable: React.FC<CollectionsTableProps> = ({
  collections,
  onCollectionClick,
  sortOrder,
  onSortToggle
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const visibleIds = useMemo(() => collections.map((c) => c._id), [collections]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const handleSelectRow = (collectionId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(collectionId);
      else next.delete(collectionId);
      return next;
    });
  };

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        visibleIds.forEach((id) => next.add(id));
      } else {
        visibleIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="w-12 px-3 py-3 text-center">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(e) => handleSelectAllVisible(e.target.checked)}
                  aria-label="Select all collections"
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/40"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                Page Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                URL Handle
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                {onSortToggle ? (
                  <button
                    onClick={onSortToggle}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Updated
                    {sortOrder && (
                      <span className="inline-flex items-center">
                        {sortOrder === 'asc' ? (
                          <ArrowUpIcon className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownIcon className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </button>
                ) : (
                  <span>Updated</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {collections.map((collection) => (
              <CollectionsTableItem
                key={collection._id}
                collection={collection}
                isSelected={selectedIds.has(collection._id)}
                onSelect={handleSelectRow}
                onClick={onCollectionClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollectionsTable;

