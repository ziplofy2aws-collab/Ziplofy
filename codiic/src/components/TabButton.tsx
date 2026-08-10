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
        className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors sm:px-3.5 ${
          isActive
            ? 'bg-admin-text text-white'
            : 'border border-admin-border bg-admin-surface text-admin-text hover:bg-admin-row-hover'
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
      className={`-mb-px border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors ${
        isActive
          ? 'border-admin-text text-admin-text'
          : 'border-transparent text-admin-text-secondary hover:border-admin-border hover:text-admin-text'
      }`}
    >
      {label}
    </button>
  );
};

export default TabButton;
