import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function PreviewShell({ children, className = '' }: Props) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[420px] overflow-hidden rounded-lg border border-[#e1e1e1] px-6 py-5 shadow-[0_2px_14px_rgba(0,0,0,0.1)] ${className}`}
    >
      {children}
    </div>
  );
}
