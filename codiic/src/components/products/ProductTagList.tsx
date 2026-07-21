import React from "react";
import ProductTagItem from "./ProductTagItem";

interface Tag {
  _id: string;
  name: string;
}

interface ProductTagListProps {
  tags: Tag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
}

const ProductTagList: React.FC<ProductTagListProps> = ({
  tags,
  selectedTags,
  onTagSelect,
}) => {
  return (
    <>
      {tags.map(tag => {
        const selected = selectedTags.includes(tag._id);
        return (
          <ProductTagItem
            key={tag._id}
            tag={tag}
            selected={selected}
            onSelect={onTagSelect}
          />
        );
      })}
    </>
  );
};

export default ProductTagList;

