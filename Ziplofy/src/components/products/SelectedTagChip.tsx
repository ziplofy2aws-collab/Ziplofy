import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useCallback } from "react";

interface SelectedTagChipProps {
  tagName: string;
  onRemove: () => void;
}

const SelectedTagChip: React.FC<SelectedTagChipProps> = ({
  tagName,
  onRemove,
}) => {
  const handleRemoveClick = useCallback(() => {
    onRemove();
  }, [onRemove]);

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-gray-200 rounded text-sm text-gray-700 bg-gray-50">
      {tagName || 'Unknown'}
      <button
        type="button"
        onClick={handleRemoveClick}
        className="text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-3.5 h-3.5" />
      </button>
    </span>
  );
};

export default SelectedTagChip;

