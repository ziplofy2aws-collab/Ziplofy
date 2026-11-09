'use client';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

const glass =
  'rounded-2xl border border-white/50 bg-white/55 shadow-[0_8px_28px_rgba(15,61,46,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl';

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`${glass} transition-all duration-200 hover:bg-white/65 ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon, change, color = 'emerald' }: {
  title: string; value: string | number; icon: React.ReactNode; change?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    emerald: 'bg-[#eef8f0] text-[#0f766e]',
    blue: 'bg-[#eef6fb] text-[#2563eb]',
    purple: 'bg-[#f5f0ff] text-[#7c3aed]',
    orange: 'bg-[#fff7ed] text-[#ea580c]',
    red: 'bg-[#fef2f2] text-[#dc2626]',
    yellow: 'bg-[#eef8f0] text-[#0f766e]',
  };
  return (
    <div className={`${glass} p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/65 hover:shadow-[0_14px_36px_rgba(15,61,46,0.1)]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6b7a74]">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[#101828]">{value}</p>
          {change && <p className="mt-1 text-xs text-[#0f766e]">{change}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ${colors[color] || colors.emerald}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
