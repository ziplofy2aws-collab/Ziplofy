import React from 'react';

interface TabButtonProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: (id: string) => void;
  variant?: 'underline' | 'pills';
}

const TabButton: React.FC<TabButtonProps> = ({
  id,
  label,
  isActive,
  onClick,
  variant = 'underline',
}) => {
  if (variant === 'pills') {
    return (
      <button
        type="button"
        onClick={() => onClick(id)}
        className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all sm:px-4 ${
          isActive
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
            : 'border border-gray-200/90 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        isActive
          ? 'text-blue-600 border-blue-600'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
};

export default TabButton;
