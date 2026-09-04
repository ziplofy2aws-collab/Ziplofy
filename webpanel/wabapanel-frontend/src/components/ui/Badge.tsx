'use client';
import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/15',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15',
  default: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/15',
};

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${className}`}>
      {children}
    </span>
  );
}
