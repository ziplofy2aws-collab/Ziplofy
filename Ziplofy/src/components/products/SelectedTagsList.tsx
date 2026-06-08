import React from "react";
import SelectedTagChip from "./SelectedTagChip";

interface Tag {
  _id: string;
  name: string;
}

interface SelectedTagsListProps {
  tagIds: string[];
  productTags: Tag[];
  onTagRemove: (tagId: string) => void;
}

const SelectedTagsList: React.FC<SelectedTagsListProps> = ({
  tagIds,
  productTags,
  onTagRemove,
}) => {
  if (tagIds.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2.5">
      {tagIds.map(id => {
        const tag = productTags.find(pt => pt._id === id);
        return (
          <SelectedTagChip
            key={id}
            tagName={tag?.name || 'Unknown'}
            onRemove={() => onTagRemove(id)}
          />
        );
      })}
    </div>
  );
};

export default SelectedTagsList;

