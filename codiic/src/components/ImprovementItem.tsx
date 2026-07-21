import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ImprovementItemProps {
  item: ImprovementItem;
  onClick?: (itemId: string) => void;
}

const ImprovementItemComponent: React.FC<ImprovementItemProps> = ({
  item,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick?.(item.id)}
      className="w-full flex items-start gap-3 p-3 bg-page-background-color border border-gray-200/80 rounded-lg hover:bg-blue-50 hover:border-blue-200/80 transition-colors text-left"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        {item.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 mb-1">{item.title}</h4>
        <p className="text-xs text-gray-600">{item.description}</p>
      </div>

      {/* Chevron */}
      <div className="flex-shrink-0">
        <ChevronRightIcon className="w-4 h-4 text-blue-500" />
      </div>
    </button>
  );
};

export default ImprovementItemComponent;

