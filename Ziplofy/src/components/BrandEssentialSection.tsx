import React from 'react';
import { SwatchIcon as PaletteIcon } from '@heroicons/react/24/outline';

const BrandEssentialSection: React.FC = () => {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-2">ESSENTIAL</h3>
      <p className="text-xs text-gray-600 mb-4">Common brand assets used across apps and channels</p>

      <div className="flex flex-col gap-3">
        {/* Default Logo */}
        <div className="p-3 border border-gray-200 bg-white/95 flex items-center gap-3 cursor-pointer hover:bg-gray-50/95 transition-colors">
          <div className="w-10 h-10 border border-gray-200 flex items-center justify-center bg-gray-50">
            <div className="w-5 h-5 rounded-full bg-gray-300" />
          </div>
          <p className="text-sm text-gray-900">Default Logo</p>
        </div>

        {/* Square Logo */}
        <div className="p-3 border border-gray-200 bg-white/95 flex items-center gap-3 cursor-pointer hover:bg-gray-50/95 transition-colors">
          <div className="w-10 h-10 border border-gray-200 flex items-center justify-center bg-gray-50">
            <div className="w-5 h-5 rounded-full bg-gray-300" />
          </div>
          <p className="text-sm text-gray-900">Square Logo</p>
        </div>

        {/* Colors */}
        <div className="p-3 border border-gray-200 bg-white/95 flex items-center gap-3 cursor-pointer hover:bg-gray-50/95 transition-colors">
          <div className="w-10 h-10 border border-gray-200 flex items-center justify-center bg-gray-50">
            <PaletteIcon className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm text-gray-900">Colors</p>
        </div>
      </div>
    </div>
  );
};

export default BrandEssentialSection;

