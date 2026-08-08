import React from 'react';

interface PoliciesRowProps {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
}

const PoliciesRow: React.FC<PoliciesRowProps> = ({ icon, label, right, onClick }) => (
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

export default PoliciesRow;
