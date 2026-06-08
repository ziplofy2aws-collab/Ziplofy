import React from "react";

interface ChipProps {
  label: string;
}

const Chip: React.FC<ChipProps> = ({ label }) => {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
    >
      {label}
    </span>
  );
};

export default Chip;

