'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">{label}</label>}
      <div className="relative">
        {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8a9a93]">{icon}</div>}
        <input
          className={`w-full rounded-2xl border border-white/80 bg-white/75 px-3.5 py-2.5 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition placeholder:text-slate-400 focus:border-emerald-400/70 focus:bg-white/90 focus:ring-4 focus:ring-emerald-500/15 disabled:opacity-60 ${icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
