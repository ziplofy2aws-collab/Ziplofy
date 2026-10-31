import React, { useCallback } from "react";

interface Tag {
  _id: string;
  name: string;
}

interface ProductTagItemProps {
  tag: Tag;
  selected: boolean;
  onSelect: (tagId: string) => void;
}

const ProductTagItem: React.FC<ProductTagItemProps> = ({
  tag,
  selected,
  onSelect,
}) => {
  const handleClick = useCallback(() => {
    onSelect(tag._id);
  }, [tag._id, onSelect]);

  return (
    <div
      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-gray-700 transition-colors hover:bg-gray-50"
      onClick={handleClick}
    >
      <input
        type="checkbox"
        checked={selected}
        readOnly
        className="h-3.5 w-3.5 rounded border-gray-300 text-gray-800 focus:ring-gray-300"
      />
      {tag.name}
    </div>
  );
};

export default ProductTagItem;

