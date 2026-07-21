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
    className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50/80 transition-colors text-left"
  >
    <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
      {icon}
    </div>
    <span className="flex-1 text-sm font-medium text-gray-900">{label}</span>
    {right}
  </button>
);

export default PoliciesRow;

