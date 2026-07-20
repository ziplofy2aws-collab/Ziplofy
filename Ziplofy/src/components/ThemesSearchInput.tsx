import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React from 'react';

interface ThemesSearchInputProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ThemesSearchInput: React.FC<ThemesSearchInputProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex-1 max-w-[400px] w-full">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search themes..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm bg-white text-gray-900 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-300"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
    </div>
  );
};

export default ThemesSearchInput;

