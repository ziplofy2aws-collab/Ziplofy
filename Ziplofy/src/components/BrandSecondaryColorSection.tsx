import React from 'react';
import { PlusIcon, SwatchIcon as PaletteIcon, TrashIcon } from '@heroicons/react/24/outline';

interface BrandSecondaryColorSectionProps {
  secondaryColors: string[];
  secondaryContrastColor: string;
  editingSecondaryColorIndex: number | null;
  tempSecondaryColor: string;
  secondaryColorPickerAnchor: HTMLElement | null;
  secondaryContrastColorPickerAnchor: HTMLElement | null;
  secondaryColorPickerRef: React.RefObject<HTMLDivElement | null>;
  secondaryContrastColorPickerRef: React.RefObject<HTMLDivElement | null>;
  onOpenSecondaryColorPicker: (event: React.MouseEvent<HTMLElement>, index?: number) => void;
  onCloseSecondaryColorPicker: () => void;
  onOpenSecondaryContrastColorPicker: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseSecondaryContrastColorPicker: () => void;
  onAddSecondaryColor: () => void;
  onRemoveSecondaryColor: (index: number) => void;
  onSecondaryContrastColorChange: (color: string) => void;
  onTempSecondaryColorChange: (color: string) => void;
  getPopoverPosition: (anchorEl: HTMLElement | null) => { top: number; left: number };
}

const BrandSecondaryColorSection: React.FC<BrandSecondaryColorSectionProps> = ({
  secondaryColors,
  secondaryContrastColor,
  editingSecondaryColorIndex,
  tempSecondaryColor,
  secondaryColorPickerAnchor,
  secondaryContrastColorPickerAnchor,
  secondaryColorPickerRef,
  secondaryContrastColorPickerRef,
  onOpenSecondaryColorPicker,
  onCloseSecondaryColorPicker,
  onOpenSecondaryContrastColorPicker,
  onCloseSecondaryContrastColorPicker,
  onAddSecondaryColor,
  onRemoveSecondaryColor,
  onSecondaryContrastColorChange,
  onTempSecondaryColorChange,
  getPopoverPosition,
}) => {
  return (
    <div>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Secondary</h4>
          <p className="text-xs text-gray-600 mb-3">Supporting colors used for accents and additional detail</p>

          {/* Display Secondary Colors */}
          {secondaryColors.length > 0 && (
            <div className="mb-3 flex flex-col gap-3">
              {secondaryColors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-3 border border-gray-200 bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <p className="text-xs text-gray-600">Secondary color {index + 1}</p>
                      <p className="text-sm text-gray-900">{color.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => onOpenSecondaryColorPicker(e, index)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <PaletteIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveSecondaryColor(index)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Secondary Color Button */}
          {secondaryColors.length < 2 && (
            <div
              onClick={(e) => onOpenSecondaryColorPicker(e)}
              className={`border border-dashed border-gray-300 p-4 flex items-center gap-3 bg-gray-50 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-colors ${secondaryColors.length > 0 ? 'mb-3' : ''}`}
            >
              <div className="w-10 h-10 border border-dashed border-gray-300 flex items-center justify-center bg-white">
                <PaletteIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Add a secondary color</p>
            </div>
          )}

          {/* Secondary Contrast Color */}
          {secondaryColors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Contrasting color</p>
              {secondaryContrastColor ? (
                <div className="flex items-center justify-between gap-3 p-3 border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 border border-gray-200"
                      style={{ backgroundColor: secondaryContrastColor }}
                    />
                    <div>
                      <p className="text-xs text-gray-600">Contrasting color</p>
                      <p className="text-sm text-gray-900">{secondaryContrastColor.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenSecondaryContrastColorPicker}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <PaletteIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={onOpenSecondaryContrastColorPicker}
                  className="border border-dashed border-gray-300 p-3 flex items-center gap-3 bg-gray-50 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 border border-dashed border-gray-300 flex items-center justify-center bg-white">
                    <PaletteIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Add a contrasting color</p>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={(e) => onOpenSecondaryColorPicker(e)}
          disabled={secondaryColors.length >= 2 && editingSecondaryColorIndex === null}
          className={`ml-4 w-9 h-9 transition-colors flex items-center justify-center ${
            secondaryColors.length >= 2 && editingSecondaryColorIndex === null
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Secondary Color Picker Popover */}
      {secondaryColorPickerAnchor && (
        <div
          ref={secondaryColorPickerRef}
          className="absolute z-50 bg-white border border-gray-200 shadow-lg p-4 min-w-[280px]"
          style={getPopoverPosition(secondaryColorPickerAnchor)}
        >
          <h4 className="text-sm font-medium mb-3">
            {editingSecondaryColorIndex !== null ? 'Edit Secondary Color' : 'Select Secondary Color'}
          </h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={tempSecondaryColor}
                onChange={(e) => onTempSecondaryColorChange(e.target.value)}
                className="w-[50px] h-[50px] border border-gray-200 cursor-pointer"
              />
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">#</span>
                <input
                  type="text"
                  placeholder="000000"
                  value={tempSecondaryColor.replace('#', '')}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                    if (inputValue.length <= 6) {
                      onTempSecondaryColorChange(`#${inputValue}`);
                    }
                  }}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
            </div>
            <button
              onClick={onAddSecondaryColor}
              className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Secondary Contrast Color Picker Popover */}
      {secondaryContrastColorPickerAnchor && (
        <div
          ref={secondaryContrastColorPickerRef}
          className="absolute z-50 bg-white border border-gray-200 shadow-lg p-4 min-w-[280px]"
          style={getPopoverPosition(secondaryContrastColorPickerAnchor)}
        >
          <h4 className="text-sm font-medium mb-3">Select Contrasting Color</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryContrastColor || '#ffffff'}
                onChange={(e) => onSecondaryContrastColorChange(e.target.value)}
                className="w-[50px] h-[50px] border border-gray-200 cursor-pointer"
              />
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">#</span>
                <input
                  type="text"
                  placeholder="ffffff"
                  value={secondaryContrastColor ? secondaryContrastColor.replace('#', '') : ''}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                    if (inputValue.length <= 6) {
                      onSecondaryContrastColorChange(`#${inputValue}`);
                    }
                  }}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
            </div>
            <button
              onClick={onCloseSecondaryContrastColorPicker}
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

export default BrandSecondaryColorSection;

