import React from 'react';
import { PhotoIcon, PhotoIcon as ImageIcon, PlusIcon } from '@heroicons/react/24/outline';

interface BrandCoverImageSectionProps {
  coverImageUrl: string;
  coverImageError: boolean;
  onCoverImageUrlChange: (url: string) => void;
  onCoverImageErrorChange: (error: boolean) => void;
  onMarkDirty: () => void;
}

const BrandCoverImageSection: React.FC<BrandCoverImageSectionProps> = ({
  coverImageUrl,
  coverImageError,
  onCoverImageUrlChange,
  onCoverImageErrorChange,
  onMarkDirty,
}) => {
  const handleUrlChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onMarkDirty();
    onCoverImageUrlChange(e.target.value);
    onCoverImageErrorChange(false);
  }, [onMarkDirty, onCoverImageUrlChange, onCoverImageErrorChange]);

  const handleImageError = React.useCallback(() => {
    onCoverImageErrorChange(true);
  }, [onCoverImageErrorChange]);

  return (
    <div className="p-4 mb-8 border border-gray-200 bg-white/95">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Cover Image</h3>
          <p className="text-xs text-gray-600 mb-3">Key image that shows off your brand in profile pages and apps</p>
          <div className="relative mb-3">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
              <ImageIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Enter cover image URL"
              value={coverImageUrl}
              onChange={handleUrlChange}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
          {coverImageUrl && (
            <div className="border border-gray-200 p-3 mb-3 flex items-center justify-center min-h-[160px] bg-gray-50">
              {!coverImageError ? (
                <img
                  src={coverImageUrl}
                  alt="Cover image preview"
                  onError={handleImageError}
                  className="max-w-full max-h-[300px] object-contain"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Failed to load image</p>
                </div>
              )}
            </div>
          )}
          {!coverImageUrl && (
            <div className="border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center min-h-[160px] bg-gray-50">
              <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Add a cover image</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">HEIC, WEBP, SVG, PNG, or JPG. Recommended: 1920x1080 pixels minimum.</p>
        </div>
        <button className="ml-4 w-9 h-9 bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center">
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BrandCoverImageSection;

