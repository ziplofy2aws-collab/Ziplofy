'use client';

import type { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  label: string;
  right?: ReactNode;
  onClick?: () => void;
};

export function PoliciesRow({ icon, label, right, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-admin-row-hover"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-admin-fill text-admin-text-secondary">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-admin-text">{label}</span>
      {right}
    </button>
  );
}
