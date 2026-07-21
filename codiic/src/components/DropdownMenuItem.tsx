import React, { useCallback } from 'react';

interface DropdownMenuItemProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ onClick, disabled = false, children }) => {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-2 text-sm text-gray-900 cursor-pointer hover:bg-gray-100 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default DropdownMenuItem;

