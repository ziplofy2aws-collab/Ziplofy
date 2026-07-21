import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface MultiSelectOption {
  value: string;
  label: string;
  secondaryText?: string;
}

interface MultiSelectProps {
  label: string;
  value: string[];
  options: MultiSelectOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  renderValue?: (selected: string[]) => string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  disabled = false,
  renderValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen]);

  const handleSelect = useCallback((optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }, [value, onChange]);

  const handleRemove = useCallback((optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  }, [value, onChange]);

  const getDisplayValue = useCallback(() => {
    if (renderValue) {
      return renderValue(value);
    }
    if (value.length === 0) {
      return placeholder;
    }
    const selectedOptions = options.filter((opt) => value.includes(opt.value));
    return selectedOptions.map((opt) => opt.label).join(", ");
  }, [value, options, placeholder, renderValue]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs text-gray-600 mb-1.5">
        {label}
      </label>
      <div
        onClick={handleToggle}
        className={`
          w-full min-h-[36px] px-3 py-1.5 text-sm border border-gray-200
          bg-white cursor-pointer flex items-center justify-between
          ${disabled ? "bg-gray-50 cursor-not-allowed" : "hover:border-gray-300"}
          ${isOpen ? "border-gray-400 ring-1 ring-gray-400" : ""}
        `}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            <>
              {renderValue ? (
                <span className="text-gray-900">{getDisplayValue()}</span>
              ) : (
                value.slice(0, 3).map((val) => {
                  const option = options.find((opt) => opt.value === val);
                  if (!option) return null;
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs"
                    >
                      {option.label}
                      <button
                        type="button"
                        onClick={(e) => handleRemove(val, e)}
                        className="hover:text-gray-900"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })
              )}
              {value.length > 3 && (
                <span className="text-gray-600 text-xs">+{value.length - 3} more</span>
              )}
            </>
          )}
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-600">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between
                    ${isSelected ? "bg-gray-100" : ""}
                  `}
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{option.label}</div>
                    {option.secondaryText && (
                      <div className="text-xs text-gray-600">{option.secondaryText}</div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 bg-gray-900 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

