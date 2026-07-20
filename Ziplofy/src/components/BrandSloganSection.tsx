import React from 'react';
import { LanguageIcon, PlusIcon } from '@heroicons/react/24/outline';

interface BrandSloganSectionProps {
  slogan: string;
  showSloganInput: boolean;
  onSloganChange: (value: string) => void;
  onShowSloganInputChange: (show: boolean) => void;
  onMarkDirty: () => void;
}

const BrandSloganSection: React.FC<BrandSloganSectionProps> = ({
  slogan,
  showSloganInput,
  onSloganChange,
  onShowSloganInputChange,
  onMarkDirty,
}) => {
  const handleSloganChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 80) {
      onMarkDirty();
      onSloganChange(value);
    }
  }, [onMarkDirty, onSloganChange]);

  const handleAddClick = React.useCallback(() => {
    if (!showSloganInput && !slogan) {
      onShowSloganInputChange(true);
    }
  }, [showSloganInput, slogan, onShowSloganInputChange]);

  return (
    <div className="p-4 mb-8 border border-gray-200 bg-white/95">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Slogan</h3>
          <p className="text-xs text-gray-600 mb-3">Brand statement or tagline often used along with your logo</p>
          {(showSloganInput || slogan) ? (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter your slogan"
                value={slogan}
                onChange={handleSloganChange}
                maxLength={80}
                className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">{slogan.length}/80 characters</p>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 p-4 flex items-center gap-3 bg-gray-50">
              <div className="w-10 h-10 border border-dashed border-gray-300 flex items-center justify-center bg-white">
                <LanguageIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Add a slogan</p>
            </div>
          )}
        </div>
        <button
          onClick={handleAddClick}
          className="ml-4 w-9 h-9 bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BrandSloganSection;

