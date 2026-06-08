import React from 'react';

interface StatCardProps {
  title: string;
  value?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value = '—', icon }) => (
  <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      </div>
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
