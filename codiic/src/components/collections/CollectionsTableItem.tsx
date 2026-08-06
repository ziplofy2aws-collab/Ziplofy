import { PhotoIcon } from "@heroicons/react/24/outline";
import React, { useCallback } from "react";
import type { Collection } from "../../contexts/collection.context";
import { adminListTableCellRightClass } from "../admin-list-ui";

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
  onClick,
}) => {
  const handleClick = useCallback(() => {
    onClick(collection._id);
  }, [onClick, collection._id]);

  const subtitle =
    collection.status === "draft" ? "Draft" : undefined;

  return (
    <tr
      onClick={handleClick}
      className={`group cursor-pointer border-b border-admin-divider transition-colors last:border-b-0 ${
        isSelected ? "bg-admin-row-hover" : "bg-admin-surface hover:bg-admin-row-hover"
      }`}
    >
      <td
        className="w-10 px-3 py-2.5 text-center align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={Boolean(isSelected)}
          onChange={(e) => onSelect?.(collection._id, e.target.checked)}
          aria-label={`Select collection ${collection.title}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
        />
      </td>
      <td className="px-3 py-2.5 align-middle">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-admin-border bg-admin-secondary">
            {collection.imageUrl ? (
              <img
                src={collection.imageUrl}
                alt={collection.imageAltText || collection.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <PhotoIcon className="h-5 w-5 text-admin-text-subdued" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-admin-text">{collection.title}</p>
            {subtitle ? (
              <p className="truncate text-[12px] font-normal text-admin-text-secondary">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </td>
      <td className={`${adminListTableCellRightClass} tabular-nums align-middle`}>
        {collection.productCount ?? 0}
      </td>
      <td className={`${adminListTableCellRightClass} align-middle`}>—</td>
    </tr>
  );
};

export default CollectionsTableItem;
