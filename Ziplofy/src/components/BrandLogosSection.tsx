import React from 'react';
import { PhotoIcon as ImageIcon, PlusIcon } from '@heroicons/react/24/outline';

interface BrandLogosSectionProps {
  defaultLogoUrl: string;
  squareLogoUrl: string;
  defaultLogoError: boolean;
  squareLogoError: boolean;
  onDefaultLogoUrlChange: (url: string) => void;
  onSquareLogoUrlChange: (url: string) => void;
  onDefaultLogoError: (error: boolean) => void;
  onSquareLogoError: (error: boolean) => void;
  markDirty: () => void;
}

const BrandLogosSection: React.FC<BrandLogosSectionProps> = ({
  defaultLogoUrl,
  squareLogoUrl,
  defaultLogoError,
  squareLogoError,
  onDefaultLogoUrlChange,
  onSquareLogoUrlChange,
  onDefaultLogoError,
  onSquareLogoError,
  markDirty,
}) => {
  return (
    <div className="p-4 mb-8 border border-gray-200 bg-white/95 mt-8">
      <h3 className="text-sm font-medium text-gray-900 mb-6">Logos</h3>

      {/* Default Logo */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Default</h4>
            <p className="text-xs text-gray-600 mb-3">Used for most common logo applications</p>
            <div className="relative mb-3">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                <ImageIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Enter logo URL"
                value={defaultLogoUrl}
                onChange={(e) => {
                  markDirty();
                  onDefaultLogoUrlChange(e.target.value);
                  onDefaultLogoError(false);
                }}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
            {defaultLogoUrl && (
              <div className="border border-gray-200 p-3 mb-3 flex items-center justify-center min-h-[120px] bg-gray-50">
                {!defaultLogoError ? (
                  <img
                    src={defaultLogoUrl}
                    alt="Default logo preview"
                    onError={() => onDefaultLogoError(true)}
                    className="max-w-full max-h-[120px] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Failed to load image</p>
                  </div>
                )}
              </div>
            )}
            {!defaultLogoUrl && (
              <div className="border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center min-h-[120px] bg-gray-50">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Add a default logo</p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">HEIC, WEBP, SVG, PNG, or JPG. Recommended width: 512 pixels minimum.</p>
          </div>
          <button className="ml-4 w-9 h-9 bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Square Logo */}
      <div>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Square</h4>
            <p className="text-xs text-gray-600 mb-3">Used by some social media channels. May be cropped into a circle.</p>
            <div className="relative mb-3">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                <ImageIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Enter logo URL"
                value={squareLogoUrl}
                onChange={(e) => {
                  markDirty();
                  onSquareLogoUrlChange(e.target.value);
                  onSquareLogoError(false);
                }}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
            {squareLogoUrl && (
              <div className="border border-gray-200 p-3 mb-3 flex items-center justify-center min-h-[120px] bg-gray-50">
                {!squareLogoError ? (
                  <img
                    src={squareLogoUrl}
                    alt="Square logo preview"
                    onError={() => onSquareLogoError(true)}
                    className="max-w-full max-h-[120px] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Failed to load image</p>
                  </div>
                )}
              </div>
            )}
            {!squareLogoUrl && (
              <div className="border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center min-h-[120px] bg-gray-50">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Add a square logo</p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">HEIC, WEBP, SVG, PNG, or JPG. Recommended: 512x512 pixels minimum.</p>
          </div>
          <button className="ml-4 w-9 h-9 bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hatchful Link */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-cyan-400 flex items-center justify-center">
          <span className="text-xs">🐦</span>
        </div>
        <p className="text-xs text-gray-600">
          No logo?{' '}
          <a
            href="https://hatchful.ziplofy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            Create one with Hatchful
          </a>
        </p>
      </div>
    </div>
  );
};

export default BrandLogosSection;

