import {
  FunnelIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import React from 'react';
import ThemesSearchInput from './ThemesSearchInput';

interface ThemesControlsProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewMode: "grid" | "list";
  onViewModeGrid: () => void;
  onViewModeList: () => void;
}

const ThemesControls: React.FC<ThemesControlsProps> = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeGrid,
  onViewModeList,
}) => {
  return (
    <div className="flex justify-between items-center mb-4 gap-3 flex-col md:flex-row">
      <ThemesSearchInput searchTerm={searchTerm} onSearchChange={onSearchChange} />

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded bg-white text-gray-900 text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50">
          <FunnelIcon className="w-4 h-4" />
          <span>Filter</span>
        </button>

        <div className="flex border border-gray-200 rounded overflow-hidden">
          <button
            className={`px-2 py-1.5 border-none transition-colors flex items-center justify-center ${
              viewMode === "grid"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            onClick={onViewModeGrid}
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>
          <button
            className={`px-2 py-1.5 border-l border-gray-200 transition-colors flex items-center justify-center ${
              viewMode === "list"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            onClick={onViewModeList}
          >
            <ListBulletIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemesControls;

