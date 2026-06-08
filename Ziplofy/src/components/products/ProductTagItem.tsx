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
      className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2"
      onClick={handleClick}
    >
      <input
        type="checkbox"
        checked={selected}
        readOnly
        className="w-4 h-4 text-gray-900 focus:ring-gray-900"
      />
      {tag.name}
    </div>
  );
};

export default ProductTagItem;

