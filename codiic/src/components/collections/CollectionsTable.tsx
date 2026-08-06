import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Collection } from "../../contexts/collection.context";
import {
  adminListTableHeadClass,
  adminListTableHeadRightClass,
  adminListTableHeadRowClass,
} from "../admin-list-ui";
import CollectionsTableItem from "./CollectionsTableItem";
import { CollectionsTableSkeletonRows } from "./CollectionsTableSkeleton";

interface CollectionsTableProps {
  collections: Collection[];
  loading?: boolean;
  onCollectionClick: (collectionId: string) => void;
}

const CollectionsTable: React.FC<CollectionsTableProps> = ({
  collections,
  loading = false,
  onCollectionClick,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const visibleIds = useMemo(() => collections.map((collection) => collection._id), [collections]);
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
    <div className="overflow-x-auto bg-admin-surface">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className={adminListTableHeadRowClass}>
            <th className="w-10 px-3 py-2 text-center">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                disabled={loading}
                aria-label="Select all collections"
                className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </th>
            <th className={adminListTableHeadClass}>Title</th>
            <th className={adminListTableHeadRightClass}>Products</th>
            <th className={adminListTableHeadRightClass}>Product conditions</th>
          </tr>
        </thead>
        <tbody className="bg-admin-surface">
          {loading ? (
            <CollectionsTableSkeletonRows />
          ) : collections.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-admin-text">No collections found</p>
                <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
                  Try changing the filters or search term
                </p>
              </td>
            </tr>
          ) : (
            collections.map((collection) => (
              <CollectionsTableItem
                key={collection._id}
                collection={collection}
                isSelected={selectedIds.has(collection._id)}
                onSelect={handleSelectRow}
                onClick={onCollectionClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CollectionsTable;
