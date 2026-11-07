'use client';
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">{label}</label>}
      <select
        className={`w-full rounded-2xl border border-white/80 bg-white/75 px-3.5 py-2.5 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition focus:border-emerald-400/70 focus:bg-white/90 focus:ring-4 focus:ring-emerald-500/15 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
