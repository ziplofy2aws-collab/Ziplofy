import React from 'react';
import { cn } from '../../utils/cn';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  variant?: 'filled' | 'outlined';
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium';
  onDelete?: () => void;
  deleteIcon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'filled',
  color = 'default',
  size = 'medium',
  onDelete,
  deleteIcon,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const variants = {
    filled: {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-blue-100 text-blue-800',
      secondary: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800'
    },
    outlined: {
      default: 'border border-gray-300 text-gray-800',
      primary: 'border border-blue-300 text-blue-800',
      secondary: 'border border-gray-300 text-gray-800',
      error: 'border border-red-300 text-red-800',
      info: 'border border-blue-300 text-blue-800',
      success: 'border border-green-300 text-green-800',
      warning: 'border border-yellow-300 text-yellow-800'
    }
  };

  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-sm'
  };

  const classes = cn(
    baseClasses,
    variants[variant][color],
    sizes[size],
    className
  );

  return (
    <div className={classes} {...props}>
      <span>{label}</span>
      {onDelete && (
        <button
          onClick={onDelete}
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
          type="button"
        >
          {deleteIcon || (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};
