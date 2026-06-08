import React, { useCallback } from "react";
import ProductTagList from "./ProductTagList";

interface Tag {
  _id: string;
  name: string;
}

interface ProductTagsMenuProps {
  tags: Tag[];
  selectedTags: string[];
  debouncedQuery: string;
  queryExists: boolean;
  onTagSelect: (tagId: string) => void;
  onCreateTag: () => void;
}

const ProductTagsMenu: React.FC<ProductTagsMenuProps> = ({
  tags,
  selectedTags,
  debouncedQuery,
  queryExists,
  onTagSelect,
  onCreateTag,
}) => {
  const handleMenuMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 max-h-72 overflow-y-auto shadow-lg"
      onMouseDown={handleMenuMouseDown}
    >
      <ProductTagList
        tags={tags}
        selectedTags={selectedTags}
        onTagSelect={onTagSelect}
      />
      {debouncedQuery && !queryExists && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={onCreateTag}
        >
          <span className="font-medium text-gray-800">{`+ ${debouncedQuery}`}</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Tap to create
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductTagsMenu;

