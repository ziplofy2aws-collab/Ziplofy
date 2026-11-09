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
  warning: 'bg-[#eef8f0] text-[#0f766e] ring-1 ring-inset ring-[#00896F]/20',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15',
  info: 'bg-[#eef8f0]/80 text-[#0f766e] ring-1 ring-inset ring-[#00896F]/15',
  default: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/15',
};

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${className}`}>
      {children}
    </span>
  );
}
