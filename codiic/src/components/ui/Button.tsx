import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'success';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  fullWidth = false,
  startIcon,
  endIcon,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    contained: {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
      error: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
    },
    outlined: {
      primary: "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
      secondary: "border border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500",
      error: "border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500",
      success: "border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500"
    },
    text: {
      primary: "text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
      secondary: "text-gray-600 hover:bg-gray-50 focus:ring-gray-500",
      error: "text-red-600 hover:bg-red-50 focus:ring-red-500",
      success: "text-green-600 hover:bg-green-50 focus:ring-green-500"
    }
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg"
  };

  const classes = cn(
    baseClasses,
    variants[variant][color],
    sizes[size],
    fullWidth && "w-full",
    className
  );

  return (
    <button className={classes} disabled={disabled} {...props}>
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
};
