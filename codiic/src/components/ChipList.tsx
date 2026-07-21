import React from "react";
import Chip from "./Chip";

interface ChipListProps {
  items: { key: string; label: string }[];
}

const ChipList: React.FC<ChipListProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x) => (
        <Chip key={x.key} label={x.label} />
      ))}
    </div>
  );
};

export default ChipList;

