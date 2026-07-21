import { PhotoIcon } from "@heroicons/react/24/outline";
import React, { useCallback } from "react";
import type { Collection } from "../../contexts/collection.context";

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
      className={`cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 ${
        isSelected ? "bg-gray-50" : "hover:bg-gray-50/70"
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
          className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
        />
      </td>
      <td className="px-3 py-2.5 align-middle">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
            {collection.imageUrl ? (
              <img
                src={collection.imageUrl}
                alt={collection.imageAltText || collection.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <PhotoIcon className="h-5 w-5 text-gray-300" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-gray-900">{collection.title}</p>
            {subtitle ? (
              <p className="truncate text-[12px] font-normal text-gray-500">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right align-middle text-[13px] tabular-nums text-gray-700">
        {collection.productCount ?? 0}
      </td>
      <td className="px-3 py-2.5 text-right align-middle text-[13px] text-gray-500">
        —
      </td>
    </tr>
  );
};

export default CollectionsTableItem;
