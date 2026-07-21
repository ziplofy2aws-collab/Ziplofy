import React from 'react';
import { cn } from '../../utils/cn';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error = false,
  helperText,
  fullWidth = false,
  variant = 'outlined',
  size = 'medium',
  startAdornment,
  endAdornment,
  className,
  id,
  ...props
}) => {
  const inputId = id || `textfield-${Math.random().toString(36).substr(2, 9)}`;

  const variants = {
    outlined: 'border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    filled: 'bg-gray-100 border-0 rounded-t-md border-b-2 border-gray-300 focus:border-blue-500',
    standard: 'border-0 border-b border-gray-300 focus:border-blue-500'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-3 py-2 text-base'
  };

  const inputClasses = cn(
    'w-full transition-colors focus:outline-none',
    variants[variant],
    sizes[size],
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    startAdornment && 'pl-10',
    endAdornment && 'pr-10',
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {startAdornment && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {startAdornment}
          </div>
        )}
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {endAdornment}
          </div>
        )}
      </div>
      {helperText && (
        <p className={cn(
          'mt-1 text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
};
