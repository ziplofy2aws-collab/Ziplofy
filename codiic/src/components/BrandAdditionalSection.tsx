import React from 'react';
import {
  DocumentTextIcon,
  LanguageIcon,
  PhotoIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

const BrandAdditionalSection: React.FC = () => {
  return (
    <div>
      <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-2">ADDITIONAL</h3>
      <p className="text-xs text-gray-600 mb-4">Used by some apps and social media channels</p>

      <div className="flex flex-col gap-3">
        {/* Cover Image */}
        <div className="p-3 border border-gray-200 bg-white/95 flex items-center gap-3 cursor-pointer hover:bg-gray-50/95 transition-colors">
          <div className="w-10 h-10 border border-gray-200 flex items-center justify-center bg-gray-50">
            <PhotoIcon className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm text-gray-900">Cover Image</p>
        </div>

        {/* Slogan */}
        <div className="p-3 border border-gray-200 bg-white/95 flex items-center gap-3 cursor-pointer hover:bg-gray-50/95 transition-colors">
          <div className="w-10 h-10 border border-gray-200 flex items-center justify-center bg-gray-50">
            <LanguageIcon className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm text-gray-900">Slogan</p>
        </div>

        {/* Short Description */}
        <div className="p-3 border border-gray-200 bg-white/95 flex items-center gap-3 cursor-pointer hover:bg-gray-50/95 transition-colors">
          <div className="w-10 h-10 border border-gray-200 flex items-center justify-center bg-gray-50">
            <DocumentTextIcon className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm text-gray-900">Short Description</p>
        </div>

        {/* Social links */}
        <div className="p-3 border border-gray-200 bg-white/95 flex items-center gap-3 cursor-pointer hover:bg-gray-50/95 transition-colors">
          <div className="w-10 h-10 border border-gray-200 flex items-center justify-center bg-gray-50">
            <ShareIcon className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm text-gray-900">Social links</p>
        </div>
      </div>
    </div>
  );
};

export default BrandAdditionalSection;

