import React from 'react';

interface AttributionMenuProps {
  isOpen: boolean;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const AttributionMenu: React.FC<AttributionMenuProps> = ({
  isOpen,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">Attribution model</p>
        </div>
        <div className="py-1">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                selectedValue === option
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-600">
            A 30-day attribution window applies.{' '}
            <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
              Learn more
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default AttributionMenu;
