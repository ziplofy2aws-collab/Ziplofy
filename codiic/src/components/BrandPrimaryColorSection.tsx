import React from 'react';
import { PlusIcon, SwatchIcon as PaletteIcon } from '@heroicons/react/24/outline';

interface BrandPrimaryColorSectionProps {
  primaryColor: string;
  contrastColor: string;
  primaryColorPickerAnchor: HTMLElement | null;
  contrastColorPickerAnchor: HTMLElement | null;
  primaryColorPickerRef: React.RefObject<HTMLDivElement | null>;
  contrastColorPickerRef: React.RefObject<HTMLDivElement | null>;
  onOpenPrimaryColorPicker: (event: React.MouseEvent<HTMLElement>) => void;
  onClosePrimaryColorPicker: () => void;
  onOpenContrastColorPicker: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseContrastColorPicker: () => void;
  onPrimaryColorChange: (color: string) => void;
  onContrastColorChange: (color: string) => void;
  getPopoverPosition: (anchorEl: HTMLElement | null) => { top: number; left: number };
}

const BrandPrimaryColorSection: React.FC<BrandPrimaryColorSectionProps> = ({
  primaryColor,
  contrastColor,
  primaryColorPickerAnchor,
  contrastColorPickerAnchor,
  primaryColorPickerRef,
  contrastColorPickerRef,
  onOpenPrimaryColorPicker,
  onClosePrimaryColorPicker,
  onOpenContrastColorPicker,
  onCloseContrastColorPicker,
  onPrimaryColorChange,
  onContrastColorChange,
  getPopoverPosition,
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Primary</h4>
          <p className="text-xs text-gray-600 mb-3">The brand colors that appear on your store, social media, and more</p>
          {primaryColor ? (
            <div className="mb-3">
              <div className="flex items-center justify-between gap-3 p-3 border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 border border-gray-200"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div>
                    <p className="text-xs text-gray-600">Primary color</p>
                    <p className="text-sm text-gray-900">{primaryColor.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={onOpenPrimaryColorPicker}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <PaletteIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 p-4 flex items-center gap-3 bg-gray-50 mb-3">
              <div className="w-10 h-10 border border-dashed border-gray-300 flex items-center justify-center bg-white">
                <PaletteIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Add a primary color</p>
            </div>
          )}

          {/* Contrast Color */}
          {primaryColor && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Contrast</p>
              {contrastColor ? (
                <div className="flex items-center justify-between gap-3 p-3 border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 border border-gray-200"
                      style={{ backgroundColor: contrastColor }}
                    />
                    <div>
                      <p className="text-xs text-gray-600">Contrast color</p>
                      <p className="text-sm text-gray-900">{contrastColor.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenContrastColorPicker}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <PaletteIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={onOpenContrastColorPicker}
                  className="border border-dashed border-gray-300 p-3 flex items-center gap-3 bg-gray-50 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 border border-dashed border-gray-300 flex items-center justify-center bg-white">
                    <PaletteIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Add a contrast color</p>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onOpenPrimaryColorPicker}
          className="ml-4 w-9 h-9 bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Color Picker Popover */}
      {primaryColorPickerAnchor && (
        <div
          ref={primaryColorPickerRef}
          className="absolute z-50 bg-white border border-gray-200 shadow-lg p-4 min-w-[280px]"
          style={getPopoverPosition(primaryColorPickerAnchor)}
        >
          <h4 className="text-sm font-medium mb-3">Select Primary Color</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor || '#000000'}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                className="w-[50px] h-[50px] border border-gray-200 cursor-pointer"
              />
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">#</span>
                <input
                  type="text"
                  placeholder="000000"
                  value={primaryColor ? primaryColor.replace('#', '') : ''}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                    if (inputValue.length <= 6) {
                      onPrimaryColorChange(`#${inputValue}`);
                    }
                  }}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
            </div>
            <button
              onClick={onClosePrimaryColorPicker}
              className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Contrast Color Picker Popover */}
      {contrastColorPickerAnchor && (
        <div
          ref={contrastColorPickerRef}
          className="absolute z-50 bg-white border border-gray-200 shadow-lg p-4 min-w-[280px]"
          style={getPopoverPosition(contrastColorPickerAnchor)}
        >
          <h4 className="text-sm font-medium mb-3">Select Contrast Color</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={contrastColor || '#ffffff'}
                onChange={(e) => onContrastColorChange(e.target.value)}
                className="w-[50px] h-[50px] border border-gray-200 cursor-pointer"
              />
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">#</span>
                <input
                  type="text"
                  placeholder="ffffff"
                  value={contrastColor ? contrastColor.replace('#', '') : ''}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                    if (inputValue.length <= 6) {
                      onContrastColorChange(`#${inputValue}`);
                    }
                  }}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
            </div>
            <button
              onClick={onCloseContrastColorPicker}
              className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandPrimaryColorSection;

